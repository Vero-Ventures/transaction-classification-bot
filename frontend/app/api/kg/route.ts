import { fetchKnowledgeGraph } from "@/lib/knowledgegraph";

export async function GET(req: Request, res: Response) {
    const url = new URL(req.url || '');
    const query = url.searchParams.get('query') || '';

    try {
        const response = await fetchKnowledgeGraph(query);
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