import { useEffect, useMemo, useState } from 'react'
import { createExpense, fetchExpenses, fetchHealth } from './api'
import './App.css'

function rupeesTextToPaise(value) {
  const normalized = String(value).trim()

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null
  }

  const [rupeesPart, paisePart = ''] = normalized.split('.')
  const paise = (paisePart + '00').slice(0, 2)

  return Number(rupeesPart) * 100 + Number(paise)
}

function amountToPaise(amount) {
  const parsed = rupeesTextToPaise(amount)
  return parsed ?? 0
}

function formatInrFromPaise(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100)
}

function formatDate(dateText) {
  const date = new Date(dateText)

  if (Number.isNaN(date.getTime())) {
    return dateText
  }

  return date.toLocaleDateString('en-IN')
}

function App() {
  const [status, setStatus] = useState('Not checked yet')
  const [loading, setLoading] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    expenseDate: '',
  })
  const [saving, setSaving] = useState(false)

  const totalPaise = useMemo(
    () => expenses.reduce((sum, item) => sum + amountToPaise(item.amount), 0),
    [expenses],
  )

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await fetchExpenses()
        setExpenses(data)
      } catch (error) {
        setStatus(`Failed to load expenses: ${error.message}`)
      }
    }

    loadExpenses()
  }, [])

  const handleCheckApi = async () => {
    setLoading(true)
    try {
      const result = await fetchHealth()
      setStatus(`Backend: ${result.status}, DB: ${result.db}`)
    } catch (error) {
      setStatus(`Failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const amountPaise = rupeesTextToPaise(form.amount)

    if (amountPaise === null) {
      setStatus('Amount must be in rupees with up to 2 decimal places')
      return
    }

    setSaving(true)

    try {
      const created = await createExpense({
        title: form.title,
        amount: (amountPaise / 100).toFixed(2),
        category: form.category,
        expenseDate: form.expenseDate || null,
      })

      setExpenses((current) => [created, ...current])
      setForm({ title: '', amount: '', category: '', expenseDate: '' })
    } catch (error) {
      setStatus(`Failed to save expense: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page">
      <h1>Fenmo Expense Tracker</h1>
      <p className="status">{status}</p>

      <button
        type="button"
        className="check-btn"
        onClick={handleCheckApi}
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Backend Health'}
      </button>

      <section className="card">
        <h2>Add Expense</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount (Rs)"
            inputMode="decimal"
            pattern="^\\d+(\\.\\d{1,2})?$"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
          />
          <input
            name="expenseDate"
            value={form.expenseDate}
            onChange={handleChange}
            type="date"
          />
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </section>

      <section className="card">
        <div className="summary-row">
          <h2>Expenses</h2>
          <strong>Total: {formatInrFromPaise(totalPaise)}</strong>
        </div>

        {expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          <ul className="expense-list">
            {expenses.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.category || 'Uncategorized'}</span>
                </div>
                <div className="right">
                  <strong>{formatInrFromPaise(amountToPaise(item.amount))}</strong>
                  <span>{formatDate(item.expense_date)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
