import { createQuickBooksClient } from '@/utils/qb-client';
import { options } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { Purchase, PurchaseResponse } from '@/interfaces/purchase';
import { LineItem } from '@/interfaces/line';

export async function GET() {
  const session = await getServerSession(options);

  const oauthToken = session?.accessToken;
  const realmId = session?.realmId;
  const refreshToken = session?.refreshToken;

  try {
    const qbo = createQuickBooksClient(
      process.env.CLIENT_ID || '',
      process.env.CLIENT_SECRET || '',
      oauthToken || '',
      realmId || '',
      refreshToken || ''
    );

    const resp: PurchaseResponse = await new Promise((resolve, reject) => {
      qbo.findPurchases('', (err: Error, data: PurchaseResponse) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });

    // Filter uncategorized purchases
    const purchases = resp.QueryResponse.Purchase.filter((purchase: Purchase) =>
      purchase.Line.some((lineItem: LineItem) =>
        ['AccountBasedExpenseLineDetail', 'ItemBasedExpenseLineDetail'].some(
          (detail: string) => {
            if (detail === 'AccountBasedExpenseLineDetail') {
              const accountRef =
                lineItem.AccountBasedExpenseLineDetail?.AccountRef?.name.toLowerCase();
              return accountRef && accountRef.includes('uncategor');
            } else if (detail === 'ItemBasedExpenseLineDetail') {
              const itemRef =
                lineItem.ItemBasedExpenseLineDetail?.ItemRef?.name.toLowerCase();
              return itemRef && itemRef.includes('uncategor');
            }
            return false;
          }
        )
      )
    );

    return Response.json(purchases);
  } catch (error) {
    console.error(error);
    return Response.error();
  }
}
