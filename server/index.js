const { getBalances, addTransaction, spend } = require('./data');
const PORT = 8080;

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Returns a list of the points balances for each payer
// This will look like
// [ {payer: 'DANNON', points: 400}, {payer: 'UNILEVER', points: 50} ]
app.get('/balance', (req, res, next) => {
  res.json(getBalances());
});

// Adds a transaction of the form
// { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
app.post('/transaction', (req, res, next) => {
  try {
    const { payer, points, timestamp } = req.body;
    const transaction = { payer, points, timestamp };
    transaction.points = parseInt(points);
    if (transaction.points !== 0) {
      transaction.timestamp = new Date(timestamp);
      transaction.isCredit = transaction.points > 0;
      transaction.unspentPoints = transaction.points;
      addTransaction(transaction);
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

// Takes an input resembling { "points": 5000 }
// and returns a list showing debits grouped by payer,
// e.g.,
// [{ "payer": "DANNON", "points": -100 },
// { "payer": "UNILEVER", "points": -200 },
// { "payer": "MILLER COORS", "points": -4,700 }]
app.post('/spend', (req, res, next) => {
  const { points } = req.body;
  const spendRequest = { points };
  spendRequest.points = parseInt(points);
  try {
    const spendResponse = spend(spendRequest);
    res.json(spendResponse);
  } catch (error) {
    next(error);
  }
});

// Error handler––called when the user attempts to spend more points than
// are available or to add a debit that would make a payer's balance negative
app.use('*', (error, req, res, next) => {
  res.status(409).send(error.message);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
