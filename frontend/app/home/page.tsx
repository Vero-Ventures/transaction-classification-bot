"use client";

import SelectionPage from "@/app/home/selection";
import ReviewPage from "@/app/home/review";
import { useEffect, useState } from "react";
import { get_transactions } from "../api/quickbooks/server_actions/app";
import { filterCategorized, filterUncategorized } from "@/utils/filter-transactions";
import { classifyTransactions } from "@/actions/classify";
import { Transaction } from "@/types/Transaction";

export default function HomePage() {
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [categorizedResults, setCategorizedResults] = useState<any>({});
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
    }

    fetchPurchases();
  }, []);

  const handleSubmit = async (selectedPurchases: Transaction[]) => {
    const categorizedOnly: Transaction[] = filterCategorized(purchases);
    const result = await classifyTransactions(categorizedOnly, filterUncategorized(selectedPurchases));
    
    if (result.data) {
      const classifications: any = {};
      result.data.forEach((classification) => {
        classifications[classification.transaction_ID] = classification.possibleCategories;
      });
      
      setCategorizedResults(classifications);
    }
  };

  return (
    categorizedResults && Object.keys(categorizedResults).length > 0 ? (
      <ReviewPage selectedPurchases={selectedPurchases} categorizedResults={categorizedResults} />
    ) : (
      <SelectionPage purchases={filterUncategorized(purchases)} handleSubmit={handleSubmit} selectedPurchases={selectedPurchases} setSelectedPurchases={setSelectedPurchases} />
    )
  );
}
