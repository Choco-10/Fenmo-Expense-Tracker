import { NavLink, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="kicker">Fenmo Assessment</p>
          <h1>Expense Tracker</h1>
        </div>

        <nav className="nav-tabs" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/summary">Summary</NavLink>
          <NavLink to="/add">Add Expense</NavLink>
          <NavLink to="/health">System Health</NavLink>
        </nav>
      </header>

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
