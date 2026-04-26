# Fenmo-Expense-Tracker
Fenmo Assessment : As a user, I can record and review my personal expenses so I can understand where my money is going.

## Local testing vs Production backend

- The frontend by default uses the deployed backend URL in `frontend/.env`.
- To test locally against the deployed backend (Render), ensure the `frontend/.env` contains:

```
VITE_API_BASE_URL=https://fenmo-expense-tracker-5d3b.onrender.com
```

- To test the frontend with your local backend, create `frontend/.env.local` (this file should NOT be committed) and add:

```
VITE_API_BASE_URL=http://localhost:5000
```

Vite will load `.env.local` during local development and override `frontend/.env`.
