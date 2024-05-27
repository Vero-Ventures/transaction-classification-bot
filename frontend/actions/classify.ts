'use server';
import { Transaction } from '@/types/Transaction';
import { Account } from '@/types/Account';
import { Category, ClassifiedCategory } from '@/types/Category';
import { CategorizedResult } from '@/types/CategorizedResult';
import { get_accounts } from '@/actions/quickbooks';
import { batchQueryLLM } from '@/actions/llm';
import Fuse from 'fuse.js';

export const classifyTransactions = async (
  categorizedTransactions: Transaction[],
  uncategorizedTransactions: Transaction[]
) => {
  try {
    // Get valid categories from QuickBooks.
    const validCategories: Category[] = await fetchValidCategories();
    const fuse = createFuseInstance(categorizedTransactions);
    // Create arrays for the results and transactions with no matches.
    const results: Record<string, ClassifiedCategory[]> = {};

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
        const possibleValidCategories = Array.from(possibleCategoriesSet)
          .map(possibleCategory =>
            validCategories.find(
              validAccount => validAccount.name === possibleCategory
            )
          )
          .filter((category): category is Category => Boolean(category))
          .map(category => ({
            ...category,
            classifiedBy: 'Fuzzy or Exact Match by Fuse',
          }));
          
        // If no valid categories are found, add the transaction to the no matches array.
        if (possibleValidCategories.length === 0) {
          noMatches.push(uncategorized);
        } else {
          // Otherwise, add the transaction and its possible categories to the results array.
          results[uncategorized.transaction_ID] = possibleValidCategories;
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
            results[llmResult.transaction_ID] =
              llmResult.possibleCategories.map(category => ({
                ...category,
                classifiedBy: 'LLM API',
              }));
          });
        }
      } catch (error) {
        // Catch any errors and log them to the console.
        console.log('Error from LLM API usage: ', error);
      }
    }
    return results;
  } catch (error) {
    // Catch any errors, log them to the console and return them.
    console.error('Error classifying transactions:', error);
    return { error: 'Error getting categorized transactions:' };
  }
};

const createFuseInstance = (categorizedTransactions: Transaction[]) => {
  return new Fuse(categorizedTransactions, {
    includeScore: true,
    threshold: 0.3,
    keys: ['name'],
  });
};

const fetchValidCategories = async (): Promise<Category[]> => {
  const validCategoriesResponse = JSON.parse(await get_accounts());
  return validCategoriesResponse.slice(1).map((category: Account): Category => {
    return { id: category.id, name: category.name };
  });
};

const sendToLLMApi = async (
  uncategorizedTransactions: Transaction[],
  validCategories: Category[]
): Promise<CategorizedResult[]> => {
  return await batchQueryLLM(uncategorizedTransactions, validCategories);
};
