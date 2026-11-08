export type PlanId = 'starter' | 'team' | 'business'

export type Plan = {
  name: string
  seats: number
  monthlyPriceCents: number
}

export const PLANS: Record<PlanId, Plan> = {
  starter: { name: 'Starter', seats: 3, monthlyPriceCents: 0 },
  team: { name: 'Team', seats: 10, monthlyPriceCents: 4900 },
  business: { name: 'Business', seats: 50, monthlyPriceCents: 19900 },
}
