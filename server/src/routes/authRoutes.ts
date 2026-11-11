import type { Request } from 'express'
import { z } from 'zod'
import { createSession, requireSession } from '../auth/session'
import type { Reply } from '../http/endpoint'
import { acceptInvite } from '../services/members'
import { listWorkspacesForUser } from '../services/workspaces'

const signInBody = z.object({ email: z.string().email() })

export async function signInHandler(req: Request): Promise<Reply> {
  const { email } = signInBody.parse(req.body)
  const { token, session } = await createSession(email.toLowerCase())
  return { body: { token, user: session } }
}

export async function meHandler(req: Request): Promise<Reply> {
  const session = await requireSession(req)
  const workspaces = await listWorkspacesForUser(session.userId)
  return { body: { user: session, workspaces } }
}

export async function acceptInviteHandler(req: Request): Promise<Reply> {
  const session = await requireSession(req)
  return { body: await acceptInvite(session, String(req.params.token)) }
}
