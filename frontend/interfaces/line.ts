export interface LineItem {
  Id: string;
  Description: string;
  Amount: number;
  DetailType: string;
  AccountBasedExpenseLineDetail?: {
    AccountRef: {
      value: string;
      name: string;
    };
    BillableStatus: string;
    TaxCodeRef: {
      value: string;
    };
  };
  ItemBasedExpenseLineDetail?: {
    ItemRef: {
      value: string;
      name: string;
    };
    UnitPrice: number;
    Qty: number;
    TaxCodeRef: {
      value: string;
    };
  };
}
