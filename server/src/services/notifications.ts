import { config } from '../config'
import { sendEmail } from '../integrations/email'

export type InvoiceNotice = {
  to: string
  invoiceId: string
  number: string
  amountCents: number
  currency: string
  dueDate: string
}

export async function emailInvoice(notice: InvoiceNotice): Promise<void> {
  await sendEmail({
    to: notice.to,
    subject: `Invoice ${notice.number}`,
    text: `You have a new invoice of ${formatMoney(notice.amountCents, notice.currency)}, due ${notice.dueDate}. View it here: ${config.appUrl}/pay/${notice.invoiceId}`,
  })
}

export function formatMoney(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(amountCents / 100)
}
