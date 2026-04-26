const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function toQueryString(filters) {
  const params = new URLSearchParams()

  if (filters?.category) params.set('category', filters.category)
  if (filters?.sort) params.set('sort', filters.sort)

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function fetchExpenses(filters = {}) {
  const query = toQueryString(filters)
  const response = await fetch(`${API_BASE_URL}/api/expenses${query}`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export async function createExpense(payload, idempotencyKey) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }

  const response = await fetch(`${API_BASE_URL}/api/expenses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = `API error: ${response.status}`

    try {
      const data = await response.json()
      if (data?.message) message = data.message
    } catch {
      // Ignore JSON parsing failures and use status-based fallback message.
    }

    throw new Error(message)
  }

  return response.json()
}
