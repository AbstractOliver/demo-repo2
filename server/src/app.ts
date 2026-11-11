import express from 'express'
import { endpoint, handleErrors } from './http/endpoint'
import { acceptInviteHandler, meHandler, signInHandler } from './routes/authRoutes'
import { createCustomerHandler, listCustomersHandler } from './routes/customerRoutes'
import {
  createInvoiceHandler,
  getInvoiceHandler,
  listInvoicesHandler,
  payInvoiceHandler,
  sendInvoiceHandler,
} from './routes/invoiceRoutes'
import { inviteMemberHandler, listMembersHandler, removeMemberHandler } from './routes/memberRoutes'
import { getWorkspaceHandler } from './routes/workspaceRoutes'

export function createApp() {
  const app = express()
  app.use(express.json())

  app.get(
    '/api/health',
    endpoint(async () => ({ body: { ok: true } })),
  )
  app.post('/api/sign-in', endpoint(signInHandler))
  app.get('/api/me', endpoint(meHandler))
  app.post('/api/invites/:token/accept', endpoint(acceptInviteHandler))

  app.get('/api/workspaces/:workspaceId', endpoint(getWorkspaceHandler))
  app.get('/api/workspaces/:workspaceId/customers', endpoint(listCustomersHandler))
  app.post('/api/workspaces/:workspaceId/customers', endpoint(createCustomerHandler))
  app.get('/api/workspaces/:workspaceId/invoices', endpoint(listInvoicesHandler))
  app.post('/api/workspaces/:workspaceId/invoices', endpoint(createInvoiceHandler))
  app.get('/api/workspaces/:workspaceId/invoices/:invoiceId', endpoint(getInvoiceHandler))
  app.post('/api/workspaces/:workspaceId/invoices/:invoiceId/send', endpoint(sendInvoiceHandler))
  app.post('/api/workspaces/:workspaceId/invoices/:invoiceId/pay', endpoint(payInvoiceHandler))
  app.get('/api/workspaces/:workspaceId/members', endpoint(listMembersHandler))
  app.post('/api/workspaces/:workspaceId/invites', endpoint(inviteMemberHandler))
  app.delete('/api/workspaces/:workspaceId/members/:userId', endpoint(removeMemberHandler))

  app.use(handleErrors)
  return app
}
