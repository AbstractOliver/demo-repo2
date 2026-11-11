import { NavLink, Navigate, Outlet, Route, Routes, useParams } from 'react-router'
import { AcceptInvitePage } from './pages/AcceptInvitePage'
import { CustomersPage } from './pages/CustomersPage'
import { InvoicePage } from './pages/InvoicePage'
import { InvoicesPage } from './pages/InvoicesPage'
import { MembersPage } from './pages/MembersPage'
import { SignInPage } from './pages/SignInPage'
import { useSession } from './session'

export function App() {
  const { user, workspaces, loading } = useSession()

  if (loading) {
    return <div className="centered muted">Loading…</div>
  }
  if (!user) {
    return <SignInPage />
  }

  const first = workspaces[0]
  return (
    <Routes>
      <Route path="/invites/:token" element={<AcceptInvitePage />} />
      <Route path="/w/:workspaceId" element={<WorkspaceLayout />}>
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:invoiceId" element={<InvoicePage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route index element={<Navigate to="invoices" replace />} />
      </Route>
      <Route path="*" element={first ? <Navigate to={`/w/${first.id}/invoices`} replace /> : <NoWorkspace />} />
    </Routes>
  )
}

function WorkspaceLayout() {
  const { workspaceId } = useParams()
  const { user, workspaces, signOut } = useSession()
  const workspace = workspaces.find((candidate) => candidate.id === workspaceId)

  if (!workspace) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Acme Invoicing</div>
        <select
          className="workspace-switcher"
          value={workspace.id}
          onChange={(event) => (window.location.href = `/w/${event.target.value}/invoices`)}
        >
          {workspaces.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
        <nav>
          <NavLink to="invoices">Invoices</NavLink>
          <NavLink to="customers">Customers</NavLink>
          <NavLink to="members">Members</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="muted">{user?.email}</div>
          <button className="link" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

function NoWorkspace() {
  return <div className="centered muted">You're not a member of any workspace yet.</div>
}
