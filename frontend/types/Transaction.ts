import { Category } from './Category';

export type Transaction = {
  // date: YYYY-MM-DD.
  date: string;
  // transaction_type: 'Check' | 'Cash Expense' | 'Credit Card Expense' | 'Expense';
  transaction_type: string;
  // transaction_ID: Integer as a string.
  transaction_ID: string;
  name: string;
  account: string;
  category: string;
  // amount: Positive or negative decimal as a string.
  amount: number;
};

export type CategorizedTransaction = Omit<Transaction, 'category'> & {
  categories: Category[];
};
