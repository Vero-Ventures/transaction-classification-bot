'use server';
import { Transaction, CategorizedResult } from '@/types/Transaction';
import Fuse from 'fuse.js';

export const classifyTransactions = async (
  categorizedTransactions: Transaction[],
  uncategorizedTransactions: Transaction[]
) => {
  console.log(
    'categorizedTransactions',
    JSON.stringify(categorizedTransactions, null, 2)
  );
  console.log(
    'uncategorizedTransactions',
    JSON.stringify(uncategorizedTransactions, null, 2)
  );

  try {
    if (!Array.isArray(categorizedTransactions)) {
      throw new Error('categorizedTransactions is not an array');
    }

    const fuse = new Fuse(categorizedTransactions, {
      includeScore: true,
      threshold: 0.3,
      keys: ['name'],
    });

    const results: CategorizedResult[] = uncategorizedTransactions.map(
      uncategorized => {
        try {
          const matches = fuse.search(uncategorized.name);
          const possibleCategories = matches.map(match => match.item.category);
          return {
            transaction_ID: uncategorized.transaction_ID,
            possibleCategories: possibleCategories,
          };
        } catch (error) {
          console.error('Error mapping uncategorized transaction:', error);
          throw new Error('Error mapping uncategorized transaction');
        }
      }
    );

    console.log('Classification Results:', results);
    return { message: 'Categorized Results returned', data: results };
  } catch (error) {
    console.error('Error classifying transactions:', error);
    throw new Error('Error classifying transactions');
  }
};
