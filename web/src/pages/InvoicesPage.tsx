import { useState } from 'react'
import { Link, useParams } from 'react-router'
import type { Invoice, InvoiceStatus } from '../api'
import { Money } from '../components/Money'
import { StatusBadge } from '../components/StatusBadge'
import { useApi } from '../useApi'

const FILTERS: Array<{ label: string; status?: InvoiceStatus }> = [
  { label: 'All' },
  { label: 'Open', status: 'open' },
  { label: 'Draft', status: 'draft' },
  { label: 'Paid', status: 'paid' },
]

export function InvoicesPage() {
  const { workspaceId } = useParams()
  const [status, setStatus] = useState<InvoiceStatus | undefined>()
  const query = status ? `?status=${status}` : ''
  const { data: invoices, error } = useApi<Invoice[]>(`/workspaces/${workspaceId}/invoices${query}`)

  const outstanding = (invoices ?? []).filter((invoice) => invoice.status === 'open')
  const overdue = outstanding.filter((invoice) => invoice.overdue)

  return (
    <>
      <header className="page-header">
        <h1>Invoices</h1>
      </header>
      <section className="stats">
        <Stat label="Outstanding" invoices={outstanding} />
        <Stat label="Overdue" invoices={overdue} tone="danger" />
      </section>
      <div className="filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            className={filter.status === status ? 'chip active' : 'chip'}
            onClick={() => setStatus(filter.status)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Customer</th>
            <th>Due</th>
            <th>Status</th>
            <th className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(invoices ?? []).map((invoice) => (
            <tr key={invoice.id}>
              <td className="mono">
                <Link to={invoice.id}>{invoice.number}</Link>
              </td>
              <td>{invoice.customerName}</td>
              <td>{invoice.dueDate}</td>
              <td>
                <StatusBadge status={invoice.status} overdue={invoice.overdue} />
              </td>
              <td className="right">
                <Money cents={invoice.amountCents} currency={invoice.currency} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function Stat({ label, invoices, tone }: { label: string; invoices: Invoice[]; tone?: 'danger' }) {
  const currency = invoices[0]?.currency ?? 'EUR'
  const total = invoices.reduce((sum, invoice) => sum + invoice.amountCents, 0)
  return (
    <div className={`card stat ${tone ?? ''}`}>
      <div className="muted">{label}</div>
      <div className="stat-value">
        <Money cents={total} currency={currency} />
      </div>
      <div className="muted">{invoices.length} invoices</div>
    </div>
  )
}
