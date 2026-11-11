import { connect, queryOne } from '../db/pool'
import { HttpError } from '../http/errors'
import { newId } from '../ids'
import { chargeCard, type Charge } from '../integrations/payments'
import { getInvoice, type Invoice } from './invoices'

export async function payInvoice(workspaceId: string, invoiceId: string): Promise<Invoice> {
  const invoice = await getInvoice(workspaceId, invoiceId)
  if (invoice.status === 'paid') {
    return invoice
  }
  if (invoice.status !== 'open') {
    throw new HttpError(409, 'Only open invoices can be paid')
  }
  const card = await queryOne<{ paymentMethodId: string | null }>(
    'select card_payment_method_id as "paymentMethodId" from customers where workspace_id = $1 and id = $2',
    [workspaceId, invoice.customerId],
  )
  if (!card?.paymentMethodId) {
    throw new HttpError(409, 'The customer has no card on file')
  }
  const charge = await chargeCard({
    amountCents: invoice.amountCents,
    currency: invoice.currency,
    paymentMethodId: card.paymentMethodId,
    idempotencyKey: `invoice-${invoice.id}-${card.paymentMethodId}`,
  })
  if (charge.status !== 'succeeded') {
    throw new HttpError(402, charge.failureMessage ?? 'The card was declined')
  }
  await recordPayment(workspaceId, invoice.id, charge)
  return getInvoice(workspaceId, invoice.id)
}

async function recordPayment(workspaceId: string, invoiceId: string, charge: Charge): Promise<void> {
  const client = await connect()
  await client.query('BEGIN')
  const [invoice] = await client.query<{ status: string }>(
    'select status from invoices where workspace_id = $1 and id = $2 for update',
    [workspaceId, invoiceId],
  )
  if (invoice?.status === 'paid') {
    return
  }
  await client.query(
    `insert into payments (id, workspace_id, invoice_id, amount_cents, currency, provider_charge_id)
     values ($1, $2, $3, $4, $5, $6)`,
    [newId('pay'), workspaceId, invoiceId, charge.amountCents, charge.currency, charge.id],
  )
  await client.query(`update invoices set status = 'paid' where id = $1`, [invoiceId])
  await client.query('COMMIT')
  client.release()
}
