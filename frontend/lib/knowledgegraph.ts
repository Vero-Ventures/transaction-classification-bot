import { google } from 'googleapis';

export async function fetchKnowledgeGraph(query: string) {
  const kgsearch = google.kgsearch('v1');
  const apiKey = process.env.GOOGLE_API_KEY;
  
  try {
    const response = await kgsearch.entities.search({
      auth: apiKey,
      query: query,
      types: ['Organization', 'Corporation', 'LocalBusiness'],
      limit: 1,
      indent: true
    });

    if (response.data.itemListElement) {
        const results = response.data.itemListElement.map((item: any) => {
            const entity = item.result;
            return {
              name: entity.name,
              resultScore: item.resultScore,
              detailedDescription: entity.detailedDescription ? entity.detailedDescription.articleBody : ''
            };
          });
      
        return results;
    } else {
        return ;
    }

  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
  }
}
