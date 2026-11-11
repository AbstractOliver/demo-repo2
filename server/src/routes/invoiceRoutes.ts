import type { Request } from 'express'
import { z } from 'zod'
import { requireWorkspace } from '../auth/session'
import type { Reply } from '../http/endpoint'
import { createInvoice, getInvoice, isOverdue, listInvoices, sendInvoice } from '../services/invoices'
import { payInvoice } from '../services/payments'

const listQuery = z.object({ status: z.enum(['draft', 'open', 'paid', 'void']).optional() })

const newInvoiceBody = z.object({
  customerId: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.enum(['EUR', 'SEK', 'USD']).default('EUR'),
  dueDate: z.string().date(),
})

export async function listInvoicesHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req)
  const { status } = listQuery.parse(req.query)
  const invoices = await listInvoices(ctx.workspaceId, status)
  return { body: invoices.map((invoice) => ({ ...invoice, overdue: isOverdue(invoice) })) }
}

export async function getInvoiceHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req)
  const invoice = await getInvoice(ctx.workspaceId, String(req.params.invoiceId))
  return { body: { ...invoice, overdue: isOverdue(invoice) } }
}

export async function createInvoiceHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req, 'admin')
  const invoice = await createInvoice(ctx.workspaceId, newInvoiceBody.parse(req.body))
  return { status: 201, body: invoice }
}

export async function sendInvoiceHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req, 'admin')
  return { body: await sendInvoice(ctx.workspaceId, String(req.params.invoiceId)) }
}

export async function payInvoiceHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req)
  const invoice = await payInvoice(ctx.workspaceId, String(req.params.invoiceId))
  return { body: { ...invoice, overdue: isOverdue(invoice) } }
}
