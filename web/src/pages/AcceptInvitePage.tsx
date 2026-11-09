import { useState } from 'react'
import { useParams } from 'react-router'
import { api } from '../api'

export function AcceptInvitePage() {
  const { token } = useParams()
  const [error, setError] = useState<string | null>(null)

  async function accept() {
    try {
      const { workspaceId } = await api<{ workspaceId: string }>(`/invites/${token}/accept`, { method: 'POST' })
      window.location.assign(`/w/${workspaceId}/invoices`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="centered">
      <div className="card sign-in">
        <h1>You're invited</h1>
        <p className="muted">Join the workspace to see its invoices and customers.</p>
        {error && <p className="error">{error}</p>}
        <button onClick={accept}>Accept invite</button>
      </div>
    </div>
  )
}
