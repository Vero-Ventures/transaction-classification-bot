import { queryLLM } from '@/actions/llm';

export async function POST(req: Request, res: Response) {
  const body = await req.json();
  const name = body.name;
  const query = body.query;
  const context = body.context;
  const categorys = body.categorys;

  try {
    const response = await queryLLM(query, context, name, categorys);

    return Response.json(response, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Error fetching data' }, { status: 400 });
  }
}
