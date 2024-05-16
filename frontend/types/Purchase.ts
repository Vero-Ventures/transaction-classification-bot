export type Purchase = {
    result_info: {
        // result: 'Success' | 'Error';
        result: string;
        message: string;
        detail: string;
    },
    // Integer as a string.
    id: string;
    // purchase_type: 'Check' | 'Cash Expense' | 'Credit Card Expense';
    purchase_type: string;
    // date: YYYY-MM-DD.
    date: string;
    total: number,
    primary_account: string;
    purchase_name: string;
    purchase_category: string;
}