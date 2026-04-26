import { amountToPaise, formatInrFromPaise } from '../utils/money'
import { formatDateTime12h } from '../utils/dateTime'

function ExpenseList({ expenses }) {
  const totalPaise = expenses.reduce(
    (sum, item) => sum + amountToPaise(item.amount),
    0,
  )

  return (
    <section className="card" aria-labelledby="expenses-title">
      <div className="summary-row">
        <h2 id="expenses-title">Expenses</h2>
        <strong>Total: {formatInrFromPaise(totalPaise)}</strong>
      </div>

      {expenses.length === 0 ? (
        <p>No expenses found for the current filters.</p>
      ) : (
        <ul className="expense-list">
          {expenses.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.description}</strong>
                <span>{item.category || 'Misc'}</span>
              </div>
              <div className="right">
                <strong>{formatInrFromPaise(amountToPaise(item.amount))}</strong>
                <span>{formatDateTime12h(item.date)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ExpenseList
