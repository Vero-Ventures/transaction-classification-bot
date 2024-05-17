import { batchQueryLLM } from "@/actions/llm";
import { Transaction, CategorizedResult } from "@/types/Transaction";

export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json();
        const transactions: Transaction[] = body.transactions || [];

        const results: CategorizedResult[] = await batchQueryLLM(transactions);

        return Response.json(
            results,
            { status: 200 }
        );
    } catch (error) {
        console.error('Error handling request:', error);
        return Response.json(
            { error: 'Error fetching data' },
            { status: 400 }
        );
    }
}
