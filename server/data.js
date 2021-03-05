// Store total number of points for the user
let TOTAL_POINTS = 0;

// Store balances for all payers
// This will look like the following:
// {'DANNON': {payer: 'DANNON', balance: 400},
//  'UNILEVER': {payer: 'UNILEVER', balance: 50}}
const BALANCES = {};

// Store list of all transactions in chronological order

// Each stored transaction will have the form
// {payer:<string>, points:<integer>, timestamp:<Date>, isCredit:<boolean>,
// unspentPoints:<integer>}

// The field unspentPoints has a value between 0 and points
// We will maintain the following two invariants:
//    (1) Regardless of the sequence of calls to addTransaction(), if the
//        balance stored for a given payer is nonnegative then every debit
//        transaction has field unspentPoints === 0
//    (2) Given two credit transactions transaction1 and transaction2
//        where transaction1.timestamp < transaction2.timestamp, if
//        transaction2.unspentPoints < transaction2.points then
//        transaction1.unspentPoints === 0
const TRANSACTIONS = [];

// Called when addTransaction is called for a credit transaction
// Updates the unspentPoints fields of debits with the same payer
// as well as credits with the same payer and later timestamps
const settleBalancesForNewCredit = (
  transaction,
  debitsWithSamePayer,
  creditsWithSamePayer
) => {
  // Settle any outstanding debits
  let index = 0;
  while (index < debitsWithSamePayer.length && transaction.unspentPoints > 0) {
    const otherTransaction = debitsWithSamePayer[index];
    if (otherTransaction.unspentPoints < 0) {
      const diff = Math.min(
        transaction.unspentPoints,
        Math.abs(otherTransaction.unspentPoints)
      );
      otherTransaction.unspentPoints += diff;
      transaction.unspentPoints -= diff;
    }
    index++;
  }
  // Points with an earlier timestamp should be spent first, so if there are
  // unspent points for the new credit transaction, iterate backward through
  // the credits with later timestamps and refund points
  index = creditsWithSamePayer.length - 1;
  while (
    index >= 0 &&
    transaction.unspentPoints > 0 &&
    creditsWithSamePayer[index].timestamp >= transaction.timestamp
  ) {
    const otherTransaction = creditWithSamePayer[index];
    if (otherTransaction.unspentPoints < otherTransaction.points) {
      const diff = Math.min(
        otherTransaction.points - otherTransaction.unspentPoints,
        transaction.unspentPoints
      );
      otherTransaction.unspentPoints += diff;
      transaction.unspentPoints -= diff;
    }
  }
};

// Called when addTransaction is called for a new debit
// Updates the unspentPoints fields for credit transactions with the same payer
const settleBalancesForNewDebit = (transaction, creditsWithSamePayer) => {
  let index = 0;
  while (index < creditsWithSamePayer.length && transaction.unspentPoints < 0) {
    const otherTransaction = creditsWithSamePayer[index];
    if (otherTransaction.unspentPoints > 0) {
      const diff = Math.min(
        Math.abs(transaction.unspentPoints),
        otherTransaction.unspentPoints
      );
      transaction.unspentPoints += diff;
      otherTransaction.unspentPoints -= diff;
    }
    index++;
  }
};

// Add a transaction and do any necessary bookkeeping
const addTransaction = (transaction) => {
  // Update total number of points
  TOTAL_POINTS += transaction.points;
  // update the balance of the payer for the transaction
  if (!BALANCES[transaction.payer]) {
    BALANCES[payer] = { payer, balance: transaction.balance };
  } else {
    BALANCES[payer].balance += transaction.balance;
  }

  // Get a list of other transactions with the same payer, for bookkeeping purposes
  const transactionsWithSamePayer = TRANSACTIONS.filter(
    otherTransaction.payer === transaction.payer
  );
  // Split up into credits and debits
  const debitsWithSamePayer = transactionsWithSamePayer.filter(
    !otherTransaction.isCredit
  );
  const creditsWithSamePayer = transactionsWithSamePayer.filter(
    otherTransaction.isCredit
  );

  if (transaction.isCredit) {
    settleBalancesForNewCredit(
      transaction,
      debitsWithSamePayer,
      creditsWithSamePayer
    );
  } else {
    settleBalancesForNewDebit(transaction, creditsWithSamePayer);
  }

  // search through TRANSACTIONS to find where to insert the new
  // transaction to maintain chronological order
  let index = 0;
  while (index < TRANSACTIONS.length && TRANSACTIONS[index].timestamp) index++;

  // insert the new transaction into TRANSACTIONS
  TRANSACTIONS.splice(index, 0, transaction);
};

//  We assume that TRANSACTIONS and BALANCES are up-to-date and all timestamps are in the past
// Throw an error if the total number of points is insufficient
const spend = (request) => {
  if (TOTAL_POINTS < request.points) {
    throw new Error('Insufficient points');
  }
  TOTAL_POINTS -= request.points;
  let points = request.points;
  let index = 0;
  let debits = {};
  let additionalTransactions = [];
  const transactionsWithPoints = TRANSACTIONS.filter(
    (transaction) => transaction.unspentPoints > 0
  );
  while (points > 0) {
    const transaction = transactionsWithPoints[index];
    const diff = Math.min(transaction.unspentPoints, points);
    additionalTransactions.push({
      payer: transaction.payer,
      points: -diff,
      timestamp: new Date(),
    });
    transaction.unspentPoints -= diff;
    points -= diff;
    if (!debits[transaction.payer]) {
      debits[transaction.payer] = { payer: transaction.payer, points: 0 };
    }
    debits[transaction.payer].points -= diff;
    index++;
  }
  return Object.values(debits);
};
