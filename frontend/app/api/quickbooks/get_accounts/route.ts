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

    // Try to get all account objects from the API.
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

        // Get the expense accounts by searching by their classification.
        // ***Variable*** Returns a limit of 1000 accounts.
        const response: any = await new Promise((resolve, reject) => {
            qbo.findAccounts({Classification: 'Expense', limit: 1000}, (err: Error, data: any) => {
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

        // Get response as result array.
        const results = response.QueryResponse.Account;

        // Create an array to hold the accounts.
        let formatted_accounts = [];

        // Fill the first value in the array with the success or error message.
        if (success) {
            // Add the success message.
            formatted_accounts.push({
                result: "Success",
                message: "Accounts found successfully.",
                detail: "The account objects were found successfully."
            })
        } else {
            // Add the error message with values from the response.
            formatted_accounts.push({
                result: "Error",
                message: results.Error[0].Message,
                detail: results.Error[0].Detail
            })
        }
        

        // For each account object, remove unnecessary fields and delete any inactive accounts.
        for (let account = 0; account < results.length; account++) {
            // Only add active accounts
            if (results[account].Active) {
                // Add the account to the accounts array.
                formatted_accounts.push({
                    id: results[account].Id,
                    name: results[account].Name,
                    active: results[account].Active,
                    classification: results[account].Classification,
                    account_type: results[account].AccountType,
                    account_sub_type: results[account].AccountSubType,
                    description: results[account].Description,
                    account_number: results[account].AcctNum
                });
            }
        }
        
        // Return the formatted results.
        return Response.json(formatted_accounts);

    } catch (error) {
        // Return any caught errors.
        return Response.error();
    }
}
