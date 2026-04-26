import { useEffect, useState } from 'react'
import CategorySummary from '../components/CategorySummary'
import { fetchExpenses } from '../services/expenseApi'

function SummaryPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await fetchExpenses()
        setExpenses(data)
      } catch (error) {
        setError(`Failed to load expenses: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [])

  return (
    <>
      <p className="status">
        {loading ? 'Loading expenses summary...' : `Summarizing ${expenses.length} expense${expenses.length === 1 ? '' : 's'}`}
      </p>
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && expenses.length > 0 && <CategorySummary expenses={expenses} />}
      {!loading && expenses.length === 0 && !error && <p>No expenses found.</p>}
    </>
  )
}

export default SummaryPage
