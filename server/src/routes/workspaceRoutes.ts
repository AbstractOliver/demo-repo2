import type { Request } from 'express'
import { requireWorkspace } from '../auth/session'
import type { Reply } from '../http/endpoint'
import { PLANS } from '../plans'
import { getSeatUsage } from '../services/members'
import { getWorkspace } from '../services/workspaces'

export async function getWorkspaceHandler(req: Request): Promise<Reply> {
  const ctx = await requireWorkspace(req)
  const workspace = await getWorkspace(ctx.workspaceId)
  const seats = await getSeatUsage(ctx.workspaceId)
  return { body: { ...workspace, planDetails: PLANS[workspace.plan], seats, role: ctx.role } }
}
