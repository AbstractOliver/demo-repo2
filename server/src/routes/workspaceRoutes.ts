import type { Request, Response } from 'express'
import { requireWorkspace } from '../auth/session'
import { PLANS } from '../plans'
import { getSeatUsage } from '../services/members'
import { getWorkspace } from '../services/workspaces'

export async function getWorkspaceHandler(req: Request, res: Response) {
  const ctx = await requireWorkspace(req)
  const workspace = await getWorkspace(ctx.workspaceId)
  const seats = await getSeatUsage(ctx.workspaceId)
  res.json({ ...workspace, planDetails: PLANS[workspace.plan], seats, role: ctx.role })
}
