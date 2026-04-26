import { useState } from 'react'
import { fetchHealth } from './api'
import './App.css'

function App() {
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
    <>
      <section id="center">
        <div>
          <h1>Fenmo Expense Tracker</h1>
          <p>
            Frontend is connected using <code>VITE_API_BASE_URL</code>.
          </p>
          <p>{status}</p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={handleCheckApi}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Backend Health'}
        </button>
      </section>
    </>
  )
}

export default App
