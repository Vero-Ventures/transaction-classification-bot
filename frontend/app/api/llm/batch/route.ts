import { batchQueryLLM } from '@/actions/llm';
import { Transaction } from '@/types/Transaction';
import { CategorizedResult } from '@/types/CategorizedResult';

export async function POST(req: Request, res: Response) {
  try {
    // Get the body from the request and parse the transactions and categories.
    const body = await req.json();
    const transactions: Transaction[] = body.transactions || [];
    const categories = body.categories;

    // Query the LLM model with the provided transactions and categories.
    const results: CategorizedResult[] = await batchQueryLLM(
      transactions,
      categories
    );

    // Return the results as a JSON response.
    return Response.json(results, { status: 200 });
  } catch (error) {
    // Catch any errors and return a bad request response.
    console.error('Error handling request:', error);
    return Response.json({ error: 'Error fetching data' }, { status: 400 });
  }
}
