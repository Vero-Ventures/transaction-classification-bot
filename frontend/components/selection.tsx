import { useState } from 'react';
import { formatDate } from '@/utils/format-date';
import { Transaction } from '@/types/Transaction';
import { get_transactions } from '@/actions/quickbooks';
import { filterUncategorized } from '@/utils/filter-transactions';
import { format } from 'date-fns';

export default function SelectionPage({
  unfilteredPurchases,
  filteredPurchases,
  setPurchases,
  handleSubmit,
  selectedPurchases,
  setSelectedPurchases,
}: {
  unfilteredPurchases: Transaction[];
  filteredPurchases: Transaction[];
  setPurchases: (purchases: Transaction[]) => void;
  handleSubmit: (selectedPurchases: Transaction[]) => void;
  selectedPurchases: Transaction[];
  setSelectedPurchases: (selectedPurchases: Transaction[]) => void;
}) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<string | null>(null);

  // Define states for message elements.
  const [documentMessage, setDocumentMessage] =
    useState<string>('Loading . . .');
  const [documentMessageClass, setDocumentMessageClass] = useState<string>(
    'text-center font-display font-bold opacity-80 md:text-xl mt-8 hidden'
  );
  const [madeDateSearch, setMadeDateSearch] = useState<boolean>(false);

  // Create dates for the default start date and end date.
  const today = new Date();
  const backTwoYears = new Date(
    today.getFullYear() - 2,
    today.getMonth(),
    today.getDate()
  );

  // Record the default start date and end date.
  const [startDate, setStartDate] = useState<string>(
    format(backTwoYears, 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(today, 'yyyy-MM-dd'));

  // Fetch the transactions from the backend when date is updated.
  const handleDateUpdate = async () => {
    try {
      // If start date or end date are before 2000, set them to 2000.
      if (new Date(startDate) < new Date('2000-01-01')) {
        setStartDate('2000-01-01');
      }
      if (new Date(endDate) < new Date('2000-01-01')) {
        setEndDate('2000-01-01');
      }

      // Display a loading message while fetching transactions.
      setDocumentMessage('Searching . . .');
      setDocumentMessageClass(
        'text-center font-display font-bold opacity-80 md:text-xl mt-8'
      );

      // Fetch the transactions from the backend and parse the response.
      const response = await get_transactions(startDate, endDate);
      const result = await JSON.parse(response);

      // Check for a successful response.
      if (result[0].result === 'Success') {
        // Update the purchases and filter out invalid transactions.
        unfilteredPurchases = result;
        setPurchases(filterUncategorized(result.slice(1)));

        // Record that a date search has been made.
        setMadeDateSearch(true);

        // Check for empty transactions.
        if (unfilteredPurchases.length === 1) {
          // Display a message and return if no transactions are found.
          setDocumentMessage('No transactions found.');
          return;
        } else {
          // Otherwise, hide the message and continue.
          setDocumentMessageClass(
            'text-center font-display font-bold opacity-80 md:text-xl mt-8 hidden'
          );
        }
      }
    } catch (error) {
      // If there is an error, log the error to the console.
      console.error('Error fetching purchases:', error);
    }
  };

  // Update the start date if the start date is before the end date.
  // Also check that the start date is in the past but after 2000.
  const handleStartDateChange = (event: string) => {
    if (new Date(event) < new Date(endDate) && new Date(event) < new Date()) {
      setStartDate(event);
    }
  };

  // Update the end date if the end date is after the start date.
  // Also check that the end date is in the past but after 2000.
  const handleEndDateChange = (event: string) => {
    if (new Date(event) > new Date(startDate) && new Date(event) < new Date()) {
      setEndDate(event);
    }
  };

  const selectAll = () => {
    const isSelectedAll = filteredPurchases.length === selectedPurchases.length;
    if (isSelectedAll) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(filteredPurchases);
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

  const mapPurchases = (purchases: Transaction[]) => {
    // If the transactions are still loading, display a loading message.
    if (unfilteredPurchases.length === 0 && madeDateSearch === false) {
      return (
        <tr>
          <td colSpan={6} className="text-center text-lg py-4">
            Loading . . .
          </td>
        </tr>
      );
    }
    // If the transactions have loaded and there are no transactions, display a message.
    if (unfilteredPurchases.length !== 0 && purchases.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center text-lg py-4">
            No transactions found.
          </td>
        </tr>
      );
    }
    const table = purchases.map((purchase, index) => (
      <tr
        key={index}
        onClick={() => selectRow(purchase)}
        className={`${selectedPurchases.some(selectedPurchase => selectedPurchase.transaction_ID === purchase.transaction_ID) ? 'bg-blue-100' : ''}`}>
        <td className="px-4 py-2 text-center">
          <input
            type="checkbox"
            checked={selectedPurchases.some(
              selectedPurchase =>
                selectedPurchase.transaction_ID === purchase.transaction_ID
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
        <td className="px-4 py-2 font-medium text-gray-800">{purchase.name}</td>
        <td className="px-4 py-2 font-medium text-gray-800">
          {purchase.category}
        </td>
        <td className="px-4 py-2 font-medium text-gray-800">
          -${Math.abs(purchase.amount).toFixed(2)}
        </td>
      </tr>
    ));
    return table;
  };

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
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
        <div className="flex justify-between w-full">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 mb-2 rounded-lg"
            onClick={() => handleSubmit(selectedPurchases)}>
            Classify Transactions
          </button>
          <div className="flex items-center">
            <div className="relative">
              <input
                id="start"
                type="date"
                onChange={e => handleStartDateChange(e.target.value)}
                onBlur={handleDateUpdate}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-4 mt-4 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Select date start"
                value={startDate}></input>
            </div>
            <span className="mx-4 text-gray-500">to</span>
            <div className="relative">
              <input
                id="end"
                type="date"
                onChange={e => handleEndDateChange(e.target.value)}
                onBlur={handleDateUpdate}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full py-2 px-4 mt-4 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Select date end"
                value={endDate}></input>
            </div>
          </div>
        </div>
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full table-auto divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-gray-500">
                  <input
                    type="checkbox"
                    checked={
                      filteredPurchases.length === selectedPurchases.length
                    }
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
            <tbody
              id="purchaseTable"
              className="divide-y divide-gray-200 dark:divide-neutral-700">
              {mapPurchases(sortedPurchases)}
            </tbody>
          </table>
        </div>
        <p id="noTransactions" className={documentMessageClass}>
          {documentMessage}
        </p>
      </div>
    </div>
  );
}
