const QB = require('node-quickbooks');
import { get_transactions } from '../../../../actions/quickbooks';

export async function GET() {
  // Call server action to find accounts and return them.
  const transactions = await get_transactions();
  return Response.json(JSON.parse(transactions));
}
