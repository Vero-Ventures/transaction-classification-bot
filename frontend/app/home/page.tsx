'use client';

import SelectionPage from '@/components/selection';
import ReviewPage from '@/components/review';
import { useEffect, useState } from 'react';
import {
  filterCategorized,
  filterUncategorized,
} from '@/utils/filter-transactions';
import { classifyTransactions } from '@/actions/classify';
import { Transaction } from '@/types/Transaction';
import { get_transactions } from '@/actions/quickbooks';
import { ClassifiedCategory } from '@/types/Category';
import { find_industry } from '@/actions/quickbooks';
import { getSession } from 'next-auth/react';

export default function HomePage() {
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<
    Record<string, ClassifiedCategory[]>
  >({});
  const [selectedPurchases, setSelectedPurchases] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await get_transactions();
        const result = JSON.parse(response);
        if (result[0].result === 'Success') {
          setPurchases(result.slice(1));
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };
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

    fetchPurchases();
    updateIndustry();
  }, []);

  const handleSubmit = async (selectedPurchases: Transaction[]) => {
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
        filterUncategorized(selectedPurchases)
      );
    if ('error' in result) {
      console.error('Error classifying transactions:', result.error);
      return;
    }
    setCategorizedResults(result);
  };

  return categorizedResults && Object.keys(categorizedResults).length > 0 ? (
    <ReviewPage
      selectedPurchases={selectedPurchases}
      categorizedResults={categorizedResults}
    />
  ) : (
    <SelectionPage
      unfilteredPurchases={purchases}
      filteredPurchases={filterUncategorized(purchases)}
      setPurchases={setPurchases}
      handleSubmit={handleSubmit}
      selectedPurchases={selectedPurchases}
      setSelectedPurchases={setSelectedPurchases}
    />
  );
}
