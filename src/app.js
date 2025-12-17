const express = require('express');
const app = express();

app.use(express.json());

app.use('/accounts', require('./routes/accounts'));
app.use('/transactions', require('./routes/transactions'));

app.get('/', (req, res) => {
  res.send('Ledger API Running');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
