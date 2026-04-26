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

const MIN_EXPENSE_DATETIME = new Date('2000-01-01T00:00:00Z');
const ALLOWED_SORTS = new Set(['date_desc', 'date_asc']);

function parseExpenseDateTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isExpenseDateTimeAllowed(date) {
  const now = new Date();
  return date >= MIN_EXPENSE_DATETIME && date <= now;
}

async function initializeDatabase() {
  // Create table with current schema if it doesn't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      idempotency_key TEXT UNIQUE
    );
  `);

  try {
    // Execute silent schema upgrades for older database states
    await db.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS description TEXT`);
    await db.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date TIMESTAMP`);
    await db.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE`);
    await db.query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category TEXT`);

    // Backfill any potential null values before enforcing constraints
    await db.query(`UPDATE expenses SET description = 'No description' WHERE description IS NULL OR TRIM(description) = ''`);
    await db.query(`UPDATE expenses SET date = created_at WHERE date IS NULL`);
    await db.query(`UPDATE expenses SET category = 'Misc' WHERE category IS NULL OR TRIM(category) = ''`);

    // Enforce NOT NULL for stability
    await db.query(`ALTER TABLE expenses ALTER COLUMN category SET NOT NULL`);
    await db.query(`ALTER TABLE expenses ALTER COLUMN description SET NOT NULL`);
    await db.query(`ALTER TABLE expenses ALTER COLUMN date SET NOT NULL`);
  } catch (error) {
    console.warn('Note: Schema evolution checks safely skipped.', error.message);
  }
}

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: error.message });
  }
});

async function listExpenses(req, res) {
  try {
    const { category, sort } = req.query;
    const conditions = [];
    const values = [];

    if (typeof sort === 'string' && sort.trim() && !ALLOWED_SORTS.has(sort)) {
      return res.status(400).json({ message: 'sort must be date_desc or date_asc' });
    }

    const normalizedSort = sort && ALLOWED_SORTS.has(sort) ? sort : 'date_desc';
    const orderBy = normalizedSort === 'date_asc' ? 'date ASC, id ASC' : 'date DESC, id DESC';

    if (typeof category === 'string' && category.trim()) {
      values.push(category.trim());
      conditions.push(`LOWER(category) = LOWER($${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await db.query(
      `SELECT id, amount, category, description, date, created_at
       FROM expenses
       ${whereClause}
       ORDER BY ${orderBy}`,
      values,
    );

    return res.json(rows);
  } catch (error) {
    console.error('listExpenses error:', error);
    return res.status(500).json({ message: 'Failed to fetch expenses' });
  }
}

async function createExpense(req, res) {
  try {
    const { amount, category, description, date, idempotencyKey } = req.body;
    const amountText = String(amount ?? '').trim();
    const normalizedCategory = typeof category === 'string' ? category.trim() : '';
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    const parsedExpenseDateTime = parseExpenseDateTime(date);
    const retryKey = req.get('Idempotency-Key') || idempotencyKey || null;

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(amountText)) {
      return res.status(400).json({ message: 'amount must be a non-negative rupee value up to 2 decimals' });
    }

    if (!normalizedCategory) {
      return res.status(400).json({ message: 'category is required' });
    }

    if (!normalizedDescription) {
      return res.status(400).json({ message: 'description is required' });
    }

    if (!parsedExpenseDateTime) {
      return res.status(400).json({ message: 'date must be a valid datetime' });
    }

    if (!isExpenseDateTimeAllowed(parsedExpenseDateTime)) {
      return res.status(400).json({ message: 'date must be between 2000-01-01 and now' });
    }

    if (retryKey) {
      const existing = await db.query(
        `SELECT id, amount, category, description, date, created_at
         FROM expenses
         WHERE idempotency_key = $1`,
        [retryKey],
      );

      if (existing.rows.length > 0) {
        return res.status(200).json(existing.rows[0]);
      }
    }

    const normalizedAmount = Number(amountText).toFixed(2);

    const { rows } = await db.query(
      `INSERT INTO expenses (amount, category, description, date, idempotency_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, amount, category, description, date, created_at`,
      [
        normalizedAmount,
        normalizedCategory,
        normalizedDescription,
        parsedExpenseDateTime.toISOString(),
        retryKey,
      ],
    );

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error('createExpense error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Duplicate idempotency key' });
    }

    return res.status(500).json({ message: 'Failed to create expense' });
  }
}

app.get(['/api/expenses', '/expenses'], listExpenses);
app.post(['/api/expenses', '/expenses'], createExpense);

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
