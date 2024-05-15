import { LineItem } from '@/interfaces/line';
import { Purchase } from '@/interfaces/purchase';

export const filterPurchases = (purchases: Purchase[]): Purchase[] => {
  const filteredPurchases = purchases.filter((purchase: Purchase) =>
    purchase.Line.some((lineItem: LineItem) =>
      ['AccountBasedExpenseLineDetail', 'ItemBasedExpenseLineDetail'].some(
        (detail: string) => {
          if (detail === 'AccountBasedExpenseLineDetail') {
            const accountRef =
              lineItem.AccountBasedExpenseLineDetail?.AccountRef?.name.toLowerCase();
            return accountRef && accountRef.includes('uncategor');
          } else if (detail === 'ItemBasedExpenseLineDetail') {
            const itemRef =
              lineItem.ItemBasedExpenseLineDetail?.ItemRef?.name.toLowerCase();
            return itemRef && itemRef.includes('uncategor');
          }
          return false;
        }
      )
    )
  );
  return filteredPurchases;
};
