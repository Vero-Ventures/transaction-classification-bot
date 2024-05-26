import { queryLLM } from '@/actions/llm';

export async function POST(req: Request, res: Response) {
  const body = await req.json();
  const query = body.query;
  const context = body.context;

  try {
    const response = await queryLLM(query, context);

    return Response.json(response, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Error fetching data' }, { status: 400 });
  }
}
