const QB = require('node-quickbooks');
import { find_purchase } from '../../../../actions/quickbooks';

export async function GET() {
  // *** TESTING ID AND FORMATTING BOOLEAN ***
  const id = '57';
  const format_response = true;
  // Call server action to find the purchase and return it.
  const purchase = await find_purchase(id, format_response);
  return Response.json(JSON.parse(purchase));
}
