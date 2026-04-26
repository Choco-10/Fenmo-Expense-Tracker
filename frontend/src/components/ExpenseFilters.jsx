import { COMMON_CATEGORIES } from '../constants/categories'

function ExpenseFilters({ filters, onChange, onApply, onReset }) {
  const handleChange = (event) => {
    const { name, value } = event.target
    onChange(name, value)
  }

  const handleApply = (event) => {
    event.preventDefault()
    onApply({ category: filters.category, sort: filters.sort })
  }

  return (
    <section className="card" aria-labelledby="filters-title">
      <h2 id="filters-title">Filters</h2>
      <form className="form-grid" onSubmit={handleApply}>
        <select name="category" value={filters.category} onChange={handleChange}>
          <option value="">All categories</option>
          {COMMON_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select name="sort" value={filters.sort} onChange={handleChange}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>

        <button type="submit">Apply Filters</button>
        <button type="button" className="btn-secondary" onClick={onReset}>
          Clear Filters
        </button>
      </form>
    </section>
  )
}

export default ExpenseFilters
