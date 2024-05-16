'use server';
import { Transaction, CategorizedResult } from '@/types/Transaction';
import Fuse from 'fuse.js';

export const classifyTransactions = async (
  categorizedTransactions: Transaction[],
  uncategorizedTransactions: Transaction[]
) => {
  try {
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

        if (possibleCategoriesSet.size === 0) {
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
        llmApiResponse = await sendToLLMApi(noMatches, categorizedTransactions);
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

    console.log('Successfully retrieved categorized transactions:', results);
    return { message: 'Categorized Results returned', data: results };
  } catch (error) {
    console.error('Error classifying transactions:', error);
    return {
      message: 'Error classifying uncategorized transaction:',
      error: error,
    };
  }
};

const sendToLLMApi = async (
  uncategorizedTransactions: Transaction[],
  categorizedTransactions: Transaction[]
) => {
  const response = await fetch(process.env.LLM_API_ENDPOINT as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uncategorizedTransactions,
      categorizedTransactions,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send data to LLM API ${response}`);
  }

  return await response.json();
};