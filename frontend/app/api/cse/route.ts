import { fetchCustomSearch } from "@/lib/customsearch";

export async function GET(req: Request, res: Response) {
    const url = new URL(req.url || '');

    console.log('in custom search route');
    console.log('url', url);

    const query = url.searchParams.get('query') || '';

    console.log('query', query);

    try {
        const response = await fetchCustomSearch(query);
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