'use server';
import { google } from 'googleapis';

export async function fetchCustomSearch(query: string) {
  const customsearch = google.customsearch('v1');
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    // Fetch custom search results.
    const response = await customsearch.cse.list({
      auth: apiKey,
      cx: process.env.GOOGLE_CSE_CX,
      q: query,
      num: 3,
    });

    // If a response is returned, reformat and return the data.
    if (response.data.items) {
      return response.data.items.map((item: any) => {
        return {
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        };
      });
    } else {
      // If no response is returned, return an empty array.
      return [];
    }
  } catch (error) {
    // Log any errors that occur.
    console.error('Error fetching custom search:', error);
  }
}
