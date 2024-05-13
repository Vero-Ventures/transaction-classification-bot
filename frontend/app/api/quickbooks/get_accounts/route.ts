import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');

export async function GET() {
    const session = await getServerSession(options);
    
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to get all expense accounts and catch any errors.
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

        // Get the expense accounts.
        const resp: any = await new Promise((resolve, reject) => {
            qbo.findAccounts({Classification: 'Expense'}, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        // Get response as result array.
        const results = resp.QueryResponse.Account

        // For each account object, remove unnecessary fields and delete any inactive accounts.
        for (let account = 0; account < results.length; account++) {
            // Delete any inactive accounts.
            if (!results[account].Active) {
                // Splice out the inactive account.
                results.splice(account, 1);
                // Decrement the account index, because the splice moved each remaining account back one index.
                // Skip for last account: no remaining accounts to check.
                if (account !== results.length - 1){
                    account--;
                }
                // Skip to next account.
                continue;
            }
            // Delete accounts remain as nulls.
            delete results[account].FullyQualifiedName;
            delete results[account].CurrentBalance;
            delete results[account].CurrentBalanceWithSubAccounts;
            delete results[account].CurrencyRef;
            delete results[account].domain;
            delete results[account].SyncToken;
            delete results[account].MetaData;
        }
        
        // Show results.
        return Response.json(results);
    } catch (error) {
        // Show the caught error.
        return Response.error();
    }
}
