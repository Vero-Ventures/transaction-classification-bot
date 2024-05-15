import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');

export async function GET() {

    // Get the server session and save it as a constant.
    const session = await getServerSession(options);

    // Record the server session values.
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to get all purchase transaction objects from the API.
    // Catches any errors that occur and returns them as a response.
    try {

        // Create the QuickBooks API calls object.
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

        // Create tracker to indicate if the query was successful or not.
        let success = true;
 
        // Defines a start and end date as well as what columns to include for each report.
        let parameters = {start_date: '2022-01-01', end_date: '2024-12-31', limit: 1000, columns: ['account_name', 'name', 'other_account', 'tx_date', 'txn_type', 'subt_nat_amount']};
        
        // Get the all purchase transactions.
        const response: any = await new Promise((resolve, reject) => {
            qbo.reportTransactionList(parameters, (err: Error, data: any) => {
                // If there is an error, check if it has a 'Fault' property 
                // Then resolve the error to allow a formatted JSON error message to be passed to the caller.
                if (err && 'Fault' in err) {
                    success = false;
                    resolve(err.Fault);
                }
                // If there is no error, resolve the data to allow the caller to access the results.
                resolve(data);
            });
        });

        // Get the response and create an array to hold the formatted transactions.
        const results = response.Rows.Row;
        const formatted_transactions = [];

        // Fill the first value in the array with the success or error message.
        if (success) {
            // Add the success message.
            formatted_transactions.push({
                result: "Success",
                message: "Transactions found successfully.",
                detail: "The transaction objects were found successfully."
            })
        } else {
            // Add the error message with values from the response.
            formatted_transactions.push({
                result: "Error",
                message: results.Error[0].Message,
                detail: results.Error[0].Detail
            })
        }

        // Define valid transaction types.
        let purchase_transactions = ["Check", "Cash Expense", "Credit Card Expense", "Expense"]

        // For each account object create a formatted transaction object and add it to the array.
        for (let account = 0; account < results.length; account++) {
            // Skip any inactive accounts by checking active value before recording the transactions.
            if (purchase_transactions.includes(results[account].ColData[1].value) && results[account].ColData[2].value !== "") {
                // Add a new formatted transaction to the array.
                formatted_transactions.push({
                    date: results[account].ColData[0].value,
                    transaction_type: results[account].ColData[1].value,
                    transaction_ID: results[account].ColData[1].id,
                    name: results[account].ColData[2].value,
                    account: results[account].ColData[3].value,
                    category: results[account].ColData[4].value,
                    amount: results[account].ColData[5].value
                });
            }
        }
        
        // Return the formatted results.
        return Response.json(formatted_transactions);

    } catch (error) {
        // Return any caught errors.
        return Response.error();
    }
}
