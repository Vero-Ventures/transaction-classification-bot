import { filterUncategorized, filterCategorized } from './filter-transactions';
import { Transaction } from '@/types/Transaction';
import { formatDate } from './format-date';

describe('filterUncategorized', () => {
  it('returns only uncategorized transactions', () => {
    const purchases: Transaction[] = [
      {
        date: new Date().toISOString(),
        transaction_type: 'debit',
        transaction_ID: '123',
        name: 'Groceries',
        account: 'Savings',
        category: 'Groceries',
        amount: 50,
      },
      {
        date: new Date().toISOString(),
        transaction_type: 'debit',
        transaction_ID: '456',
        name: 'Uncategorized',
        account: 'Checking',
        category: 'Uncategorized',
        amount: 30,
      },
      {
        date: new Date().toISOString(),
        transaction_type: 'credit',
        transaction_ID: '789',
        name: 'Transportation',
        account: 'Savings',
        category: 'Transportation',
        amount: 20,
      },
    ];

    const result = filterUncategorized(purchases);

    expect(result).toHaveLength(1);
    expect(result[0].category).toEqual('Uncategorized');
  });

  it('returns an empty array if there are no uncategorized transactions', () => {
    const purchases: Transaction[] = [
      {
        date: new Date().toISOString(),
        transaction_type: 'debit',
        transaction_ID: '123',
        name: 'Groceries',
        account: 'Savings',
        category: 'Groceries',
        amount: 50,
      },
      {
        date: new Date().toISOString(),
        transaction_type: 'credit',
        transaction_ID: '456',
        name: 'Transportation',
        account: 'Checking',
        category: 'Transportation',
        amount: 20,
      },
    ];

    const result = filterUncategorized(purchases);

    expect(result).toHaveLength(0);
  });
});

describe('filterCategorized', () => {
  it('returns only categorized transactions', () => {
    const purchases: Transaction[] = [
      {
        date: new Date().toISOString(),
        transaction_type: 'debit',
        transaction_ID: '123',
        name: 'Groceries',
        account: 'Savings',
        category: 'Groceries',
        amount: 50,
      },
      {
        date: new Date().toISOString(),
        transaction_type: 'debit',
        transaction_ID: '456',
        name: 'Uncategorized',
        account: 'Checking',
        category: 'Uncategorized',
        amount: 30,
      },
      {
        date: new Date().toISOString(),
        transaction_type: 'credit',
        transaction_ID: '789',
        name: 'Transportation',
        account: 'Savings',
        category: 'Transportation',
        amount: 20,
      },
    ];

    const result = filterCategorized(purchases);

    expect(result).toHaveLength(2);
    expect(result[0].category).toEqual('Groceries');
    expect(result[1].category).toEqual('Transportation');
  });

  it('returns an empty array if there are no categorized transactions', () => {
    const purchases: Transaction[] = [
      {
        date: new Date().toISOString(),
        transaction_type: 'debit',
        transaction_ID: '123',
        name: 'Uncategorized',
        account: 'Savings',
        category: 'Uncategorized',
        amount: 30,
      },
    ];

    const result = filterCategorized(purchases);

    expect(result).toHaveLength(0);
  });
});

describe('formatDate', () => {
  it('formats a valid date string correctly', () => {
    const dateString = '2022-05-15T12:00:00Z';
    const formattedDate = formatDate(dateString);
    expect(formattedDate).toBe('5/15/2022'); // Adjust this expectation according to your locale
  });

  it('returns "Invalid Date" for an empty date string', () => {
    const dateString = '';
    const formattedDate = formatDate(dateString);
    expect(formattedDate).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for an invalid date string', () => {
    const dateString = 'invalid-date';
    const formattedDate = formatDate(dateString);
    expect(formattedDate).toBe('Invalid Date');
  });
});
