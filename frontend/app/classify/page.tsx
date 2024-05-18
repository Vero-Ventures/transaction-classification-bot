'use client';
import { useState } from 'react';
import { classifyTransactions } from '@/actions/classify';

const uncategorizedTransactions = [
  {
    date: '2024-05-14',
    transaction_type: 'Cash Expense',
    transaction_ID: '1',
    name: 'Grocery shopping',
    account: 'Cash',
    category: '',
    amount: 50.0,
  },
  {
    date: '2024-05-14',
    transaction_type: 'Credit Card Expense',
    transaction_ID: '2',
    name: 'Dinner with friends',
    account: 'Credit Card',
    category: '',
    amount: 80.0,
  },
  {
    date: '2024-05-14',
    transaction_type: 'Cash Expense',
    transaction_ID: '3',
    name: 'Gas refill',
    account: 'Cash',
    category: '',
    amount: 40.0,
  },
];

const categorizedTransactions = [
  {
    date: '2024-05-14',
    transaction_type: 'Cash Expense',
    transaction_ID: '101',
    name: 'Grocery shopping',
    account: 'Cash',
    category: 'Supplies',
    amount: 50.0,
  },
  {
    date: '2024-05-14',
    transaction_type: 'Credit Card Expense',
    transaction_ID: '102',
    name: 'Dinner with friends',
    account: 'Credit Card',
    category: 'Meals and Entertainment',
    amount: 80.0,
  },
  {
    date: '2024-05-14',
    transaction_type: 'Cash Expense',
    transaction_ID: '103',
    name: 'Gas refill',
    account: 'Cash',
    category: 'Fuel',
    amount: 40.0,
  },
];

export default function TransactionsPage() {
  const [response, setResponse] = useState('');

  const handleTest = async () => {
    try {
      const result = await classifyTransactions(
        categorizedTransactions,
        uncategorizedTransactions
      );
      console.log(result);
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred. Please try again.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Transaction Classification</h1>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Uncategorized Transactions</h2>
        <pre className="border border-gray-300 rounded p-2">
          {JSON.stringify(uncategorizedTransactions, null, 2)}
        </pre>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Categorized Transactions</h2>
        <pre className="border border-gray-300 rounded p-2">
          {JSON.stringify(categorizedTransactions, null, 2)}
        </pre>
      </div>
      <div className="mb-8">
        <button
          onClick={handleTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Test
        </button>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Response</h2>
        <pre className="border border-gray-300 rounded p-2">{response}</pre>
      </div>
    </div>
  );
}
