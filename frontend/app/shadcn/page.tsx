'use client';

import { useState } from 'react';
import { CategorizedTransaction, Transaction } from '@/types/Transaction';
import { get_transactions } from '@/actions/quickbooks';
import { filterCategorized } from '@/utils/filter-transactions';
import { ClassifiedCategory } from '@/types/Category';
import { classifyTransactions } from '@/actions/classify';
import SelectionPage from '@/components/home/selection';
import ReviewPage from '@/components/home/review';

export default function ShadcnPage() {
  const [categorizedTransactions, setCategorizedTransactions] = useState<
    CategorizedTransaction[]
  >([]);
  const [categorizationResults, setCategorizationResults] = useState<
    Record<string, ClassifiedCategory[]>
  >({});
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
