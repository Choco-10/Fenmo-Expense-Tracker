import { COMMON_CATEGORIES } from '../constants/categories'
import { minLocalDateTimeValue, nowLocalDateTimeValue } from '../utils/dateTime'

function ExpenseForm({ form, saving, onChange, onSubmit }) {
  return (
    <section className="card" aria-labelledby="add-expense-title">
      <h2 id="add-expense-title">Add Expense</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={onChange}
          placeholder="Amount (Rs)"
          required
        />

        <select name="category" value={form.category} onChange={onChange} required>
          {COMMON_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description"
          rows={3}
          required
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            name="date"
            value={form.date}
            onChange={onChange}
            type="datetime-local"
            min={minLocalDateTimeValue()}
            max={nowLocalDateTimeValue()}
            required
            style={{ width: '100%', flex: 1 }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onChange({ target: { name: 'date', value: nowLocalDateTimeValue() } })}
            title="Set to current date and time"
          >
            Now
          </button>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </section>
  )
}

export default ExpenseForm
