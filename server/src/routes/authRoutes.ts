import type { Request, Response } from 'express'
import { z } from 'zod'
import { createSession, requireSession } from '../auth/session'
import { acceptInvite } from '../services/members'
import { listWorkspacesForUser } from '../services/workspaces'

const signInBody = z.object({ email: z.string().email() })

export async function signInHandler(req: Request, res: Response) {
  const { email } = signInBody.parse(req.body)
  const { token, session } = await createSession(email.toLowerCase())
  res.json({ token, user: session })
}

export async function meHandler(req: Request, res: Response) {
  const session = await requireSession(req)
  const workspaces = await listWorkspacesForUser(session.userId)
  res.json({ user: session, workspaces })
}

export async function acceptInviteHandler(req: Request, res: Response) {
  const session = await requireSession(req)
  res.json(await acceptInvite(session, String(req.params.token)))
}
