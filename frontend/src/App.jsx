import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AddExpensePage from './pages/AddExpensePage'
import DashboardPage from './pages/DashboardPage'
import HealthPage from './pages/HealthPage'
import SummaryPage from './pages/SummaryPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="summary" element={<SummaryPage />} />
          <Route path="add" element={<AddExpensePage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
