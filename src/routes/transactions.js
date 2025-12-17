const express = require('express');
const router = express.Router();
const { transfer, deposit, withdraw } = require('../services/ledgerService');

router.post('/transfer', async (req, res) => {
  const { source_account, destination_account, amount } = req.body;

  try {
    await transfer(source_account, destination_account, amount);
    res.json({ message: 'Transfer successful' });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.post('/deposit', async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    await deposit(account_id, amount);
    res.json({ message: 'Deposit successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/withdraw', async (req, res) => {
  const { account_id, amount } = req.body;

  try {
    await withdraw(account_id, amount);
    res.json({ message: 'Withdrawal successful' });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});



module.exports = router;
