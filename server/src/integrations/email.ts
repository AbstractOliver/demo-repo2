import { config } from '../config'

export type EmailMessage = {
  to: string
  subject: string
  text: string
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const res = await fetch(`${config.emailApiUrl}/v1/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.emailApiKey}` },
    body: JSON.stringify({ from: 'Acme Invoicing <billing@acme.test>', ...message }),
  })
  if (!res.ok) {
    throw new Error(`Email API answered ${res.status}`)
  }
}
