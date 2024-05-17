'use server';
import { Transaction, CategorizedResult } from '@/types/Transaction';
import { Account } from '@/types/Account';
import { get_accounts } from '@/actions/quickbooks';
import Fuse from 'fuse.js';

export const classifyTransactions = async (
  categorizedTransactions: Transaction[],
  uncategorizedTransactions: Transaction[]
) => {
  try {
    const validCategoriesResponse = JSON.parse(await get_accounts());
    const validCategories = validCategoriesResponse
      .slice(1)
      .map((category: Account) => category.name);
    console.log(validCategories);

    if (!Array.isArray(categorizedTransactions)) {
      throw new Error('categorizedTransactions is not an array');
    }

    const fuse = new Fuse(categorizedTransactions, {
      includeScore: true,
      threshold: 0.3,
      keys: ['name'],
    });

    const results: CategorizedResult[] = [];
    const noMatches: Transaction[] = [];

    uncategorizedTransactions.forEach(uncategorized => {
      try {
        const matches = fuse.search(uncategorized.name);
        const possibleCategoriesSet = new Set(
          matches.map(match => match.item.category)
        );

        const validPossibleCategories = Array.from(
          possibleCategoriesSet
        ).filter(category => validCategories.includes(category));

        if (validPossibleCategories.length === 0) {
          noMatches.push(uncategorized);
        } else {
          results.push({
            transaction_ID: uncategorized.transaction_ID,
            possibleCategories: Array.from(possibleCategoriesSet),
          });
        }
      } catch (error) {
        console.error(
          'Error mapping uncategorized transaction:',
          uncategorized,
          error,
          'moving on...'
        );
      }
    });

    if (noMatches.length > 0) {
      let llmApiResponse;
      try {
        llmApiResponse = await sendToLLMApi(
          noMatches,
          categorizedTransactions,
          validCategories
        );
        if (llmApiResponse && llmApiResponse.data) {
          llmApiResponse.data.forEach((llmResult: CategorizedResult) => {
            results.push({
              transaction_ID: llmResult.transaction_ID,
              possibleCategories: llmResult.possibleCategories,
            });
          });
        }
      } catch (error) {
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

    console.log(
      'Successfully retrieved categorized transactions:',
      resultsObject
    );
    return resultsObject;
  } catch (error) {
    console.error('Error classifying transactions:', error);
    return { error: 'Error getting categorized transactions:' };
  }
};

const sendToLLMApi = async (
  uncategorizedTransactions: Transaction[],
  categorizedTransactions: Transaction[],
  validCategories: string[]
) => {
  const response = await fetch(process.env.LLM_API_ENDPOINT as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uncategorizedTransactions,
      categorizedTransactions,
      validCategories,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send data to LLM API ${response}`);
  }

  return await response.json();
};
