export type Account = {
    // id: Integer as a string.
    id: string;
    name: string;
    active: boolean;
    // classification: 'Expense'.
    classification: string;
    // account_type: 'Expense' | 'Other Expense' | 'Cost of Goods Sold'.
    account_type: string;
    account_sub_type: string;
};