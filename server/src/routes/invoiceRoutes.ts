import type { Request, Response } from 'express'
import { z } from 'zod'
import { requireWorkspace } from '../auth/session'
import { createInvoice, getInvoice, isOverdue, listInvoices, sendInvoice } from '../services/invoices'
import { payInvoice } from '../services/payments'

const payBody = z.object({ paymentMethodId: z.string().min(1) })

const listQuery = z.object({ status: z.enum(['draft', 'open', 'paid', 'void']).optional() })

const newInvoiceBody = z.object({
  customerId: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.enum(['EUR', 'SEK', 'USD']).default('EUR'),
  dueDate: z.string().date(),
})

export async function listInvoicesHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req)
  const { status } = listQuery.parse(req.query)
  const invoices = await listInvoices(ctx.workspaceId, status)
  res.json(invoices.map((invoice) => ({ ...invoice, overdue: isOverdue(invoice) })))
}

export async function getInvoiceHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req)
  const invoice = await getInvoice(ctx.workspaceId, String(req.params.invoiceId))
  res.json({ ...invoice, overdue: isOverdue(invoice) })
}

export async function createInvoiceHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req, 'admin')
  const invoice = await createInvoice(ctx.workspaceId, newInvoiceBody.parse(req.body))
  res.status(201).json(invoice)
}

export async function sendInvoiceHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req, 'admin')
  const invoice = await sendInvoice(ctx.workspaceId, String(req.params.invoiceId))
  res.json(invoice)
}

export async function payInvoiceHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req)
  const { paymentMethodId } = payBody.parse(req.body)
  const invoice = await payInvoice(ctx.workspaceId, String(req.params.invoiceId), paymentMethodId)
  res.json({ ...invoice, overdue: isOverdue(invoice) })
}
