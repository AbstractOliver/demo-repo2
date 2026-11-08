import type { InvoiceStatus } from '../api'

export function StatusBadge({ status, overdue }: { status: InvoiceStatus; overdue?: boolean }) {
  const label = overdue ? 'overdue' : status
  return <span className={`badge badge-${label}`}>{label}</span>
}
