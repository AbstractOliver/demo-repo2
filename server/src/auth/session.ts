import type { Request } from 'express'
import { query, queryOne } from '../db/pool'
import { HttpError } from '../http/errors'
import { newToken } from '../ids'

export type Role = 'owner' | 'admin' | 'member'

export type Session = {
  userId: string
  email: string
  name: string
}

export type WorkspaceContext = {
  workspaceId: string
  userId: string
  role: Role
}

const ROLE_RANK: Record<Role, number> = { member: 0, admin: 1, owner: 2 }

export async function requireSession(req: Request): Promise<Session> {
  const token = req.header('authorization')?.replace(/^Bearer /, '')
  if (!token) {
    throw new HttpError(401, 'Not signed in')
  }
  const session = await queryOne<Session>(
    `select u.id as "userId", u.email, u.name
       from sessions s join users u on u.id = s.user_id
      where s.token = $1 and s.expires_at > now()`,
    [token],
  )
  if (!session) {
    throw new HttpError(401, 'Session expired')
  }
  return session
}

export async function requireWorkspace(req: Request, minimumRole: Role = 'member'): Promise<WorkspaceContext> {
  const session = await requireSession(req)
  const workspaceId = String(req.params.workspaceId)
  const membership = await queryOne<{ role: Role }>(
    'select role from members where workspace_id = $1 and user_id = $2',
    [workspaceId, session.userId],
  )
  if (!membership) {
    throw new HttpError(404, 'Workspace not found')
  }
  if (ROLE_RANK[membership.role] < ROLE_RANK[minimumRole]) {
    throw new HttpError(403, 'You need a higher role for this')
  }
  return { workspaceId, userId: session.userId, role: membership.role }
}

export async function createSession(email: string): Promise<{ token: string; session: Session }> {
  const user = await queryOne<Session>('select id as "userId", email, name from users where email = $1', [email])
  if (!user) {
    throw new HttpError(404, 'No user with that email')
  }
  const token = newToken()
  await query(`insert into sessions (token, user_id, expires_at) values ($1, $2, now() + interval '30 days')`, [
    token,
    user.userId,
  ])
  return { token, session: user }
}
