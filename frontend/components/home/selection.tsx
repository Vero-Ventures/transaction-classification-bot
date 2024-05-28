'use client';

import { get_transactions } from '@/actions/quickbooks';
import { SelectionTable } from '@/components/data-table/selection-table';
import { Transaction } from '@/types/Transaction';
import { filterUncategorized } from '@/utils/filter-transactions';
import { use, useEffect, useState } from 'react';

export default function SelectionPage({
  handleClassify,
  isClassifying,
}: {
  handleClassify: (selectedRows: Transaction[]) => void;
  isClassifying: boolean;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await get_transactions();
        const result = JSON.parse(response);
        if (result[0].result === 'Success') {
          setTransactions(result.slice(1));
        }
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">My Transactions</h1>
      <SelectionTable
        transactions={filterUncategorized(transactions)}
        isClassifying={isClassifying}
        handleClassify={handleClassify}
      />
    </>
  );
}
