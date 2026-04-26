import { useEffect, useMemo, useState } from 'react'
import { createExpense, fetchExpenses, fetchHealth } from './api'
import './App.css'

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

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
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
    setSaving(true)

    try {
      const created = await createExpense({
        title: form.title,
        amount: Number(form.amount),
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
            placeholder="Amount"
            type="number"
            min="0"
            step="0.01"
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
          <strong>Total: ${total.toFixed(2)}</strong>
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
                  <strong>${Number(item.amount).toFixed(2)}</strong>
                  <span>{item.expense_date}</span>
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
