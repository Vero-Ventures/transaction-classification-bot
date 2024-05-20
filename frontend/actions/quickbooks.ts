'use server';

import { options } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { Transaction } from '@/types/Transaction';
import { Account } from '@/types/Account';
import { Purchase } from '@/types/Purchase';
import { QueryResult } from '@/types/QueryResult';
import { create_qb_object } from '@/actions/qb_client';
const QB = require('node-quickbooks');

// Get all accounts from the QuickBooks API.
export async function get_accounts() {
  // Try to get all account objects from the API.
  // Catches any errors that occur and returns them as a response.
  try {
    // Create the QuickBooks API calls object.
    const qbo = await create_qb_object();

    // Create tracker to indicate if the query was successful or not.
    let success = true;

    // Get the expense accounts by searching by their classification.
    // ***Variable*** Returns a limit of 1000 accounts.
    const response: any = await new Promise((resolve, reject) => {
      qbo.findAccounts(
        { Classification: 'Expense', limit: 1000 },
        (err: Error, data: any) => {
          // If there is an error, check if it has a 'Fault' property
          // Then resolve the error to allow a formatted JSON error message to be passed to the caller.
          if (err && 'Fault' in err) {
            success = false;
            resolve(err.Fault);
          }
          // If there is no error, resolve the data to allow the caller to access the results.
          resolve(data);
        }
      );
    });

    // Get response as result array.
    const results = response.QueryResponse.Account;

    // Create an array to hold the accounts.
    const formatted_accounts = [];

    // Create a formatted result object based on the query results.
    const QueryResult = create_query_result(success, results);

    // Add the formatted result to the start of accounts array as error indication.
    formatted_accounts.push(QueryResult);

    // For each account object, remove unnecessary fields and delete any inactive accounts.
    for (let account = 0; account < results.length; account++) {
      // Only add active accounts
      if (results[account].Active) {
        // Create a formatted account object with the necessary fields.
        const new_formatted_account: Account = {
          id: results[account].Id,
          name: results[account].Name,
          active: results[account].Active,
          classification: results[account].Classification,
          account_type: results[account].AccountType,
          account_sub_type: results[account].AccountSubType,
        };
        // Add the account to the accounts array.
        formatted_accounts.push(new_formatted_account);
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
// Can take a start date and end date as optional parameters.
export async function get_transactions(start_date = '', end_date = '') {
  // Try to get all purchase transaction objects from the API.
  // Catches any errors that occur and returns them as a response.
  try {
    // Create the QuickBooks API calls object.
    const qbo = await create_qb_object();

    // Create tracker to indicate if the query was successful or not.
    let success = true;

    // Query user preferences to get the multi-currency preference for the user.
    const preferences: any = await new Promise((resolve, reject) => {
      qbo.getPreferences((err: Error, data: any) => {
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

    // If there is no start date, set the start date to the default range: 2 years ago.
    if (start_date === '') {
      const today = new Date();
      const two_years_ago = new Date(
        today.getFullYear() - 2,
        today.getMonth(),
        today.getDate()
      );
      start_date = two_years_ago.toISOString().split('T')[0];
    }

    // If there is no end date, set the end date to today.
    if (end_date === '') {
      end_date = new Date().toISOString().split('T')[0];
    }

    // Defines a start and end date as well as what columns to include for each report.
    const parameters = {
      start_date: start_date,
      end_date: end_date,
      limit: 1000,
      columns: ['account_name', 'name', 'other_account', 'tx_date', 'txn_type'],
    };

    // Check if the user has multi-currency enabled.
    // Add the appropriate amount column to the parameters.
    if (preferences.CurrencyPrefs.MultiCurrencyEnabled) {
      parameters.columns.push('subt_nat_home_amount');
    } else {
      parameters.columns.push('subt_nat_amount');
    }

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

    // Create a formatted result object based on the query results.
    const QueryResult = create_query_result(success, results);

    // Add the formatted result to the start of accounts array as error indication.
    formatted_transactions.push(QueryResult);

    // Define valid transaction types.
    const purchase_transactions = [
      'Check',
      'Cash Expense',
      'Credit Card Expense',
      'Expense',
    ];

    // For each account object create a formatted transaction object and add it to the array.
    for (let account = 0; account < results.length; account++) {
      // Check account fields to skip any without valid field values.
      // Skip no-name transactions, transactions without an account, and transactions without an amount.
      if (
        purchase_transactions.includes(results[account].ColData[1].value) &&
        results[account].ColData[2].value !== '' &&
        results[account].ColData[5].value !== ''
      ) {
        // Create a new formatted transaction object with the necessary fields.
        const new_formatted_transaction: Transaction = {
          date: results[account].ColData[0].value,
          transaction_type: results[account].ColData[1].value,
          transaction_ID: results[account].ColData[1].id,
          name: results[account].ColData[2].value,
          account: results[account].ColData[3].value,
          category: results[account].ColData[4].value,
          amount: results[account].ColData[5].value,
        };
        // Add the transaction to the transactions array.
        formatted_transactions.push(new_formatted_transaction);
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
export async function find_purchase(id: string, format_result: boolean) {
  // Try to get a specific purchase object from the API by its ID.
  // Catches any errors that occur and returns them as a response.
  try {
    // Create the QuickBooks API calls object.
    const qbo = await create_qb_object();

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

    // If the user does not want a formatted result, return the raw response.
    // This is primarily used for updating the purchase classification.
    if (!format_result) {
      return response;
    }

    // Create a formatted result object based on the query results.
    const query_result = create_query_result(success, response);

    // Create a formatted result object with all fields set to null.
    const formatted_result: Purchase = {
      result_info: query_result,
      id: '',
      purchase_type: '',
      date: '',
      total: 0,
      primary_account: '',
      purchase_name: '',
      purchase_category: '',
    };

    // Get the response from the search and create a formatted dictionary necessary fields.
    const results = response;

    // Check that the search was successful before updating the formatted results.
    if (success) {
      // If the results do not contain a fault, update the formatted results with the necessary fields.
      formatted_result.id = results.Id;
      formatted_result.purchase_type = results.PaymentType;
      formatted_result.date = results.TxnDate;
      formatted_result.total = results.TotalAmt;
      formatted_result.primary_account = results.AccountRef.name;
      formatted_result.purchase_name = results.EntityRef.name;
      formatted_result.purchase_category = 'None';

      // Initially the purchase category is set to None, as it is not always present in the results.
      // Now, check through the line field for the purchase category. It exists in the AccountBasedExpenseLineDetail field.
      for (let i = 0; i < results.Line.length; i++) {
        if (results.Line[i].DetailType === 'AccountBasedExpenseLineDetail') {
          // If the purchase category is present, update the related field of the formatted results.
          formatted_result.purchase_category =
            results.Line[i].AccountBasedExpenseLineDetail.AccountRef.name;
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
export async function update_purchase(
  new_account_id: string,
  new_account_name: string,
  purchase: any
) {
  // Try to update a specific purchase object from the API.
  // Catches any errors that occur and returns them as a response.
  try {
    // Create the QuickBooks API calls object.
    const qbo = await create_qb_object();

    // Create a copy of the purchase object to hold the updated purchase.
    const update_purchase = purchase;

    // Use the purchase object passed to the function to update the purchase object.
    // Check each element in the line for the specific line that contains the categorizing account.
    for (let i = 0; i < update_purchase.Line.length; i++) {
      if (
        update_purchase.Line[i].DetailType === 'AccountBasedExpenseLineDetail'
      ) {
        // If it is present, update the purchase category field of the formatted results.
        update_purchase.Line[i].AccountBasedExpenseLineDetail.AccountRef.value =
          new_account_id;
        update_purchase.Line[i].AccountBasedExpenseLineDetail.AccountRef.name =
          new_account_name;
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

// Find a the company info object and return the industry.
export async function find_industry() {
  // Try to get the company info object from the API to get the user's industry.
  // Catches any errors that occur and returns them as a response.
  try {
    // Create the QuickBooks API calls object.
    const qbo = await create_qb_object();

    // Create tracker to indicate if the query was successful or not.
    let success = true;

    // Search for any company info objects.
    const response: any = await new Promise((resolve, reject) => {
      qbo.findCompanyInfos((err: Error, data: any) => {
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

    // Get array containing the industry type data.
    const company_name_value_array =
      response.QueryResponse.CompanyInfo[0].NameValue;

    // Iterate through the array to find the industry type.
    for (let i = 0; i < company_name_value_array.length; i++) {
      // If the industry type is found, return it.
      if (
        company_name_value_array[i].Name === 'QBOIndustryType' ||
        company_name_value_array[i].Name === 'IndustryType'
      ) {
        return company_name_value_array[i].Value;
      }
    }

    // Return none, if not match was found.
    return 'None';
  } catch (error) {
    // Return error if the call fails.
    return 'Error';
  }
}

function create_query_result(success: boolean, results: any) {
  // Create a formatted result object with all fields set to null.
  const QueryResult: QueryResult = {
    result: '',
    message: '',
    detail: '',
  };

  // Fill the first value in the array with the success or error message.
  if (success) {
    // Set the query result to indicate success and provide a success message and detail.
    QueryResult.result = 'Success';
    QueryResult.message = 'Accounts found successfully.';
    QueryResult.detail = 'The account objects were found successfully.';
  } else {
    // Set the query result to indicate failure and provide a error message and detail.
    QueryResult.result = 'Error';
    QueryResult.message = results.Error[0].Message;
    QueryResult.detail = results.Error[0].Detail;
  }

  // Return the formatted query result.
  return QueryResult;
}
