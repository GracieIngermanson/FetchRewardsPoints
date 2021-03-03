// Store list of all transactions in chronological order
const TRANSACTIONS = [];

// Store balances for all payers
// This will look like the following:
// {'DANNON': {payer: 'DANNON', balance: 400},
//  'UNILEVER': {payer: 'UNILEVER', balance: 50}}
const BALANCES = {};

const addTransaction = (transaction) => {
  let index = 0;
  // search through TRANSACTIONS to find where to insert the new
  // transaction to maintain chronological order
  while (
    index < TRANSACTIONS.length &&
    transaction.timestamp > TRANSACTIONS[index].timestamp
  )
    index++;
  // insert the new transaction into TRANSACTIONS
  TRANSACTIONS.splice(index, 0, transaction);

  // update the balance of the payer for the transaction
  if (!BALANCES[transaction.payer]) {
    BALANCES[payer] = { payer, balance: transaction.balance };
  } else {
    BALANCES[payer].balance += transaction.balance;
  }
};
