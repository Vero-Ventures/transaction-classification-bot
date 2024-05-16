const QB = require('node-quickbooks');
import { find_industry } from '../../../../actions/quickbooks';

export async function GET() {
  // Call server action to find the purchase and return it.
  const industry = await find_industry();
  return Response.json(industry);
}
