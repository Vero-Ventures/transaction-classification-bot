'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table/data-table';
import { Transaction } from '@/types/Transaction';
import { get_transactions } from '@/actions/quickbooks';
import { filterUncategorized } from '@/utils/filter-transactions';

export default function ShadcnPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);

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

  const handleClassify = async (selectedRows: Transaction[]) => {
    setIsClassifying(true);
    setTimeout(() => {
      console.log('Classifying rows:', selectedRows);
      setIsClassifying(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">My Transactions</h1>
      <DataTable
        transactions={filterUncategorized(transactions)}
        isClassifying={isClassifying}
        handleClassify={handleClassify}
      />
    </div>
  );
}
