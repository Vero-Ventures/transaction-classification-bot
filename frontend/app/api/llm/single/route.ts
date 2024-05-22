import { queryLLM } from '@/actions/llm';

export async function POST(req: Request, res: Response) {
  // Get the body from the request and parse the fields from the JSON.
  const body = await req.json();
  const name = body.name;
  const query = body.query;
  const context = body.context;
  const categories = body.categories;

  try {
    // Query the LLM model with the provided fields and return a success response.
    const response = await queryLLM(query, context, name, categories);
    return Response.json(response, { status: 200 });
  } catch (error) {
    // Catch any errors and return a bad request response.
    return Response.json({ error: 'Error fetching data' }, { status: 400 });
  }
}
