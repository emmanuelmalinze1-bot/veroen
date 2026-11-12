export const ACTIVATION_PLANS = [
  { id: 'starter', label: 'Starter', amount: 10000 },
  { id: 'activated', label: 'Activated', amount: 15000 },
]

export const DEFAULT_ACTIVATION_AMOUNT = 10000

export const getActivationAmount = (profile: any) => {
  const stored = Number(profile?.activationAmount)
  if (stored > 0) return stored
  return profile?.plan === 'activated' ? 15000 : DEFAULT_ACTIVATION_AMOUNT
}
