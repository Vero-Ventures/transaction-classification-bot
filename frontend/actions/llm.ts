'use server';

import { Transaction, CategorizedResult } from '@/types/Transaction';
import { fetchCustomSearch } from './customsearch';
import { fetchKnowledgeGraph } from './knowledgegraph';

const url = process.env.LLM_API_URL || '';
const apiKey = process.env.LLM_API_KEY || '';

const basePrompt =
  'Given a list of categories, What type of business expense would a transaction from $NAME be? Categories: $CATEGORIES';
const defaultCategories = [
  'Advertising',
  'Automobile',
  'Fuel',
  'Bank Charges',
  'Commission & fees',
  'Disposal Fees',
  'Dues & Subscriptions',
  'Equipment Rental',
  'Insurance',
  'Workers Compensation',
  'Job Expenses',
  'Cost of Labour',
  'Installation',
  'Maintenance and Repairs',
  'Equipment Rental',
  'Job Materials',
  'Permits',
  'Legal & Professional Fees',
  'Accounting',
  'Bookkeeper',
  'Lawyer',
  'Maintenance and Repair',
  'Building Repairs',
  'Computer Repairs',
  'Equipment Repairs',
  'Meals and Entertainment',
  'Office Expenses',
  'Promotional',
  'Purchases',
  'Rent or Lease',
  'Stationary & Printing',
  'Supplies',
  'Taxes & Licenses',
  'Unapplied Cash Bill Payment Expense',
  'Uncategorized Expense',
  'Utilities',
  'Gas and Electric',
  'Telephone',
  'Depreciation',
  'Miscellaneous',
  'Penalties & Settlements',
];

export async function queryLLM(
  query: string,
  context: string,
  name?: string,
  categories?: string[]
) {
  if (!context) {
    throw new Error('Context is required');
  }

  if (!query && name) {
    categories = categories || defaultCategories;
    query = basePrompt
      .replace('$NAME', name)
      .replace('$CATEGORIES', categories.join(', '));
    console.log('Query:', query);
  } else if (!query) {
    throw new Error('Query or name is required');
  }

  try {
    const response = await fetch(`${url}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        prompt: query,
        context: context,
      }),
    });

    return response.json();
  } catch (error) {
    console.error('Error sending query:', error);
  }
}

export async function batchQueryLLM(
  transactions: Transaction[],
  categories?: string[]
) {
  const threshold = 100;
  categories = categories || defaultCategories;
  const lowercaseCategoryMap = categories.reduce(
    (map, category) => {
      map[category.toLowerCase()] = category;
      return map;
    },
    {} as { [key: string]: string }
  );

  const contextPromises = transactions.map(async (transaction: Transaction) => {
    const prompt = basePrompt
      .replace('$NAME', transaction.name)
      .replace('$CATEGORIES', categories.join(', '));

    // Fetch detailed descriptions from the Knowledge Graph API
    const kgResults = (await fetchKnowledgeGraph(transaction.name)) || [];
    const descriptions = kgResults.filter(
      result => result.resultScore > threshold
    );

    // Check if descriptions are over threshold, otherwise use Custom Search API snippets
    let description;
    if (descriptions.length > 0) {
      description = descriptions[0].detailedDescription;
    } else {
      const searchResults = (await fetchCustomSearch(transaction.name)) || [];
      description =
        searchResults.length > 0
          ? searchResults.map(result => result.snippet).join(' ')
          : 'No description available';
    }

    return {
      transaction_ID: transaction.transaction_ID,
      prompt,
      context: `Description: ${description}`,
    };
  });
  const contexts = await Promise.all(contextPromises);

  const results: CategorizedResult[] = [];
  for (const { transaction_ID, prompt, context } of contexts) {
    const response = await queryLLM(prompt, context);

    // Check if response contains a valid category from the list
    let possibleCategories: string[] = [];

    if (response && response.response) {
      const responseText = response.response.toLowerCase();
      possibleCategories = Object.keys(lowercaseCategoryMap)
        .filter(category => responseText.includes(category))
        .map(category => lowercaseCategoryMap[category]);
    }

    results.push({
      transaction_ID,
      possibleCategories,
    });
  }

  return results;
}
