'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/utils/format-price';
import { Purchase } from '@/interfaces/purchase';

export default function TransactionsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/quickbooks/get_purchases', {});
        if (!response.ok) {
          throw new Error('Failed to fetch purchases');
        }
        const data = await response.json();
        setPurchases(data);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">My Expenses</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-300 px-4 py-2 text-white">
                Date
              </th>
              <th className="border border-gray-300 px-4 py-2 text-white">
                No.
              </th>
              <th className="border border-gray-300 px-4 py-2 text-white">
                Payee
              </th>
              <th className="border border-gray-300 px-4 py-2 text-white">
                Category
              </th>
              <th className="border border-gray-300 px-4 py-2 text-white">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases?.map((purchase: Purchase, index: number) => (
              <tr key={index} className="border border-gray-300">
                <td className="border border-gray-300 px-4 py-2">
                  {purchase.TxnDate}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {purchase.DocNumber}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {purchase.EntityRef?.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {purchase.Line.length > 0 && (
                    <span>
                      {purchase.Line[0].AccountBasedExpenseLineDetail
                        ?.AccountRef.name ||
                        purchase.Line[0].ItemBasedExpenseLineDetail?.ItemRef
                          .name}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {formatPrice(purchase.TotalAmt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
