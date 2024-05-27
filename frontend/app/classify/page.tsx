'use client';
import { useState, ChangeEvent } from 'react';
import { classifyTransactions } from '@/actions/classify';
import { Transaction } from '@/types/Transaction';

const defaultUncategorizedTransactions: Transaction[] = [
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

const defaultCategorizedTransactions: Transaction[] = [
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
  const [response, setResponse] = useState<string>('');
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState<
    Transaction[]
  >(defaultUncategorizedTransactions);
  const [categorizedTransactions, setCategorizedTransactions] = useState<
    Transaction[]
  >(defaultCategorizedTransactions);
  const [showUncategorized, setShowUncategorized] = useState<boolean>(true);
  const [showCategorized, setShowCategorized] = useState<boolean>(true);

  const parseCSV = (csvText: string): Transaction[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const transactions = lines.slice(1).map(line => {
      const values = line.split(',');
      const transaction: Partial<Transaction> = {};
      headers.forEach((header, index) => {
        const key = header.trim() as keyof Transaction;
        let value: any = values[index].trim();

        // Convert amount to number
        if (key === 'amount') {
          value = parseFloat(value);
        }

        // Assign the value to the transaction object
        transaction[key] = value;
      });
      return transaction as Transaction;
    });
    return transactions;
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const csvText = e.target?.result as string;
        const transactions = parseCSV(csvText);

        // Split the transactions into categorized and uncategorized
        const newUncategorizedTransactions = transactions.filter(
          t => !t.category
        );
        const newCategorizedTransactions = transactions.filter(t => t.category);

        setUncategorizedTransactions(newUncategorizedTransactions);
        setCategorizedTransactions(newCategorizedTransactions);
      };
      reader.onerror = error => {
        console.error('Error reading file:', error);
        setResponse('Error reading file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

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
        <h2 className="text-xl font-bold mb-2">Custom Transactions</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-4"
        />
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Uncategorized Transactions</h2>
        <button
          onClick={() => setShowUncategorized(!showUncategorized)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2">
          {showUncategorized ? 'Hide' : 'Show'}
        </button>
        {showUncategorized && (
          <pre className="border border-gray-300 rounded p-2">
            {JSON.stringify(uncategorizedTransactions, null, 2)}
          </pre>
        )}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Categorized Transactions</h2>
        <button
          onClick={() => setShowCategorized(!showCategorized)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2">
          {showCategorized ? 'Hide' : 'Show'}
        </button>
        {showCategorized && (
          <pre className="border border-gray-300 rounded p-2">
            {JSON.stringify(categorizedTransactions, null, 2)}
          </pre>
        )}
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
