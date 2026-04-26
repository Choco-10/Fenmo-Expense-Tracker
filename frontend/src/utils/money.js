export function rupeesTextToPaise(value) {
  if (value === null || value === undefined) return null

  let normalized = String(value).trim()
  normalized = normalized.replace(/[\s,]/g, '')
  normalized = normalized.replace(/^₹/, '')

  if (normalized.startsWith('.')) normalized = `0${normalized}`
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null

  const [rupeesPart, paisePart = ''] = normalized.split('.')
  const paise = (paisePart + '00').slice(0, 2)

  return Number(rupeesPart) * 100 + Number(paise)
}

export function amountToPaise(amount) {
  const parsed = rupeesTextToPaise(amount)
  return parsed ?? 0
}

export function formatInrFromPaise(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100)
}
