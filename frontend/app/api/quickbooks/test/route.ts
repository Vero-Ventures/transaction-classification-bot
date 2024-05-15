import { options } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
const QB = require('node-quickbooks');

export async function GET() {
  const session = await getServerSession(options);

  const oauthToken = session?.accessToken;
  const realmId = session?.realmId;
  const refreshToken = session?.refreshToken;

  try {
    const qbo = new QB(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      oauthToken,
      false,
      realmId,
      true,
      true,
      null,
      '2.0',
      refreshToken
    );

    const resp: any = await new Promise((resolve, reject) => {
      qbo.findPurchases('', (err: Error, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });

    // sort by TotalAmt
    const purchases = resp.QueryResponse.Purchase;
    purchases.sort((a: any, b: any) => {
      return a.TotalAmt - b.TotalAmt;
    });

    return Response.json(purchases);
  } catch (error) {
    return Response.error();
  }
}
