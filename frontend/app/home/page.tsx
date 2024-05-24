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
import { CategorizedResult } from '@/types/CategorizedResult';
import { ClassifiedCategory } from '@/types/Category';

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

    fetchPurchases();
  }, []);

  const handleSubmit = async (selectedPurchases: Transaction[]) => {
    const result: Record<string, ClassifiedCategory[]> | { error: string } =
      await classifyTransactions(
        filterCategorized(purchases),
        filterUncategorized(selectedPurchases)
      );
    if ('error' in result) {
      console.error('Error classifying transactions:', result.error);
      return;
    }
    console.log(result);
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
