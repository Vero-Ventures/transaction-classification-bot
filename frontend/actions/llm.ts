'use server';

import { Transaction } from '@/types/Transaction';
import { CategorizedResult } from '@/types/CategorizedResult';
import { Category } from '@/types/Category';
import { fetchCustomSearch } from './customsearch';
import { fetchKnowledgeGraph } from './knowledgegraph';

// Define the URL and API key for the LLM API.
const url = process.env.LLM_API_URL || '';
const apiKey = process.env.LLM_API_KEY || '';

// Define the base prompt for the LLM API and the list of default categories.
const basePrompt =
      'Using only provided list of categories, What type of business expense would a transaction from $NAME be? Categories: $CATEGORIES';

export async function queryLLM(query: string, context: string) {
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
  categories: Category[]
) {
  // Define resultScore threshold for Knowledge Graph API
  const threshold = 100; 

  // Extract category names from Category objects
  const validCategoriesNames = categories.map(category => category.name);
  console.log('Categories Names:', validCategoriesNames);

  // Generate a list of contexts for each transaction.
  const contextPromises = transactions.map(async (transaction: Transaction) => {
    const prompt = basePrompt
      .replace('$NAME', transaction.name)
      .replace('$CATEGORIES', validCategoriesNames.join(', '));

    // Fetch detailed descriptions from the Knowledge Graph API
    const kgResults = (await fetchKnowledgeGraph(transaction.name)) || [];
    // console.log('KG Results:', kgResults);
    const descriptions = kgResults.filter(
      result => result.resultScore > threshold
    );
    // console.log('\nDescriptions from KG:', descriptions);

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

    // console.log('\nDescription:', description);
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

    console.log('\nLLM raw response:', response);


    // Check if response contains a valid category from the list
    let possibleCategories: Category[] = [];
    if (response && response.response) {
      // Convert response to lowercase for case-insensitive comparison.
      const responseText = response.response.toLowerCase();
      // Filter possible categories based on response text.
      const possibleValidCategories = validCategoriesNames.filter(category =>
        responseText.includes(category.toLowerCase())
      );
      possibleCategories = possibleValidCategories.map(
        categoryName =>
          categories.find(
            category => category.name === categoryName
          ) as Category
      );
    }
    // Add the transaction ID and possible categories to the results.
    results.push({
      transaction_ID,
      possibleCategories,
      classifiedBy: 'LLM',
    });
  }
  // Return the results.
  return results;
}
