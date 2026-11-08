import { query, queryOne } from '../db/pool'
import { newId } from '../ids'

export type Customer = {
  id: string
  name: string
  email: string
  createdAt: string
}

export async function listCustomers(workspaceId: string): Promise<Customer[]> {
  return query<Customer>(
    'select id, name, email, created_at as "createdAt" from customers where workspace_id = $1 order by name',
    [workspaceId],
  )
}

export async function createCustomer(workspaceId: string, name: string, email: string): Promise<Customer> {
  const customer = await queryOne<Customer>(
    `insert into customers (id, workspace_id, name, email) values ($1, $2, $3, $4)
     returning id, name, email, created_at as "createdAt"`,
    [newId('cus'), workspaceId, name, email.toLowerCase()],
  )
  return customer!
}
