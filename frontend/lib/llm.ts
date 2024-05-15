
export async function queryLLM(query: string, context: string) {
    const url = process.env.LLM_API_URL || '';
    const apiKey = process.env.LLM_API_KEY || '';

  try {

    console.log('sending query to LLM:', query, context)
    
    console.log('url', url);

    const response = await fetch(`${url}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
        },
        body: JSON.stringify({
            prompt: query,
            context: context
        })
    });

    return response.json();


  } catch (error) {
    console.error('Error sending query:', error);
  }
}
