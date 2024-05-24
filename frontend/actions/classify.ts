'use server';
import { Transaction } from '@/types/Transaction';
import { Account } from '@/types/Account';
import { Category, ClassifiedCategory } from '@/types/Category';
import { get_accounts } from '@/actions/quickbooks';
// import { batchQueryLLM } from '@/actions/llm';
import Fuse from 'fuse.js';

export const classifyTransactions = async (
  categorizedTransactions: Transaction[],
  uncategorizedTransactions: Transaction[]
) => {
  try {
    const validCategories: Category[] = await fetchValidCategories();

    const fuse = createFuseInstance(categorizedTransactions);

    const results: Record<string, ClassifiedCategory[]> = {};
    const noMatches: Transaction[] = [];

    uncategorizedTransactions.forEach(uncategorized => {
      try {
        const matches = fuse.search(uncategorized.name);
        const possibleCategoriesSet = new Set(
          matches.map(match => match.item.category)
        );

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

        if (possibleValidCategories.length === 0) {
          noMatches.push(uncategorized);
        } else {
          results[uncategorized.transaction_ID] = possibleValidCategories;
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
        llmApiResponse = await sendToLLMApi(noMatches, validCategories);
        if (llmApiResponse) {
          llmApiResponse.forEach((llmResult: CategorizedResult) => {
            results.push({
              transaction_ID: llmResult.transaction_ID,
              possibleCategories: llmResult.possibleCategories,
              classifiedBy: 'LLM',
            });
          });
        }
      } catch (error) {
        console.log('Error from LLM API usage: ', error);
      }
    }

    return results;
  } catch (error) {
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
