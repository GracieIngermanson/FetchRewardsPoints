# FetchRewardsPoints

Coding challenge for Fetch Rewards backend internship application

To execute this code:

1. npm install
2. node server/index.js

This starts the server at port 8080.

Accepts the following HTTP requests:

1. GET localhost:8080/balance
2. POST localhost:8080/transaction

- req.body should have the form { 'payer': 'DANNON', 'points': '300', 'timestamp': '2020-10-31T10:00:00Z' }
- response should be status code 200 if adding the transaction does not make the payer's points balance negative
- If adding the transaction would make the payer's balance negative, response is status code 409 and error message 'Payer balance cannot be negative'

3. POST localhost:8080/spend

- req.body should have the form {'points':5000}
- If points balance is sufficient, response will have the form
  [
  { "payer": "DANNON", "points": -100 },
  { "payer": "UNILEVER", "points": -200 },
  { "payer": "MILLER COORS", "points": -4,700 }]
- If points balance is insufficient, response will have status code 409 and error message 'Insufficient points'

Example input/output from https://fetch-hiring.s3.us-east-1.amazonaws.com/points.pdf:

Suppose you call your add transaction route with the following sequence of calls:

- { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" }
- { "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }
- { "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }
- { "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" }
- { "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }

  Then you call your spend points route with the following request:

  { "points": 5000 }

  The expected response from the spend call would be:

  [
  { "payer": "DANNON", "points": -100 },
  { "payer": "UNILEVER", "points": -200 },
  { "payer": "MILLER COORS", "points": -4,700 }
  ]

## Note:
It's clear from the example calls in the documentation that transactions need not be added in chronological order of timestamp, which requires some assumptions about the behavior of the server when transactions are added out of order.

I have chosen to have the server respond with an error if a payer's stored balance would go negative based on a sequence of add transaction operations (in accordance with the example sequence of calls, I allow for "balancing" a debit with a credit that was added previously but has a later timestamp).

If a spend request is made with a number of points exceeding the total points stored, no points are spent and the server responds with an error.
