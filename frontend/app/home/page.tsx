"use client";

import SelectionPage from "@/app/home/selection";
import ReviewPage from "@/app/home/review";
import { Purchase } from "@/interfaces/purchase";
import { useEffect, useState } from "react";
import { get_accounts } from "../api/quickbooks/server_actions/app";

export default function HomePage() {
  const [categorizedResults, setCategorizedResults] = useState<any>({});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedPurchases, setSelectedPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const result = await get_accounts();
        if (result) {
          setAccounts(JSON.parse(result));
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    }

    fetchAccounts();
  }, []);

  const handleSubmit = (selectedPurchases: Purchase[]) => {
    let testResults: { [key: string]: string[] } = {};
    let possibleCategories: any = [];
    accounts.forEach((account) => {
      if (account.name) {
        possibleCategories.push(account.name);
      }
    });
    selectedPurchases.forEach((purchase) => {
      testResults[purchase.Id] = possibleCategories;
    });
    setCategorizedResults(testResults);
  };

  return (
    categorizedResults && Object.keys(categorizedResults).length > 0 ? (
      <ReviewPage selectedPurchases={selectedPurchases} categorizedResults={categorizedResults} />
    ) : (
      <SelectionPage handleSubmit={handleSubmit} selectedPurchases={selectedPurchases} setSelectedPurchases={setSelectedPurchases} />
    )
  );
}
