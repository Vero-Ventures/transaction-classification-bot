'use client';

import { useState, useEffect } from 'react';
import { CategorizedTransaction, Transaction } from '@/types/Transaction';
import { get_transactions, find_industry } from '@/actions/quickbooks';
import { filterCategorized } from '@/utils/filter-transactions';
import { ClassifiedCategory } from '@/types/Category';
import { getSession } from 'next-auth/react';

import { classifyTransactions } from '@/actions/classify';
import SelectionPage from '@/components/home/selection';
import ReviewPage from '@/components/home/review';

export default function HomePage() {
  const [categorizedTransactions, setCategorizedTransactions] = useState<
    CategorizedTransaction[]
  >([]);
  const [categorizationResults, setCategorizationResults] = useState<
    Record<string, ClassifiedCategory[]>
  >({});

  useEffect(() => {
    const updateIndustry = async () => {
      const industry = await find_industry();
      const session = await getSession();
      const email = session?.user?.email;

      if (email) {
        try {
          const response = await fetch('/api/update-industry', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ industry, email }),
          });

          if (!response.ok) {
            throw new Error('Failed to update industry');
          }

          const result = await response.json();
          console.log(result.message);
        } catch (error) {
          console.error('Error updating industry:', error);
        }
      } else {
        console.error('No user email found in session');
      }
    };

    updateIndustry();
  }, []);

  const [isClassifying, setIsClassifying] = useState(false);

  const createCategorizedTransactions = (
    selectedRows: Transaction[],
    result: Record<string, ClassifiedCategory[]>
  ) => {
    const categorizedTransactions: CategorizedTransaction[] = [];
    for (const transaction of selectedRows) {
      categorizedTransactions.push({
        date: transaction.date,
        transaction_type: transaction.transaction_type,
        transaction_ID: transaction.transaction_ID,
        name: transaction.name,
        account: transaction.account,
        categories: result[transaction.transaction_ID] || [],
        amount: transaction.amount,
      });
    }
    return categorizedTransactions;
  };

  const handleClassify = async (selectedRows: Transaction[]) => {
    setIsClassifying(true);
    // Get a reference for the current date and the date 5 years ago.
    const today = new Date();
    const five_years_ago = new Date(
      today.getFullYear() - 5,
      today.getMonth(),
      today.getDate()
    );

    // Convert the dates to strings in the format 'YYYY-MM-DD'.
    const start_date = today.toISOString().split('T')[0];
    const end_date = five_years_ago.toISOString().split('T')[0];

    // Get the past transactions from QuickBooks.
    const pastTransactions = await get_transactions(start_date, end_date);
    const pastTransactionsResult = JSON.parse(pastTransactions).slice(1);

    // Pass the transactions to classify and the past 5 years of transactions.
    const result: Record<string, ClassifiedCategory[]> | { error: string } =
      await classifyTransactions(
        filterCategorized(pastTransactionsResult),
        selectedRows
      );
    if ('error' in result) {
      console.error('Error classifying transactions:', result.error);
      return;
    }

    setCategorizationResults(result);
    setCategorizedTransactions(
      createCategorizedTransactions(selectedRows, result)
    );
    setIsClassifying(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {categorizedTransactions.length > 0 ? (
        <ReviewPage
          categorizedTransactions={categorizedTransactions}
          categorizationResults={categorizationResults}
        />
      ) : (
        <SelectionPage
          handleClassify={handleClassify}
          isClassifying={isClassifying}
        />
      )}
    </div>
  );
}
