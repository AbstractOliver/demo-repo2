import type { Request, Response } from 'express'
import { z } from 'zod'
import { requireWorkspace } from '../auth/session'
import { createCustomer, listCustomers } from '../services/customers'

const newCustomerBody = z.object({ name: z.string().min(1), email: z.string().email() })

export async function listCustomersHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req)
  res.json(await listCustomers(ctx.workspaceId))
}

export async function createCustomerHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req, 'admin')
  const { name, email } = newCustomerBody.parse(req.body)
  res.status(201).json(await createCustomer(ctx.workspaceId, name, email))
}
