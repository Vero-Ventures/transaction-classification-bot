import { Transaction } from '@/types/Transaction';

export const filterUncategorized = (
  purchases: Transaction[]
): Transaction[] => {
  // Filter out all transactions that do not have uncategorized in the category.
  const filteredPurchases = purchases.filter((purchase: Transaction) =>
    purchase.category.toLowerCase().includes('uncategor')
  );
  return filteredPurchases;
};

export const filterCategorized = (purchases: Transaction[]): Transaction[] => {
  // Filter out all transactions that have uncategorized in the category.
  const filteredPurchases = purchases.filter(
    (purchase: Transaction) =>
      !purchase.category.toLowerCase().includes('uncategor')
  );
  return filteredPurchases;
};
