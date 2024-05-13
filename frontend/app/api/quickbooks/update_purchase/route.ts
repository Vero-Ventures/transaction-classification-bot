import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');

export async function GET() {
    // ***NOTE*** Currently makes a POST request in addition to a GET request.
    // Eventually the find_purchase route should get the purchase object and pass it to this route.
    // This route should then be changed to a POST function with only one API call.
    const session = await getServerSession(options);
    
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to get a purchase object update it while catching any errors.
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
        // Define the name and ID of the new account to categorize the purchase object.
        let account_name = 'Automobile';
        let account_id = '55';

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
        
        // Check each element in the line for the specific line that contains the categorizing account.
        for (let i = 0; i < results.Line.length; i++) {
            if (results.Line[i].DetailType === 'AccountBasedExpenseLineDetail') {
                // If it is present, update the purchase category field of the formatted results.
                results.Line[i].AccountBasedExpenseLineDetail.AccountRef.value = account_id;
                results.Line[i].AccountBasedExpenseLineDetail.AccountRef.name = account_name;
                break;
            }
        }

        // Update the purchase object with the updated results value.
        const update_response: any = await new Promise((resolve, reject) => {
            qbo.updatePurchase(results, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        // Show results.
        return Response.json(results);
    } catch (error) {
        // Show the caught error.
        return Response.error();
    }
}
