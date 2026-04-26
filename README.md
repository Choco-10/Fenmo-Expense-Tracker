# Fenmo Expense Tracker

Fenmo assessment implementation for the requirement:

As a user, I can record and review my personal expenses so I can understand where my money is going.

## What Is Implemented

- Add expense with title, amount, category, date, and time.
- Date and time validation with allowed range: from 2000-01-01 up to current time.
- Predefined common categories with Misc as the last option.
- Expense list with total and 12-hour time display.
- Filters by category and date-time range.
- Multi-page UI so the app is not crowded into one page:
	- Dashboard
	- Add Expense
	- System Health
- Backend health endpoint and database connectivity check.
- Improved folder structure for maintainable frontend modules.

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: PostgreSQL

## Project Structure

```
Fenmo-Expense-Tracker/
	backend/
		db.js
		index.js
	frontend/
		src/
			components/
			constants/
			pages/
			services/
			utils/
			App.jsx
			App.css
			ErrorBoundary.jsx
			index.css
			main.jsx
```

## Backend Setup

1. Go to backend folder.
2. Install packages:

```bash
npm install
```

3. Create backend environment file and configure:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
PGSSL=false
```

4. Start backend:

```bash
npm run dev
```

The server auto-creates/migrates the expenses table and required datetime column.

## Frontend Setup

1. Go to frontend folder.
2. Install packages:

```bash
npm install
```

3. Configure API base URL.

Use deployed backend in frontend/.env:

```env
VITE_API_BASE_URL=https://fenmo-expense-tracker-5d3b.onrender.com
```

Or use local backend in frontend/.env.local:

```env
VITE_API_BASE_URL=http://localhost:5000
```

4. Start frontend:

```bash
npm run dev
```

## API Endpoints

- GET /api/health
- GET /api/expenses
	- Optional query params:
		- category
		- startDateTime (ISO)
		- endDateTime (ISO)
- POST /api/expenses
	- Body:

```json
{
	"title": "Lunch",
	"amount": "250.00",
	"category": "Food",
	"expenseDateTime": "2026-04-27T13:30:00.000Z"
}
```

## Validation Rules

- Amount must be a non-negative rupee value with up to 2 decimals.
- Title is required.
- Date-time must be valid and within range (2000-01-01 to now).

## Build Checks Run

- Frontend production build completed successfully.
- Backend syntax check completed successfully.

## Live Demo

- **Frontend (Vercel)**: [https://fenmo-expense-tracker-eight.vercel.app/](https://fenmo-expense-tracker-eight.vercel.app/) *(Update this link to your specific deploy once synced)*
- **Backend API (Render)**: [https://fenmo-expense-tracker-5d3b.onrender.com](https://fenmo-expense-tracker-5d3b.onrender.com)

## Assignment Notes & Explanations

### Persistence Mechanism Choice
I chose **PostgreSQL** for data persistence. While a simple JSON file or SQLite would solve the problem quickly in a local prototype, PostgreSQL provides true production-like quality. It easily handles concurrent reads/writes, offers robust constraints (e.g., rejecting negative balances directly at the database layer), and integrates frictionlessly with enterprise hosting environments.

### Key Design Decisions
- **Decoupled Full-Stack Architecture:** Separated the application into an Express backend and a React frontend to mimic real-world scalable architectures.
- **Idempotency Keys:** Designed the `POST /expenses` endpoint leveraging an `idempotency_key` mechanism to resolve the requirement for safe network retries without creating duplicate financial records.
- **Dedicated Summary View:** Designed a tabbed navigation system utilizing React Router to keep the dashboard clean while still providing an aggregate UI for category expenses.

### Trade-offs Made Because of the Timebox
- **Authentication:** Skipped user authorization logic. A real personal finance tool requires JWTs and row-level security per user.
- **State Management:** Relied heavily on localized `useState` and prop drilling. A production-grade app with deep component trees would likely leverage Redux or React Context.

### Anything Intentionally Not Done
- **Pagination / Cursors:** Withheld paginated API limits since category and date filters are generally sufficient for a concise demo implementation.
- **Formal Data Migration Tooling:** Omitted heavy ORM dependencies (like Prisma or Knex), choosing instead to utilize a lightweight `pg` driver and an initialization script for schema definitions.
