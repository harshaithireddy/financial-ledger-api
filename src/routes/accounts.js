const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * CREATE ACCOUNT
 */
router.post('/', async (req, res) => {
  const { user_id, type, currency } = req.body;
  const id = uuidv4();

  await pool.query(
    `INSERT INTO accounts (id, user_id, type, currency)
     VALUES (?, ?, ?, ?)`,
    [id, user_id, type, currency]
  );

  res.status(201).json({ id, user_id, type, currency });
});

/**
 * GET ACCOUNT BALANCE
 */
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS balance
     FROM ledger_entries WHERE account_id = ?`,
    [req.params.id]
  );

  res.json({
    account_id: req.params.id,
    balance: rows[0].balance
  });
});

/**
 * GET ACCOUNT LEDGER
 */
router.get('/:id/ledger', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, transaction_id, entry_type, amount, created_at
       FROM ledger_entries
       WHERE account_id = ?
       ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({
      account_id: req.params.id,
      ledger: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
