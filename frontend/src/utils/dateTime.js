const MIN_ALLOWED_DATE = new Date('2000-01-01T00:00:00')

function pad(value) {
  return String(value).padStart(2, '0')
}

export function toDateTimeLocalValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function nowLocalDateTimeValue() {
  return toDateTimeLocalValue(new Date())
}

export function minLocalDateTimeValue() {
  return toDateTimeLocalValue(MIN_ALLOWED_DATE)
}

export function formatDateTime12h(input) {
  const date = new Date(input)

  if (Number.isNaN(date.getTime())) return String(input)

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function toIsoOrNull(localDateTime) {
  if (!localDateTime) return null

  const parsed = new Date(localDateTime)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toISOString()
}
