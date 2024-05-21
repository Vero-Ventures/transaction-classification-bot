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

export default function HomePage() {
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<{
    [transaction_ID: string]: string[];
  }>({});
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

    fetchPurchases();
  }, []);

  const handleSubmit = async (selectedPurchases: Transaction[]) => {
    const categorizedOnly: Transaction[] = filterCategorized(purchases);
    const result: { [transaction_ID: string]: string[] } | { error: string } =
      await classifyTransactions(
        categorizedOnly,
        filterUncategorized(selectedPurchases)
      );
    if (result.error) {
      console.error('Error classifying transactions:', result.error);
      return;
    }
    setCategorizedResults(result as { [transaction_ID: string]: string[] });
  };

  return categorizedResults && Object.keys(categorizedResults).length > 0 ? (
    <ReviewPage
      selectedPurchases={selectedPurchases}
      categorizedResults={categorizedResults}
    />
  ) : (
    <SelectionPage
      purchases={filterUncategorized(purchases)}
      setPurchases={setPurchases}
      handleSubmit={handleSubmit}
      selectedPurchases={selectedPurchases}
      setSelectedPurchases={setSelectedPurchases}
    />
  );
}
