import type { Request } from 'express'
import { z } from 'zod'
import { requireWorkspace } from '../auth/session'
import type { Reply } from '../http/endpoint'
import { getSeatUsage, inviteMember, listMembers, listPendingInvites, removeMember } from '../services/members'

const inviteBody = z.object({ email: z.string().email(), role: z.enum(['admin', 'member']).default('member') })

export async function listMembersHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req)
  const [members, invites, seats] = await Promise.all([
    listMembers(ctx.workspaceId),
    listPendingInvites(ctx.workspaceId),
    getSeatUsage(ctx.workspaceId),
  ])
  return { body: { members, invites, seats } }
}

export async function inviteMemberHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req, 'admin')
  const { email, role } = inviteBody.parse(req.body)
  return { status: 201, body: await inviteMember(ctx, email, role) }
}

export async function removeMemberHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req, 'admin')
  await removeMember(ctx, String(req.params.userId))
  return { status: 204 }
}
