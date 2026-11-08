import express from 'express'
import { handleErrors } from './http/errors'
import { meHandler, signInHandler } from './routes/authRoutes'
import { createCustomerHandler, listCustomersHandler } from './routes/customerRoutes'
import {
  createInvoiceHandler,
  getInvoiceHandler,
  listInvoicesHandler,
  sendInvoiceHandler,
} from './routes/invoiceRoutes'
import { inviteMemberHandler, listMembersHandler, removeMemberHandler } from './routes/memberRoutes'
import { getWorkspaceHandler } from './routes/workspaceRoutes'

export function createApp() {
  const app = express()
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })
  app.post('/api/sign-in', signInHandler)
  app.get('/api/me', meHandler)

  app.get('/api/workspaces/:workspaceId', getWorkspaceHandler)
  app.get('/api/workspaces/:workspaceId/customers', listCustomersHandler)
  app.post('/api/workspaces/:workspaceId/customers', createCustomerHandler)
  app.get('/api/workspaces/:workspaceId/invoices', listInvoicesHandler)
  app.post('/api/workspaces/:workspaceId/invoices', createInvoiceHandler)
  app.get('/api/workspaces/:workspaceId/invoices/:invoiceId', getInvoiceHandler)
  app.post('/api/workspaces/:workspaceId/invoices/:invoiceId/send', sendInvoiceHandler)
  app.get('/api/workspaces/:workspaceId/members', listMembersHandler)
  app.post('/api/workspaces/:workspaceId/invites', inviteMemberHandler)
  app.delete('/api/workspaces/:workspaceId/members/:userId', removeMemberHandler)

  app.use(handleErrors)
  return app
}
