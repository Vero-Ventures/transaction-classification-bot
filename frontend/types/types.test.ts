import { Account } from './Account';
import { Purchase } from './Purchase';
import { QueryResult } from './QueryResult';
import { Transaction, CategorizedResult } from './Transaction';

describe('Account type', () => {
  it('has the correct properties', () => {
    // Create a sample account object
    const account: Account = {
      id: '1',
      name: 'Sample Account',
      active: true,
      classification: 'Expense',
      account_type: 'Expense',
      account_sub_type: 'Subtype',
    };

    // Check if the account object has all the required properties
    expect(account).toHaveProperty('id');
    expect(account).toHaveProperty('name');
    expect(account).toHaveProperty('active');
    expect(account).toHaveProperty('classification');
    expect(account).toHaveProperty('account_type');
    expect(account).toHaveProperty('account_sub_type');
  });

  it('has the correct types for properties', () => {
    // Create a sample account object
    const account: Account = {
      id: '1',
      name: 'Sample Account',
      active: true,
      classification: 'Expense',
      account_type: 'Expense',
      account_sub_type: 'Subtype',
    };

    // Check if the types of properties match the expected types
    expect(typeof account.id).toBe('string');
    expect(typeof account.name).toBe('string');
    expect(typeof account.active).toBe('boolean');
    expect(typeof account.classification).toBe('string');
    expect(typeof account.account_type).toBe('string');
    expect(typeof account.account_sub_type).toBe('string');
  });
});

describe('Purchase type', () => {
  it('has the correct properties', () => {
    // Create a sample purchase object
    const purchase: Purchase = {
      result_info: {
        result: 'Success',
        message: 'Purchase successful',
        detail: 'Detail message',
      },
      id: '1',
      purchase_type: 'Check',
      date: '2022-05-20',
      total: 100,
      primary_account: 'Account 1',
      purchase_name: 'Purchase 1',
      purchase_category: 'Category 1',
    };

    // Check if the purchase object has all the required properties
    expect(purchase).toHaveProperty('result_info');
    expect(purchase.result_info).toHaveProperty('result');
    expect(purchase.result_info).toHaveProperty('message');
    expect(purchase.result_info).toHaveProperty('detail');
    expect(purchase).toHaveProperty('id');
    expect(purchase).toHaveProperty('purchase_type');
    expect(purchase).toHaveProperty('date');
    expect(purchase).toHaveProperty('total');
    expect(purchase).toHaveProperty('primary_account');
    expect(purchase).toHaveProperty('purchase_name');
    expect(purchase).toHaveProperty('purchase_category');
  });

  it('has the correct types for properties', () => {
    // Create a sample purchase object
    const purchase: Purchase = {
      result_info: {
        result: 'Success',
        message: 'Purchase successful',
        detail: 'Detail message',
      },
      id: '1',
      purchase_type: 'Check',
      date: '2022-05-20',
      total: 100,
      primary_account: 'Account 1',
      purchase_name: 'Purchase 1',
      purchase_category: 'Category 1',
    };

    // Check if the types of properties match the expected types
    expect(typeof purchase.result_info.result).toBe('string');
    expect(typeof purchase.result_info.message).toBe('string');
    expect(typeof purchase.result_info.detail).toBe('string');
    expect(typeof purchase.id).toBe('string');
    expect(typeof purchase.purchase_type).toBe('string');
    expect(typeof purchase.date).toBe('string');
    expect(typeof purchase.total).toBe('number');
    expect(typeof purchase.primary_account).toBe('string');
    expect(typeof purchase.purchase_name).toBe('string');
    expect(typeof purchase.purchase_category).toBe('string');
  });
});

describe('QueryResult type', () => {
  it('has the correct properties', () => {
    // Create a sample query result object
    const queryResult: QueryResult = {
      result: 'Success',
      message: 'Query successful',
      detail: 'Detail message',
    };

    // Check if the query result object has all the required properties
    expect(queryResult).toHaveProperty('result');
    expect(queryResult).toHaveProperty('message');
    expect(queryResult).toHaveProperty('detail');
  });

  it('has the correct types for properties', () => {
    // Create a sample query result object
    const queryResult: QueryResult = {
      result: 'Success',
      message: 'Query successful',
      detail: 'Detail message',
    };

    // Check if the types of properties match the expected types
    expect(typeof queryResult.result).toBe('string');
    expect(typeof queryResult.message).toBe('string');
    expect(typeof queryResult.detail).toBe('string');
  });
});

describe('Transaction type', () => {
  it('has the correct properties', () => {
    // Create a sample transaction object
    const transaction: Transaction = {
      date: '2022-05-20',
      transaction_type: 'Check',
      transaction_ID: '1',
      name: 'Transaction Name',
      account: 'Account Name',
      category: 'Category Name',
      amount: 100.0,
    };

    // Check if the transaction object has all the required properties
    expect(transaction).toHaveProperty('date');
    expect(transaction).toHaveProperty('transaction_type');
    expect(transaction).toHaveProperty('transaction_ID');
    expect(transaction).toHaveProperty('name');
    expect(transaction).toHaveProperty('account');
    expect(transaction).toHaveProperty('category');
    expect(transaction).toHaveProperty('amount');
  });

  it('has the correct types for properties', () => {
    // Create a sample transaction object
    const transaction: Transaction = {
      date: '2022-05-20',
      transaction_type: 'Check',
      transaction_ID: '1',
      name: 'Transaction Name',
      account: 'Account Name',
      category: 'Category Name',
      amount: 100.0,
    };

    // Check if the types of properties match the expected types
    expect(typeof transaction.date).toBe('string');
    expect(typeof transaction.transaction_type).toBe('string');
    expect(typeof transaction.transaction_ID).toBe('string');
    expect(typeof transaction.name).toBe('string');
    expect(typeof transaction.account).toBe('string');
    expect(typeof transaction.category).toBe('string');
    expect(typeof transaction.amount).toBe('number');
  });
});

describe('CategorizedResult type', () => {
  it('has the correct properties', () => {
    // Create a sample categorized result object
    const categorizedResult: CategorizedResult = {
      transaction_ID: '1',
      possibleCategories: ['Category 1', 'Category 2'],
    };

    // Check if the categorized result object has all the required properties
    expect(categorizedResult).toHaveProperty('transaction_ID');
    expect(categorizedResult).toHaveProperty('possibleCategories');
  });

  it('has the correct types for properties', () => {
    // Create a sample categorized result object
    const categorizedResult: CategorizedResult = {
      transaction_ID: '1',
      possibleCategories: ['Category 1', 'Category 2'],
    };

    // Check if the types of properties match the expected types
    expect(typeof categorizedResult.transaction_ID).toBe('string');
    expect(Array.isArray(categorizedResult.possibleCategories)).toBe(true);
  });
});
