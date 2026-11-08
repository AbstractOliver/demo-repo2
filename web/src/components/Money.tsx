export function formatMoney(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(amountCents / 100)
}

export function Money({ cents, currency }: { cents: number; currency: string }) {
  return <span className="money">{formatMoney(cents, currency)}</span>
}
