'use server';

import { Transaction, CategorizedResult } from '@/types/Transaction';
import { fetchCustomSearch } from './customsearch';
import { fetchKnowledgeGraph } from './knowledgegraph';

// Define the URL and API key for the LLM API.
const url = process.env.LLM_API_URL || '';
const apiKey = process.env.LLM_API_KEY || '';

// Define the base prompt for the LLM API and the list of default categories.
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
  // If no context is provided, throw an error.
  if (!context) {
    throw new Error('Context is required');
  }

  // If no query is provided but a name is, generate a query using the base prompt using that name.
  if (!query && name) {
    categories = categories || defaultCategories;
    query = basePrompt
      .replace('$NAME', name)
      .replace('$CATEGORIES', categories.join(', '));
    console.log('Query:', query);
  } else if (!query) {
    // If no query or name is provided, throw an error.
    throw new Error('Query or name is required');
  }

  try {
    // Fetch the response from the LLM API.
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
    // Return the JSON response.
    return response.json();
  } catch (error) {
    // Log any errors that occur.
    console.error('Error sending query:', error);
  }
}

export async function batchQueryLLM(
  transactions: Transaction[],
  categories?: string[]
) {
  // Define the threshold for the Knowledge Graph API.
  const threshold = 100;
  categories = categories || defaultCategories;
  // Create a map of lowercase categories.
  const lowercaseCategoryMap = categories.reduce(
    (map, category) => {
      map[category.toLowerCase()] = category;
      return map;
    },
    {} as { [key: string]: string }
  );

  // Generate a list of contexts for each transaction.
  const contextPromises = transactions.map(async (transaction: Transaction) => {
    const prompt = basePrompt
      .replace('$NAME', transaction.name)
      .replace('$CATEGORIES', categories.join(', '));

    // Fetch detailed descriptions from the Knowledge Graph API
    const kgResults = (await fetchKnowledgeGraph(transaction.name)) || [];
    const descriptions = kgResults.filter(
      result => result.resultScore > threshold
    );

    // Check if descriptions are over threshold and get the detailed description.
    let description;
    if (descriptions.length > 0) {
      description = descriptions[0].detailedDescription;
    } else {
      // Otherwise use Custom Search API snippets.
      const searchResults = (await fetchCustomSearch(transaction.name)) || [];
      description =
        searchResults.length > 0
          ? searchResults.map(result => result.snippet).join(' ')
          : 'No description available';
    }
    // Return the transaction ID, prompt, and context.
    return {
      transaction_ID: transaction.transaction_ID,
      prompt,
      context: `Description: ${description}`,
    };
  });
  // Wait for all contexts to be generated.
  const contexts = await Promise.all(contextPromises);
  // Create a list of results for each context element.
  const results: CategorizedResult[] = [];
  for (const { transaction_ID, prompt, context } of contexts) {
    const response = await queryLLM(prompt, context);

    // Check if response contains a valid category from the list
    let possibleCategories: string[] = [];

    // Check if response contains a valid category from the list.
    if (response && response.response) {
      // Convert response to lowercase for case-insensitive comparison.
      const responseText = response.response.toLowerCase();
      // Filter possible categories based on response text.
      possibleCategories = Object.keys(lowercaseCategoryMap)
        .filter(category => responseText.includes(category))
        .map(category => lowercaseCategoryMap[category]);
    }
    // Add the transaction ID and possible categories to the results.
    results.push({
      transaction_ID,
      possibleCategories,
    });
  }
  // Return the results.
  return results;
}
