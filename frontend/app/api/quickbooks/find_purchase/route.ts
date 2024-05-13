import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');

export async function GET() {
    const session = await getServerSession(options);
    
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to get the purchase object and catch any errors.
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

        // Define the ID of the purchase object to get (Change this variable to search by ID).
        let ID = '57';

        // Search for a purchase object with the matching ID.
        const response: any = await new Promise((resolve, reject) => {
            qbo.getPurchase(ID, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        // Get response as result and create a formatted dictionary necessary fields.
        const results = response;
        let formatted_result = {
            id: results.Id,
            purchase_type: results.PaymentType,
            date: results.TxnDate,
            total: results.TotalAmt,
            primary_account: results.AccountRef.name,
            purchase_name: results.EntityRef.name,
            purchase_category: null,
        }

        // Check each element in the line for the specific line that contains the categorizing account.
        for (let i = 0; i < results.Line.length; i++) {
            if (results.Line[i].DetailType === 'AccountBasedExpenseLineDetail') {
                // If it is present, update the purchase category field of the formatted results.
                formatted_result.purchase_category = results.Line[i].AccountBasedExpenseLineDetail.AccountRef.name;
                break;
            }
        }

        
        // Show results.
        return Response.json(formatted_result);
    } catch (error) {
        // Show the caught error.
        return Response.error();
    }
}
