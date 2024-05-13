export type Transaction = {
  date: string;
  transaction_type: 'Check' | 'Cash Expense' | 'Credit Card Expense';
  transaction_ID: string;
  name: string;
  account: string;
  category: string;
  amount: string;
};

export type SearchEngineTransaction = {
  userId: string;
  date: string;
  transaction_type: 'Check' | 'Cash Expense' | 'Credit Card Expense';
  transaction_ID: string;
  name: string;
  account: string;
  category: string;
  amount: string;
};
