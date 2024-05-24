'use server';

import { Transaction } from '@/types/Transaction';
import { CategorizedResult } from '@/types/CategorizedResult';
import { Category } from '@/types/Category';
import { fetchCustomSearch } from './customsearch';
import { fetchKnowledgeGraph } from './knowledgegraph';

const url = process.env.LLM_API_URL || '';
const apiKey = process.env.LLM_API_KEY || '';

const basePrompt =
  'Using only provided list of categories, What type of business expense would a transaction from $NAME be? Categories: $CATEGORIES';

export async function queryLLM(query: string, context: string) {
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
  categories: Category[]
) {
  const threshold = 100; // resultScore threshold for Knowledge Graph API

  // Extract category names from Category objects
  const validCategoriesNames = categories.map(category => category.name);
  console.log('Categories Names:', validCategoriesNames);

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

    // console.log('\nDescription:', description);

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

    console.log('\nLLM raw response:', response);

    // Check if response contains a valid category from the list
    let possibleCategories: Category[] = [];
    if (response && response.response) {
      const responseText = response.response.toLowerCase();

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

    results.push({
      transaction_ID,
      possibleCategories,
      classifiedBy: 'LLM',
    });
  }

  return results;
}
