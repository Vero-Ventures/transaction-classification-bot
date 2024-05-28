'use server';

import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText, convertToCoreMessages } from 'ai';
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
If you are unsure, respond with "None" followed by just the search query to search the web.';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function queryLLM(query: string, context: string) {
  try {
    // Define the messages to send to the model.
    let messages: Message[] = [
      {
        role: 'user' as const,
        content: 'Description: ' + context,
      },
      {
        role: 'user' as const,
        content: query,
      },
    ];

    let response = await generateText({
      model,
      system: SystemInstructions,
      messages: messages,
    });

    // console.log('LLM response:', response.text);

    // If the response is 'None', search the web for additional information.
    if (response.text.startsWith('None')) {
      const searchQuery = response.text.split('None')[1].trim();
      const searchResults = (await fetchCustomSearch(searchQuery)) || [];
      const additionalInfo =
        searchResults.length > 0
          ? searchResults.map(result => result.snippet).join(' ')
          : 'No results found';

      console.log('Search Query:', searchQuery);
      console.log('Additional Info:', additionalInfo);

      if (searchResults.length === 0) {
        return '';
      } else {
        messages = [
          ...messages,
          {
            role: 'assistant' as const,
            content: response.text,
          },
          {
            role: 'user' as const,
            content:
              'Here is some additional information from the web: ' +
              additionalInfo,
          },
        ];

        response = await generateText({
          model,
          system: SystemInstructions,
          messages: messages,
        });
      }
    }

    return response.text;
  } catch (error) {
    // Log any errors that occur.
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

    // Check if descriptions exist otherwise use a default message
    let description;
    if (descriptions.length > 0) {
      description = descriptions[0].detailedDescription;
    } else {
      description = 'No description available';
    }

    // console.log('\nDescription:', description);
    // Return the transaction ID, prompt, and context.
    return {
      transaction_ID: transaction.transaction_ID,
      prompt,
      context: description,
    };
  });
  // Wait for all contexts to be generated.
  const contexts = await Promise.all(contextPromises);
  // Create a list of results for each context element.
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
