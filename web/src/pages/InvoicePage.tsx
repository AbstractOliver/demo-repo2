import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { api, type Invoice } from '../api'
import { Money } from '../components/Money'
import { StatusBadge } from '../components/StatusBadge'
import { useApi } from '../useApi'

export function InvoicePage() {
  const { workspaceId, invoiceId } = useParams()
  const path = `/workspaces/${workspaceId}/invoices/${invoiceId}`
  const { data: invoice, error, reload } = useApi<Invoice>(path)
  const [paymentMethodId, setPaymentMethodId] = useState('pm_card_visa')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  async function pay(event: FormEvent) {
    event.preventDefault()
    setPaying(true)
    try {
      await api(`${path}/pay`, { method: 'POST', body: { paymentMethodId } })
      setPayError(null)
      await reload()
    } catch (err) {
      setPayError(err instanceof Error ? err.message : String(err))
    } finally {
      setPaying(false)
    }
  }

  if (error) {
    return <p className="error">{error}</p>
  }
  if (!invoice) {
    return <p className="muted">Loading…</p>
  }

  return (
    <>
      <Link to={`/w/${workspaceId}/invoices`} className="muted">
        ← Invoices
      </Link>
      <header className="page-header">
        <h1>Invoice {invoice.number}</h1>
        <StatusBadge status={invoice.status} overdue={invoice.overdue} />
      </header>
      <section className="card invoice-summary">
        <div>
          <div className="muted">Customer</div>
          <div>{invoice.customerName}</div>
        </div>
        <div>
          <div className="muted">Due</div>
          <div>{invoice.dueDate}</div>
        </div>
        <div>
          <div className="muted">Amount</div>
          <div className="stat-value">
            <Money cents={invoice.amountCents} currency={invoice.currency} />
          </div>
        </div>
      </section>
      {invoice.status === 'open' && (
        <form className="card pay-form" onSubmit={pay}>
          <h2>Pay by card</h2>
          <input value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)} />
          {payError && <p className="error">{payError}</p>}
          <button type="submit" disabled={paying}>
            {paying ? 'Paying…' : 'Pay now'}
          </button>
        </form>
      )}
    </>
  )
}
