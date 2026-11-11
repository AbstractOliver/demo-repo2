import type { Role, Session, WorkspaceContext } from '../auth/session'
import { config } from '../config'
import { query, queryOne } from '../db/pool'
import { withTransaction } from '../db/transaction'
import { HttpError } from '../http/errors'
import { newId, newToken } from '../ids'
import { sendEmail } from '../integrations/email'
import { PLANS, type PlanId } from '../plans'
import { getWorkspace } from './workspaces'

export type Member = {
  userId: string
  email: string
  name: string
  role: Role
  joinedAt: string
}

export type Invite = {
  id: string
  email: string
  role: Role
  createdAt: string
}

export type SeatUsage = {
  used: number
  total: number
}

export async function listMembers(workspaceId: string): Promise<Member[]> {
  return query<Member>(
    `select u.id as "userId", u.email, u.name, m.role, m.created_at as "joinedAt"
       from members m join users u on u.id = m.user_id
      where m.workspace_id = $1
      order by m.created_at`,
    [workspaceId],
  )
}

export async function listPendingInvites(workspaceId: string): Promise<Invite[]> {
  return query<Invite>(
    `select id, email, role, created_at as "createdAt"
       from invites
      where workspace_id = $1 and accepted_at is null
      order by created_at`,
    [workspaceId],
  )
}

export async function getSeatUsage(workspaceId: string): Promise<SeatUsage> {
  const workspace = await getWorkspace(workspaceId)
  const counts = await queryOne<{ members: number; invites: number }>(
    `select (select count(*) from members where workspace_id = $1)::int as members,
            (select count(*) from invites where workspace_id = $1 and accepted_at is null)::int as invites`,
    [workspaceId],
  )
  return {
    used: (counts?.members ?? 0) + (counts?.invites ?? 0),
    total: PLANS[workspace.plan].seats,
  }
}

export async function inviteMember(ctx: WorkspaceContext, email: string, role: Role): Promise<Invite> {
  const seats = await getSeatUsage(ctx.workspaceId)
  if (seats.used >= seats.total) {
    throw new HttpError(409, 'No free seats on your plan')
  }
  const token = newToken()
  const invite = await queryOne<Invite>(
    `insert into invites (id, workspace_id, email, role, token, invited_by)
     values ($1, $2, $3, $4, $5, $6)
     returning id, email, role, created_at as "createdAt"`,
    [newId('inv'), ctx.workspaceId, email.toLowerCase(), role, token, ctx.userId],
  )
  const workspace = await getWorkspace(ctx.workspaceId)
  await sendEmail({
    to: email,
    subject: `Join ${workspace.name} on Acme Invoicing`,
    text: `You've been invited to ${workspace.name}. Accept here: ${config.appUrl}/invites/${token}`,
  })
  return invite!
}

export async function removeMember(ctx: WorkspaceContext, userId: string): Promise<void> {
  const member = await queryOne<{ role: Role }>('select role from members where workspace_id = $1 and user_id = $2', [
    ctx.workspaceId,
    userId,
  ])
  if (!member) {
    throw new HttpError(404, 'No such member')
  }
  if (member.role === 'owner') {
    throw new HttpError(409, 'The owner cannot be removed')
  }
  await query('delete from members where workspace_id = $1 and user_id = $2', [ctx.workspaceId, userId])
}

export async function acceptInvite(session: Session, token: string): Promise<{ workspaceId: string }> {
  return withTransaction(async (client) => {
    const [invite] = await client.query<{ id: string; workspaceId: string; email: string; role: Role; acceptedAt: string | null }>(
      `select id, workspace_id as "workspaceId", email, role, accepted_at as "acceptedAt"
         from invites
        where token = $1
          for update`,
      [token],
    )
    if (!invite || invite.acceptedAt) {
      throw new HttpError(404, 'This invite is no longer valid')
    }
    if (invite.email !== session.email.toLowerCase()) {
      throw new HttpError(403, 'This invite was sent to a different email address')
    }
    const [workspace] = await client.query<{ plan: PlanId }>('select plan from workspaces where id = $1 for update', [
      invite.workspaceId,
    ])
    const [members] = await client.query<{ count: number }>(
      'select count(*)::int as count from members where workspace_id = $1',
      [invite.workspaceId],
    )
    if (members!.count > PLANS[workspace!.plan].seats) {
      throw new HttpError(409, 'This workspace has no free seats')
    }
    await client.query(
      'insert into members (workspace_id, user_id, role) values ($1, $2, $3) on conflict do nothing',
      [invite.workspaceId, session.userId, invite.role],
    )
    await client.query('update invites set accepted_at = now() where id = $1', [invite.id])
    return { workspaceId: invite.workspaceId }
  })
}
