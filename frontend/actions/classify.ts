'use server';
import { Transaction, CategorizedResult } from '@/types/Transaction';
import { Account } from '@/types/Account';
import { get_accounts } from '@/actions/quickbooks';
import { batchQueryLLM } from '@/actions/llm';
import Fuse from 'fuse.js';

export const classifyTransactions = async (
  categorizedTransactions: Transaction[],
  uncategorizedTransactions: Transaction[]
) => {
  try {
    // Get accounts from QuickBooks and interpret them to get the valid categories.
    const validCategoriesResponse = JSON.parse(await get_accounts());
    const validCategories = validCategoriesResponse
      .slice(1)
      .map((category: Account) => category.name);
    console.log(validCategories);

    // Check that the cataloged transactions are the correct format.
    if (!Array.isArray(categorizedTransactions)) {
      throw new Error('categorizedTransactions is not an array');
    }

    const fuse = new Fuse(categorizedTransactions, {
      includeScore: true,
      threshold: 0.3,
      keys: ['name'],
    });

    // Create arrays for the results and transactions with no matches.
    const results: CategorizedResult[] = [];
    const noMatches: Transaction[] = [];

    // Iterate through the uncategorized transactions and classify them.
    uncategorizedTransactions.forEach(uncategorized => {
      try {
        // Search for the uncategorized transaction's name in the cataloged transactions.
        const matches = fuse.search(uncategorized.name);
        const possibleCategoriesSet = new Set(
          matches.map(match => match.item.category)
        );

        // Filter out any categories found in the matches that are not valid.
        const validPossibleCategories = Array.from(
          possibleCategoriesSet
        ).filter(category => validCategories.includes(category));

        // If no valid categories are found, add the transaction to the no matches array.
        if (validPossibleCategories.length === 0) {
          noMatches.push(uncategorized);
        } else {
          // Otherwise, add the transaction and its possible categories to the results array.
          results.push({
            transaction_ID: uncategorized.transaction_ID,
            possibleCategories: Array.from(possibleCategoriesSet),
          });
        }
      } catch (error) {
        // Catch any errors and log them to the console.
        console.error(
          'Error mapping uncategorized transaction:',
          uncategorized,
          error,
          'moving on...'
        );
      }
    });

    // If there are transactions with no matches, send them to the LLM API.
    if (noMatches.length > 0) {
      let llmApiResponse;
      try {
        // Await for the LLM API response and add the results to the results array.
        llmApiResponse = await sendToLLMApi(noMatches, validCategories);
        if (llmApiResponse) {
          // For each result, add the transaction ID and possible categories to the results array.
          llmApiResponse.forEach((llmResult: CategorizedResult) => {
            results.push({
              transaction_ID: llmResult.transaction_ID,
              possibleCategories: llmResult.possibleCategories,
            });
          });
        }
      } catch (error) {
        // Catch any errors and log them to the console.
        console.log('Error from LLM API usage: ', error);
      }
    }

    const resultsObject = results.reduce(
      (acc, curr) => {
        acc[curr.transaction_ID] = curr.possibleCategories;
        return acc;
      },
      {} as { [transaction_ID: string]: string[] }
    );

    // Log the results to the console and return them.
    console.log(
      'Successfully retrieved categorized transactions:',
      resultsObject
    );
    return resultsObject;
  } catch (error) {
    // Catch any errors, log them to the console and return them.
    console.error('Error classifying transactions:', error);
    return { error: 'Error getting categorized transactions:' };
  }
};

const sendToLLMApi = async (
  uncategorizedTransactions: Transaction[],
  validCategories: string[]
) => {
  // Create a response using the categorized result type.
  const response: CategorizedResult[] = await batchQueryLLM(
    uncategorizedTransactions,
    validCategories
  );
  // Return the categorized result response.
  return response;
};
