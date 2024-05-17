'use server'

import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
const QB = require('node-quickbooks');


// Get all accounts from the QuickBooks API.
export async function get_accounts() {

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
            qbo.findAccounts({ Classification: 'Expense', limit: 1000 }, (err: Error, data: any) => {
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
        return JSON.stringify(formatted_accounts);

    } catch (error) {
        // Return any caught errors.
        return JSON.stringify(error);
    }
}

// Get all transactions from the QuickBooks API.
export async function get_transactions() {

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
        let parameters = { start_date: '2022-01-01', end_date: '2024-12-31', limit: 1000, columns: ['account_name', 'name', 'other_account', 'tx_date', 'txn_type', 'subt_nat_amount'] };

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
        let purchase_transactions = ["Check", "Cash Expense", "Credit Card Expense"]

        // For each account object create a formatted transaction object and add it to the array.
        for (let account = 0; account < results.length; account++) {
            // Skip any inactive accounts by checking active value before recording the transactions.
            if (purchase_transactions.includes(results[account].ColData[1].value)) {
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
        return JSON.stringify(formatted_transactions);

    } catch (error) {
        // Return any caught errors.
        return JSON.stringify(error);
    }
}


// Find a specific purchase object by its ID.
export async function find_purchase(id: string) {

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

        // Create tracker to indicate if the query was successful or not.
        let success = true;

        // Search for by ID for a specific purchase object.
        const response: any = await new Promise((resolve, reject) => {
            qbo.getPurchase(id, (err: Error, data: any) => {
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
        var formatted_result = {
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
        return JSON.stringify(formatted_result);

    } catch (error) {
        // Return any caught errors.
        return JSON.stringify(error);
    }
}

// Update a specific purchase object passed to the function.
export async function update_purchase(new_account_id: string, new_account_name: string, purchase: any) {
    // Get the server session and save it as a constant.
    const session = await getServerSession(options);

    // Record the server session values.
    const oauthToken = session?.accessToken;
    const realmId = session?.realmId;
    const refreshToken = session?.refreshToken;

    // Try to update a specific purchase object from the API.
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

        // Create a copy of the purchase object to hold the updated purchase.
        let update_purchase =  purchase;

        // Use the purchase object passed to the function to update the purchase object.
        // Check each element in the line for the specific line that contains the categorizing account.
        for (let i = 0; i < update_purchase.Line.length; i++) {
            if (update_purchase.Line[i].DetailType === 'AccountBasedExpenseLineDetail') {
                // If it is present, update the purchase category field of the formatted results.
                update_purchase.Line[i].AccountBasedExpenseLineDetail.AccountRef.value = new_account_id;
                update_purchase.Line[i].AccountBasedExpenseLineDetail.AccountRef.name = new_account_name;
                break;
            }
        }

        // Update the purchase object with the updated account values.
        await new Promise((resolve, reject) => {
            qbo.updatePurchase(update_purchase, (err: Error, data: any) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });

        // Return the formatted and updated purchase.
        return JSON.stringify(purchase);

    } catch (error) {
        // Return any caught errors.
        return JSON.stringify(error);
    }
}
