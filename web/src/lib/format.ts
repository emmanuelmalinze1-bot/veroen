export const formatAmountInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-NG')
}

export const parseAmountInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}
