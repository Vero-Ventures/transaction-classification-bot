import { useState } from 'react';
import { formatDate } from '@/utils/format-date';
import { Transaction } from '@/types/Transaction';

export default function SelectionPage({
  purchases,
  handleSubmit,
  selectedPurchases,
  setSelectedPurchases,
}: {
  purchases: Transaction[];
  handleSubmit: (selectedPurchases: Transaction[]) => void;
  selectedPurchases: Transaction[];
  setSelectedPurchases: (selectedPurchases: Transaction[]) => void;
}) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<string | null>(null);

  const selectAll = () => {
    const isSelectedAll = purchases.length === selectedPurchases.length;
    if (isSelectedAll) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(purchases);
    }
  };

  const selectRow = (purchase: Transaction) => {
    const isSelected = selectedPurchases.some(
      selectedPurchase =>
        selectedPurchase.transaction_ID === purchase.transaction_ID
    );
    if (isSelected) {
      setSelectedPurchases(
        selectedPurchases.filter(
          selectedPurchase =>
            selectedPurchase.transaction_ID !== purchase.transaction_ID
        )
      );
    } else {
      setSelectedPurchases([...selectedPurchases, purchase]);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const sortedPurchases = [...purchases].sort((a, b) => {
    if (sortColumn === 'Date') {
      return sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortColumn === 'Total') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">My Expenses</h1>
      <div className="overflow-x-auto">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 mb-2 rounded-lg"
          onClick={() => handleSubmit(selectedPurchases)}>
          Classify Transactions
        </button>
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full table-auto divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-gray-500">
                  <input
                    type="checkbox"
                    checked={purchases.length === selectedPurchases.length}
                    onChange={selectAll}
                  />
                </th>
                <th className="px-2 py-1 text-gray-500 text-start">
                  <button
                    className="hover:bg-blue-200 hover:text-gray-600 rounded-lg px-2 py-1"
                    onClick={() => handleSort('Date')}>
                    {sortColumn === 'Date' ? 'Date' : 'Date ↑↓'}{' '}
                    {sortColumn === 'Date' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-2 text-gray-500 text-start">Type</th>
                <th className="px-4 py-2 text-gray-500 text-start">Payee</th>
                <th className="px-4 py-2 text-gray-500 text-start">Category</th>
                <th className="px-4 py-2 text-gray-500 text-start">
                  <button
                    className="hover:bg-blue-200 hover:text-gray-600 rounded-lg px-2 py-1"
                    onClick={() => handleSort('Total')}>
                    {sortColumn === 'Total' ? 'Total' : 'Total ↑↓'}{' '}
                    {sortColumn === 'Total' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {sortedPurchases.map((purchase, index) => (
                <tr
                  key={index}
                  onClick={() => selectRow(purchase)}
                  className={`${selectedPurchases.some(selectedPurchase => selectedPurchase.transaction_ID === purchase.transaction_ID) ? 'bg-blue-100' : ''}`}>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPurchases.some(
                        selectedPurchase =>
                          selectedPurchase.transaction_ID ===
                          purchase.transaction_ID
                      )}
                      onChange={() => selectRow(purchase)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {formatDate(purchase.date)}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {purchase.transaction_type}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {purchase.name}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {purchase.category}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    ${purchase.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
