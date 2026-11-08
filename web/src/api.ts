export type Role = 'owner' | 'admin' | 'member'
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void'

export type User = { userId: string; email: string; name: string }

export type WorkspaceSummary = {
  id: string
  name: string
  plan: string
  role: Role
  planDetails: { name: string; seats: number }
}

export type Workspace = WorkspaceSummary & { seats: SeatUsage }

export type SeatUsage = { used: number; total: number }

export type Invoice = {
  id: string
  customerId: string
  customerName: string
  number: string
  amountCents: number
  currency: string
  status: InvoiceStatus
  dueDate: string
  overdue: boolean
}

export type Customer = { id: string; name: string; email: string }

export type Member = { userId: string; email: string; name: string; role: Role; joinedAt: string }

export type Invite = { id: string; email: string; role: Role; createdAt: string }

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

const TOKEN_KEY = 'acme.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    method: init.method ?? 'GET',
    headers: {
      ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  if (res.status === 204) {
    return undefined as T
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`)
  }
  return data as T
}
