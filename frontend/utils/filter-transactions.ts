import { Transaction } from '@/types/Transaction';

export const filterUncategorized = (purchases: Transaction[]): Transaction[] => {
  const filteredPurchases = purchases.filter((purchase: Transaction) =>
    purchase.category.toLowerCase().includes('uncategor')
  );
  return filteredPurchases;
};

export const filterCategorized = (purchases: Transaction[]): Transaction[] => {
  const filteredPurchases = purchases.filter((purchase: Transaction) =>
    !purchase.category.toLowerCase().includes('uncategor')
  );
  return filteredPurchases;
}
