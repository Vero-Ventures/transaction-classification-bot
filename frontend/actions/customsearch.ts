'use server';
import { google } from 'googleapis';

export async function fetchCustomSearch(query: string) {
  const customsearch = google.customsearch('v1');
  const apiKey = process.env.GOOGLE_API_KEY;

    try {
        const response = await customsearch.cse.list({
        auth: apiKey,
        cx: process.env.GOOGLE_CSE_CX,
        q: query,
        num: 3,
        });
        

        if (response.data.items) {
            return response.data.items.map((item: any) => {
                return {
                    title: item.title,
                    link: item.link,
                    snippet: item.snippet,
                };
            });
        } else {
            return [];
        }

    } catch (error) {
        console.error('Error fetching custom search:', error);
    }
}
