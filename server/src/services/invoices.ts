import { query, queryOne } from '../db/pool'
import { withTransaction } from '../db/transaction'
import { HttpError } from '../http/errors'
import { newId } from '../ids'
import { emailInvoice } from './notifications'

export { formatMoney } from './notifications'

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void'

export type Invoice = {
  id: string
  customerId: string
  customerName: string
  number: string
  amountCents: number
  currency: string
  status: InvoiceStatus
  dueDate: string
  createdAt: string
}

export type NewInvoice = {
  customerId: string
  amountCents: number
  currency: string
  dueDate: string
  sendNow?: boolean
}

const INVOICE_SELECT = `
  select i.id, i.customer_id as "customerId", c.name as "customerName", i.number,
         i.amount_cents as "amountCents", i.currency, i.status,
         to_char(i.due_date, 'YYYY-MM-DD') as "dueDate", i.created_at as "createdAt"
    from invoices i join customers c on c.id = i.customer_id`

export async function listInvoices(workspaceId: string, status?: InvoiceStatus): Promise<Invoice[]> {
  if (status) {
    return query<Invoice>(`${INVOICE_SELECT} where i.workspace_id = $1 and i.status = $2 order by i.due_date`, [
      workspaceId,
      status,
    ])
  }
  return query<Invoice>(`${INVOICE_SELECT} where i.workspace_id = $1 order by i.due_date`, [workspaceId])
}

export async function getInvoice(workspaceId: string, invoiceId: string): Promise<Invoice> {
  const invoice = await queryOne<Invoice>(`${INVOICE_SELECT} where i.workspace_id = $1 and i.id = $2`, [
    workspaceId,
    invoiceId,
  ])
  if (!invoice) {
    throw new HttpError(404, 'Invoice not found')
  }
  return invoice
}

export async function createInvoice(workspaceId: string, input: NewInvoice): Promise<Invoice> {
  const invoiceId = await withTransaction(async (client) => {
    const [customer] = await client.query<{ id: string; email: string }>(
      'select id, email from customers where workspace_id = $1 and id = $2',
      [workspaceId, input.customerId],
    )
    if (!customer) {
      throw new HttpError(400, 'Unknown customer')
    }
    const [counter] = await client.query<{ value: number; prefix: string }>(
      `update workspaces set invoice_counter = invoice_counter + 1 where id = $1
       returning invoice_counter as value, upper(left(regexp_replace(name, '[^A-Za-z]', '', 'g'), 2)) as prefix`,
      [workspaceId],
    )
    const id = newId('inv')
    const number = `${counter!.prefix}-${String(counter!.value).padStart(4, '0')}`
    await client.query(
      `insert into invoices (id, workspace_id, customer_id, number, amount_cents, currency, due_date, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        workspaceId,
        input.customerId,
        number,
        input.amountCents,
        input.currency,
        input.dueDate,
        input.sendNow ? 'open' : 'draft',
      ],
    )
    if (input.sendNow) {
      // Send in the same transaction, so a failed send leaves no open invoice behind.
      await emailInvoice({
        to: customer.email,
        invoiceId: id,
        number,
        amountCents: input.amountCents,
        currency: input.currency,
        dueDate: input.dueDate,
      })
    }
    return id
  })
  return getInvoice(workspaceId, invoiceId)
}

export async function sendInvoice(workspaceId: string, invoiceId: string): Promise<Invoice> {
  const updated = await query(
    `update invoices set status = 'open' where workspace_id = $1 and id = $2 and status = 'draft' returning id`,
    [workspaceId, invoiceId],
  )
  if (updated.length === 0) {
    throw new HttpError(409, 'Only draft invoices can be sent')
  }
  const invoice = await getInvoice(workspaceId, invoiceId)
  const customer = await queryOne<{ email: string }>('select email from customers where id = $1', [invoice.customerId])
  await emailInvoice({
    to: customer!.email,
    invoiceId: invoice.id,
    number: invoice.number,
    amountCents: invoice.amountCents,
    currency: invoice.currency,
    dueDate: invoice.dueDate,
  })
  return invoice
}

export function isOverdue(invoice: Invoice, today = new Date()): boolean {
  return invoice.status === 'open' && invoice.dueDate < today.toISOString().slice(0, 10)
}
