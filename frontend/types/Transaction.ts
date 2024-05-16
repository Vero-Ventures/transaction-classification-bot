export type Transaction = {
    date: string;
    // transaction_type: 'Check' | 'Cash Expense' | 'Credit Card Expense';
    transaction_type: string;
    transaction_ID: string;
    name: string;
    account: string;
    category: string;
    amount: string;
  };
  
  export type CategorizedResult = {
    transaction_ID: string;
    possibleCategories: string[];
  };