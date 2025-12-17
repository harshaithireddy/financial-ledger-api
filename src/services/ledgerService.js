const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

async function transfer(sourceAccount, destinationAccount, amount) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Lock source account ledger
    const [rows] = await conn.query(
      `SELECT COALESCE(SUM(amount),0) AS balance
       FROM ledger_entries
       WHERE account_id = ?
       FOR UPDATE`,
      [sourceAccount]
    );

    if (rows[0].balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transactionId = uuidv4();

    // Create transaction record
    await conn.query(
        `INSERT INTO transactions
        (id, type, status, source_account_id, destination_account_id, amount)
        VALUES (?, 'transfer', 'completed', ?, ?, ?)`,
        [transactionId, sourceAccount, destinationAccount, amount]
    );

    // Debit source
    await conn.query(
      `INSERT INTO ledger_entries
       (id, account_id, transaction_id, entry_type, amount)
       VALUES (?, ?, ?, 'debit', ?)`,
      [uuidv4(), sourceAccount, transactionId, -amount]
    );

    // Credit destination
    await conn.query(
      `INSERT INTO ledger_entries
       (id, account_id, transaction_id, entry_type, amount)
       VALUES (?, ?, ?, 'credit', ?)`,
      [uuidv4(), destinationAccount, transactionId, amount]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deposit(accountId, amount) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const transactionId = uuidv4();

    await conn.query(
      `INSERT INTO transactions
       (id, type, status, source_account_id, destination_account_id, amount)
       VALUES (?, 'deposit', 'completed', NULL, ?, ?)`,
      [transactionId, accountId, amount]
    );

    await conn.query(
      `INSERT INTO ledger_entries
       (id, account_id, transaction_id, entry_type, amount)
       VALUES (?, ?, ?, 'credit', ?)`,
      [uuidv4(), accountId, transactionId, amount]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function withdraw(accountId, amount) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT COALESCE(SUM(amount),0) AS balance
       FROM ledger_entries
       WHERE account_id = ?
       FOR UPDATE`,
      [accountId]
    );

    if (rows[0].balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transactionId = uuidv4();

    await conn.query(
      `INSERT INTO transactions
       (id, type, status, source_account_id, destination_account_id, amount)
       VALUES (?, 'withdrawal', 'completed', ?, NULL, ?)`,
      [transactionId, accountId, amount]
    );

    await conn.query(
      `INSERT INTO ledger_entries
       (id, account_id, transaction_id, entry_type, amount)
       VALUES (?, ?, ?, 'debit', ?)`,
      [uuidv4(), accountId, transactionId, -amount]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}



module.exports = { transfer, deposit, withdraw };
