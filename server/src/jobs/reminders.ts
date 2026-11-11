import { query } from '../db/pool'
import { sendEmail } from '../integrations/email'
import { logError, logEvent } from '../log'
import { formatMoney, isOverdue, listInvoices } from '../services/invoices'

export async function sendOverdueReminders(today = new Date()): Promise<number> {
  const workspaces = await query<{ id: string; name: string }>('select id, name from workspaces')
  let sent = 0
  for (const workspace of workspaces) {
    const invoices = await listInvoices(workspace.id, 'open')
    for (const invoice of invoices.filter((candidate) => isOverdue(candidate, today))) {
      const [customer] = await query<{ email: string }>('select email from customers where id = $1', [
        invoice.customerId,
      ])
      if (!customer) {
        continue
      }
      await sendEmail({
        to: customer.email,
        subject: `Reminder: invoice ${invoice.number} from ${workspace.name} is overdue`,
        text: `Invoice ${invoice.number} for ${formatMoney(invoice.amountCents, invoice.currency)} was due ${invoice.dueDate}.`,
      })
      sent++
    }
  }
  return sent
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sendOverdueReminders()
    .then((sent) => {
      logEvent('reminders_sent', { count: sent })
      process.exit(0)
    })
    .catch((err) => {
      logError('reminders_failed', err)
      process.exit(1)
    })
}
