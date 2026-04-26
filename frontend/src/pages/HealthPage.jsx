import { useState } from 'react'
import { fetchHealth } from '../services/expenseApi'

function HealthPage() {
  const [status, setStatus] = useState('Not checked yet')
  const [loading, setLoading] = useState(false)

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

  return (
    <section className="card">
      <h2>Backend Health</h2>
      <p className="status">{status}</p>
      <button type="button" onClick={handleCheckApi} disabled={loading}>
        {loading ? 'Checking...' : 'Check Backend Health'}
      </button>
    </section>
  )
}

export default HealthPage
