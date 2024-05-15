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

    // Try to get a specific purchase object from the API by its ID. 
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

        // ***TEMP***
        const ID = '57';

        // Create tracker to indicate if the query was successful or not.
        let success = true;

        // Search for by ID for a specific purchase object.
        const response: any = await new Promise((resolve, reject) => {
            qbo.getPurchase(ID, (err: Error, data: any) => {
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

        // Create a formatted result object with all fields set to null.
        let formatted_result = {
            result_info: {
                result: "",
                message: "",
                detail: "",
            },
            id: "",
            purchase_type: "",
            date: "",
            total: 0,
            primary_account: "",
            purchase_name: "",
            purchase_category: "",
        };

        // Get the response from the search and create a formatted dictionary necessary fields.
        const results = response;

        // If the results contain a fault (indicating an error with the search)
        if (!success) {

            // Update the results info to indicate an error and provide the error message and detail.
            formatted_result.result_info.result = "Error";
            formatted_result.result_info.message = results.Error[0].Message;
            formatted_result.result_info.detail = results.Error[0].Detail;

        } else {

            // If the results do not contain a fault, update the formatted results with the necessary fields.
            // Set the result info to indicate success and provide a success message and detail.
            // Set the purchase info fields to the corresponding fields in the results.
            formatted_result = {
                result_info: {
                    result: "Success",
                    message: "Purchase found successfully.",
                    detail: "The purchase object was found successfully."
                },
                id: results.Id,
                purchase_type: results.PaymentType,
                date: results.TxnDate,
                total: results.TotalAmt,
                primary_account: results.AccountRef.name,
                purchase_name: results.EntityRef.name,
                purchase_category: "None",
            }

            // Initially the purchase category is set to None, as it is not always present in the results.
            // Now, check through the line field for the purchase category. It exists in the AccountBasedExpenseLineDetail field.
            for (let i = 0; i < results.Line.length; i++) {
                if (results.Line[i].DetailType === 'AccountBasedExpenseLineDetail') {
                    // If the purchase category is present, update the related field of the formatted results.
                    formatted_result.purchase_category = results.Line[i].AccountBasedExpenseLineDetail.AccountRef.name;
                    break;
                }
            }

        }

        // Return the formatted results.
        return Response.json(formatted_result);

    } catch (error) {
        // Return any caught errors.
        return Response.error();
    }
}
