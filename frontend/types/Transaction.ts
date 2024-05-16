export type Transaction = {
  // date: YYYY-MM-DD.
  date: string;
  // transaction_type: 'Check' | 'Cash Expense' | 'Credit Card Expense' | 'Expense';
  transaction_type: string;
  // Integer as a string.
  transaction_ID: string;
  name: string;
  account: string;
  category: string;
  // Decimal as a string.
  amount: string;
};
  
export type CategorizedResult = {
  // Integer as a string.
  transaction_ID: string;
  possibleCategories: string[];
};