import type { Request } from 'express'
import { z } from 'zod'
import { requireWorkspace } from '../auth/session'
import type { Reply } from '../http/endpoint'
import { createCustomer, listCustomers } from '../services/customers'

const newCustomerBody = z.object({ name: z.string().min(1), email: z.string().email() })

export async function listCustomersHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req)
  return { body: await listCustomers(ctx.workspaceId) }
}

export async function createCustomerHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req, 'admin')
  const { name, email } = newCustomerBody.parse(req.body)
  return { status: 201, body: await createCustomer(ctx.workspaceId, name, email) }
}
