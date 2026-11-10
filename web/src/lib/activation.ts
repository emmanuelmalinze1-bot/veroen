export const ACTIVATION_PLANS = [
  { id: 'starter', label: 'Starter', amount: 12000 },
  { id: 'activated', label: 'Activated', amount: 20000 },
]

export const DEFAULT_ACTIVATION_AMOUNT = 12000

export const getActivationAmount = (profile: any) => {
  const stored = Number(profile?.activationAmount)
  if (stored > 0) return stored
  return profile?.plan === 'activated' ? 20000 : DEFAULT_ACTIVATION_AMOUNT
}
