import type { Request, Response } from 'express'
import { z } from 'zod'
import { requireWorkspace } from '../auth/session'
import { getSeatUsage, inviteMember, listMembers, listPendingInvites, removeMember } from '../services/members'

const inviteBody = z.object({ email: z.string().email(), role: z.enum(['admin', 'member']).default('member') })

export async function listMembersHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req)
  const [members, invites, seats] = await Promise.all([
    listMembers(ctx.workspaceId),
    listPendingInvites(ctx.workspaceId),
    getSeatUsage(ctx.workspaceId),
  ])
  res.json({ members, invites, seats })
}

export async function inviteMemberHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req, 'admin')
  const { email, role } = inviteBody.parse(req.body)
  res.status(201).json(await inviteMember(ctx, email, role))
}

export async function removeMemberHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req, 'admin')
  await removeMember(ctx, String(req.params.userId))
  res.status(204).end()
}
