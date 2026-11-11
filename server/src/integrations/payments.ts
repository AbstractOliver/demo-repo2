import { config } from '../config'

export type ChargeRequest = {
  amountCents: number
  currency: string
  paymentMethodId: string
  idempotencyKey: string
}

export type Charge = {
  id: string
  status: 'succeeded' | 'failed'
  amountCents: number
  currency: string
  failureMessage?: string
}

export async function chargeCard(request: ChargeRequest): Promise<Charge> {
  const res = await fetch(`${config.paymentsApiUrl}/v1/charges`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.paymentsApiKey}`,
      'idempotency-key': request.idempotencyKey,
    },
    body: JSON.stringify({
      amount: request.amountCents,
      currency: request.currency.toLowerCase(),
      payment_method: request.paymentMethodId,
    }),
  })
  if (!res.ok && res.status !== 402) {
    throw new Error(`Payments API answered ${res.status}`)
  }
  const body = (await res.json()) as { id: string; status: string; amount: number; currency: string; failure_message?: string }
  return {
    id: body.id,
    status: body.status === 'succeeded' ? 'succeeded' : 'failed',
    amountCents: body.amount,
    currency: body.currency.toUpperCase(),
    failureMessage: body.failure_message,
  }
}
