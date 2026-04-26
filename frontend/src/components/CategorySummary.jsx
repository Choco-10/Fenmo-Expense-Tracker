import { amountToPaise, formatInrFromPaise } from '../utils/money'

function CategorySummary({ expenses }) {
  const totals = expenses.reduce((accumulator, expense) => {
    const category = expense.category || 'Misc'
    const current = accumulator.get(category) ?? 0
    accumulator.set(category, current + amountToPaise(expense.amount))
    return accumulator
  }, new Map())

  const rows = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])

  if (rows.length === 0) return null

  return (
    <section className="card" aria-labelledby="category-summary-title">
      <h2 id="category-summary-title">Summary by Category</h2>
      <ul className="expense-list">
        {rows.map(([category, total]) => (
          <li key={category}>
            <div>
              <strong>{category}</strong>
            </div>
            <div className="right">
              <strong>{formatInrFromPaise(total)}</strong>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CategorySummary
