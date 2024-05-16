const QB = require('node-quickbooks');
import { get_accounts } from "../server_actions/app";

export async function GET() {
    // Call server action to find accounts and return them.
    const accounts = await get_accounts();
    return Response.json(JSON.parse(accounts));
}
