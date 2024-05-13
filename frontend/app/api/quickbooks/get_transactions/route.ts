import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');

export async function GET() {
    const session = await getServerSession(options);
    
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to get all transactions we care about in a set time period and catch any errors.
    try {
        // Create the QuickBooks object.
        const qbo = new QB(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            oauthToken,
            false,
            realmId,
            true,
            true,
            null,
            '2.0',
            refreshToken,
        );

        // Define the parameters for the report. 
        // Defines a start and end date as well as what columns to include for each report.
        let parameters = {start_date: '2022-01-01', end_date: '2024-12-31', limit: 1000, columns: ['account_name', 'name', 'other_account', 'tx_date', 'txn_type', 'subt_nat_amount']};
        // Get the expense accounts.
        const response: any = await new Promise((resolve, reject) => {
            qbo.reportTransactionList(parameters, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        // Get response as result array.
        const results = response.Rows.Row;
        const formatted_results = [];

        // Define valid transaction types.
        let purchase_transactions = ["Check", "Cash Expense", "Credit Card Expense"]

        // For each account object, remove unnecessary fields and delete any inactive accounts.
        for (let account = 0; account < results.length; account++) {
            // Delete any inactive accounts.
            if (!purchase_transactions.includes(results[account].ColData[1].value)) {
                // Splice out the inactive account.
                results.splice(account, 1);
                // Decrement the account index, because the splice moved each remaining account back one index.
                // Skip for last account: no remaining accounts to check.
                if (account !== results.length - 1) {
                    account--;
                }
                // Skip to next account.
                continue;
            } else {
                // Create a formatted result object for an individual transaction.
                let formatted_result = {
                    date: results[account].ColData[0].value,
                    transaction_type: results[account].ColData[1].value,
                    transaction_ID: results[account].ColData[1].id,
                    name: results[account].ColData[2].value,
                    account: results[account].ColData[3].value,
                    category: results[account].ColData[4].value,
                    amount: results[account].ColData[5].value
                }
                formatted_results.push(formatted_result);
            }
        }

        // Preform any additional filtering here.
        // ***************************************
        
        // ***************************************
        
        // Show formatted results.
        return Response.json(formatted_results);
    } catch (error) {
        // Show the caught error.
        return Response.error();
    }
}
