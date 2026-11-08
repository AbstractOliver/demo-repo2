import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router'
import { api, type Invite, type Member, type SeatUsage } from '../api'
import { useApi } from '../useApi'

type MembersResponse = { members: Member[]; invites: Invite[]; seats: SeatUsage }

export function MembersPage() {
  const { workspaceId } = useParams()
  const { data, error, reload } = useApi<MembersResponse>(`/workspaces/${workspaceId}/members`)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function invite(event: FormEvent) {
    event.preventDefault()
    try {
      await api(`/workspaces/${workspaceId}/invites`, { method: 'POST', body: { email } })
      setEmail('')
      setFormError(null)
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    }
  }

  const full = data ? data.seats.used >= data.seats.total : false

  return (
    <>
      <header className="page-header">
        <h1>Members</h1>
        {data && (
          <span className={full ? 'badge badge-overdue' : 'badge'}>
            {data.seats.used} of {data.seats.total} seats used
          </span>
        )}
      </header>
      <form className="inline-form" onSubmit={invite}>
        <input placeholder="colleague@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="submit" disabled={full}>
          Send invite
        </button>
      </form>
      {(error || formError) && <p className="error">{error ?? formError}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {data?.members.map((member) => (
            <tr key={member.userId}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.role}</td>
            </tr>
          ))}
          {data?.invites.map((pending) => (
            <tr key={pending.id} className="muted">
              <td>Invited</td>
              <td>{pending.email}</td>
              <td>{pending.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
