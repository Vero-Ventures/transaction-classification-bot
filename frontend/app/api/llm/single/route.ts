import { queryLLM } from "@/lib/llm";

export async function POST(req: Request, res: Response) {
    const url = new URL(req.url || '');

    console.log('in llm route');

    const body = await req.json();
    const name = body.name || '';
    const query = body.query || 'In 1-2 words, what type of business is ' + body.name + '?';
    const context = body.context || '';

    // console.log('name', name);
    // console.log('query', query);
    // console.log('context', context);

    try {
        const response = await queryLLM(query, context);

        console.log('response', response);

        return Response.json(
            response, 
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            { error: 'Error fetching data' },
            { status: 400 }
        );
    }
}
