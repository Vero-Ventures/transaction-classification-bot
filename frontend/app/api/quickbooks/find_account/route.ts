import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');

export async function GET() {
    const session = await getServerSession(options);
    
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to get the account and catch any errors.
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

        // Define the ID of the account to get (Change for searching).
        let ID = '0';

        // Search for an account with the matching ID.
        const response: any = await new Promise((resolve, reject) => {
            qbo.getAccount(ID, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        // Get response as result and remove unnecessary fields.
        const results = response;
        delete results.FullyQualifiedName;
        delete results.CurrentBalance;
        delete results.CurrentBalanceWithSubAccounts;
        delete results.CurrencyRef;
        delete results.domain;
        delete results.SyncToken;
        delete results.MetaData;
        
        // Show results.
        return Response.json(results);
    } catch (error) {
        // Show the caught error.
        return Response.error();
    }
}
