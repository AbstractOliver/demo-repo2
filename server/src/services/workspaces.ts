import { query, queryOne } from '../db/pool'
import { HttpError } from '../http/errors'
import { PLANS, type Plan, type PlanId } from '../plans'

export type Workspace = {
  id: string
  name: string
  plan: PlanId
}

export type WorkspaceSummary = Workspace & {
  planDetails: Plan
  role: string
}

export async function getWorkspace(workspaceId: string): Promise<Workspace> {
  const workspace = await queryOne<Workspace>('select id, name, plan from workspaces where id = $1', [workspaceId])
  if (!workspace) {
    throw new HttpError(404, 'Workspace not found')
  }
  return workspace
}

export async function listWorkspacesForUser(userId: string): Promise<WorkspaceSummary[]> {
  const rows = await query<Workspace & { role: string }>(
    `select w.id, w.name, w.plan, m.role
       from workspaces w join members m on m.workspace_id = w.id
      where m.user_id = $1
      order by w.name`,
    [userId],
  )
  return rows.map((row) => ({ ...row, planDetails: PLANS[row.plan] }))
}
