require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';
const allowedOrigins = FRONTEND_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json());

async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
      category TEXT,
      expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: error.message });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, amount, category, expense_date
       FROM expenses
       ORDER BY expense_date DESC, id DESC`,
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, category, expenseDate } = req.body;
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const amountText = String(amount ?? '').trim();

    if (!normalizedTitle) {
      return res.status(400).json({ message: 'title and valid amount are required' });
    }

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(amountText)) {
      return res.status(400).json({ message: 'amount must be a valid rupee value up to 2 decimals' });
    }

    const normalizedAmount = Number(amountText).toFixed(2);

    const { rows } = await db.query(
      `INSERT INTO expenses (title, amount, category, expense_date)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE))
       RETURNING id, title, amount, category, expense_date`,
      [normalizedTitle, normalizedAmount, category || null, expenseDate || null],
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create expense' });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
