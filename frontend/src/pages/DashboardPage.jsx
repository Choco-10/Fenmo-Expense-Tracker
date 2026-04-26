import { useEffect, useState } from 'react'
import CategorySummary from '../components/CategorySummary'
import ExpenseFilters from '../components/ExpenseFilters'
import ExpenseList from '../components/ExpenseList'
import { fetchExpenses } from '../services/expenseApi'

const initialFilterState = {
  category: '',
  sort: 'date_desc',
}

function DashboardPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expenses, setExpenses] = useState([])
  const [filters, setFilters] = useState(initialFilterState)
  const [appliedFilters, setAppliedFilters] = useState(initialFilterState)

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await fetchExpenses(appliedFilters)
        setExpenses(data)
        setStatus(`Showing ${data.length} expense${data.length === 1 ? '' : 's'}`)
      } catch (error) {
        setError(`Failed to load expenses: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [appliedFilters])

  const handleFilterFieldChange = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleApplyFilters = (nextFilters) => {
    setAppliedFilters(nextFilters)
  }

  const handleResetFilters = () => {
    setFilters(initialFilterState)
    setAppliedFilters(initialFilterState)
  }

  return (
    <>
      {loading ? <p className="status">Loading expenses...</p> : <p className="status">{status}</p>}
      {error ? <p className="status">{error}</p> : null}

      <ExpenseFilters
        filters={filters}
        onChange={handleFilterFieldChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <ExpenseList expenses={expenses} />
      <CategorySummary expenses={expenses} />
    </>
  )
}

export default DashboardPage
