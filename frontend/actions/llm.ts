'use server';

import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { Transaction } from '@/types/Transaction';
import { CategorizedResult } from '@/types/CategorizedResult';
import { Category } from '@/types/Category';
import { fetchCustomSearch } from './customsearch';
import { fetchKnowledgeGraph } from './knowledgegraph';

const provider = process.env.AI_PROVIDER;
const model =
  provider === 'google'
    ? google('models/gemini-1.5-flash')
    : openai('gpt-3.5-turbo');

const basePrompt =
  'Using only provided list of categories, What type of business expense would a transaction from "$NAME" be? Categories: $CATEGORIES';
const SystemInstructions =
  'You are an assistant that provides concise answers. \
You are helping a user categorize their transaction for accountant business expenses purposes. \
Only respond with the category that best fits the transaction based on the provided description and categories. \
If no description is provided, try to use the name of the transaction to infer the category. \
If you are unsure, respond with "None" ';

export async function queryLLM(query: string, context: string) {
  try {
    const response = await generateText({
      model,
      system: SystemInstructions,
      messages: [
        {
          role: 'user',
          content: 'Description: ' + context,
        },
        {
          role: 'user',
          content: query,
        },
      ],
    });

    // console.log('LLM response:', response.text);

    return response.text;
  } catch (error) {
    console.error('Error sending query:', error);
  }
}

export async function batchQueryLLM(
  transactions: Transaction[],
  categories: Category[]
) {
  const threshold = 10; // resultScore threshold for Knowledge Graph API

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
      context: description,
    };
  });
  const contexts = await Promise.all(contextPromises);

  const results: CategorizedResult[] = [];
  for (const { transaction_ID, prompt, context } of contexts) {
    const response = await queryLLM(prompt, context);

    // Check if response contains a valid category from the list
    let possibleCategories: Category[] = [];
    if (response && response) {
      const responseText = response.toLowerCase();

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

    // const name = prompt.split('from ')[1].split(' be?')[0];
    // console.log('name:', name, ' classified as:', possibleCategories, ' with context:', context);

    results.push({
      transaction_ID,
      possibleCategories,
      classifiedBy: 'LLM',
    });
  }

  return results;
}
