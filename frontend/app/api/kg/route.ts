import { fetchKnowledgeGraph } from '@/actions/knowledgegraph';

export async function GET(req: Request, res: Response) {
  // Define the url and the query from the url.
  const url = new URL(req.url || '');
  const query = url.searchParams.get('query') ?? '';

  try {
    // Fetch the knowledge graph data with the provided query and return a success response.
    const response = await fetchKnowledgeGraph(query);
    return Response.json(response, { status: 200 });
  } catch (error) {
    // Catch any errors and return a bad request response.
    return Response.json({ error: 'Error fetching data' }, { status: 400 });
  }
}
