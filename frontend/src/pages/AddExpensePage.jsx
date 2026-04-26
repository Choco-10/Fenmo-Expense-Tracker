import { useState } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import { createExpense } from '../services/expenseApi'
import { nowLocalDateTimeValue, toIsoOrNull } from '../utils/dateTime'
import { rupeesTextToPaise } from '../utils/money'

function generateIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const initialForm = {
  amount: '',
  category: 'Food',
  description: '',
  date: nowLocalDateTimeValue(),
}

function AddExpensePage() {
  const [status, setStatus] = useState('Enter details and save the expense.')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    setIdempotencyKey(generateIdempotencyKey())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const amountPaise = rupeesTextToPaise(form.amount)

    if (amountPaise === null) {
      setStatus('Amount must be in rupees with up to 2 decimal places.')
      return
    }

    const expenseDateTimeIso = toIsoOrNull(form.date)
    if (!expenseDateTimeIso) {
      setStatus('Please provide a valid date and time for the expense.')
      return
    }

    if (!form.description.trim()) {
      setStatus('Description is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const created = await createExpense({
        amount: (amountPaise / 100).toFixed(2),
        category: form.category,
        description: form.description.trim(),
        date: expenseDateTimeIso,
      }, idempotencyKey)

      setStatus(`Saved expense #${created.id} successfully.`)
      setForm({
        ...initialForm,
        date: nowLocalDateTimeValue(),
      })
      setIdempotencyKey(generateIdempotencyKey())
    } catch (error) {
      setError(`Failed to save expense: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <p className="status">{status}</p>
      {error ? <p className="error-banner">{error}</p> : null}
      <ExpenseForm form={form} saving={saving} onChange={handleChange} onSubmit={handleSubmit} />
    </>
  )
}

export default AddExpensePage
