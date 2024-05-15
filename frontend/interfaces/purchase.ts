export interface Purchase {
  AccountRef: {
    value: string;
    name: string;
  };
  PaymentType: string;
  EntityRef?: {
    value: string;
    name: string;
    type: string;
  };
  TotalAmt: number;
  PurchaseEx?: {
    any: {
      name: string;
      declaredType: string;
      scope: string;
      value: {
        Name: string;
        Value: string;
      };
      nil: boolean;
      globalScope: boolean;
      typeSubstituted: boolean;
    }[];
  };
  domain: string;
  sparse: boolean;
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  DocNumber?: string;
  TxnDate: string;
  CurrencyRef: {
    value: string;
    name: string;
  };
  Line: {
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
  }[];
}
