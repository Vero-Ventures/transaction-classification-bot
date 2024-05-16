import { get_purchases } from '../server_actions/app';

export async function GET() {
  const purchases = await get_purchases();
  return Response.json(purchases);
}
