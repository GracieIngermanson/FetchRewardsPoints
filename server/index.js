require('./data');
const PORT = 8080;

const express = require('express');
const app = express();

app.get('/balance', (req, res, next) => {
  res.json(Object.values(BALANCES));
});

app.post('/transaction', (req, res, next) => {
  const { payer, points, timestamp } = req;
  const transaction = { payer, points, timestamp };
  transaction.points = parseInt(points);
  if (transaction.points !== 0) {
    transaction.timestamp = new Date(timestamp);
    transaction.isCredit = transaction.points > 0;
    transaction.unspentPoints = transaction.points;
    addTransaction(transaction);
  }
  res.sendStatus(200);
});

app.post('/spend', (req, res, next) => {
  const { points } = req;
  const spendRequest = { points };
  spendRequest.points = parseInt(points);
  try {
    const spendResponse = spend(spendRequest);
    res.json(spendResponse);
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
