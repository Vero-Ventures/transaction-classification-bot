import { useEffect, useState } from 'react';
import { formatDate } from '@/utils/format-date';
import { Transaction } from '@/types/Transaction';
import { find_purchase, update_purchase } from '@/actions/quickbooks';
import { ClassifiedCategory } from '@/types/Category';

export default function ReviewPage({
  selectedPurchases,
  categorizedResults,
}: {
  selectedPurchases: Transaction[];
  categorizedResults: Record<string, ClassifiedCategory[]>;
}) {
  // Define the state for the selected categories.
  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the initial categories for the selected purchases.
  useEffect(() => {
    const initializeCategories = async () => {
      // Initialize the initial categories object.
      const initialCategories: Record<string, string> = {};
      // Iterate over the selected purchases and set the initial category.
      selectedPurchases.forEach(purchase => {
        const firstCategory =
          categorizedResults[purchase.transaction_ID]?.[0]?.name;
        if (firstCategory) {
          initialCategories[purchase.transaction_ID] = firstCategory;
        }
      });
      // Set the selected purchases category.
      setSelectedCategories(initialCategories);
    };
    initializeCategories();
  }, [selectedPurchases, categorizedResults]);

  // Define the function to handle category changes for the purchases.
  const handleCategoryChange = (purchaseId: string, category: string) => {
    // Update the selected purchases category.
    setSelectedCategories({
      ...selectedCategories,
      [purchaseId]: category,
    });
  };

  // Save the selected categories (Currently Logging).
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(selectedCategories).map(
          async ([transactionID, category]) => {
            const purchaseObj = await find_purchase(transactionID, false);
            if (purchaseObj) {
              const accountID = categorizedResults[transactionID]?.[0]?.id;
              const result = await update_purchase(accountID, purchaseObj);
              if (result === '{}') {
                throw new Error('Error saving purchase');
              }
            }
          }
        )
      );
      setError(null);
    } catch (error) {
      // Catch and log any errors.
      console.error('Error saving categories:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      // Set values when finished.
      setIsSaving(false);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="container mx-auto w-11/12 py-8">
      <h1 className="text-3xl font-bold mb-4">Results</h1>
      <div className="overflow-x-auto">
        <button
          className={`${isSaving ? 'bg-blue-400' : 'bg-blue-500'} ${!isSaving && 'hover:bg-blue-700'} text-white font-bold py-2 px-4 mt-4 mb-2 rounded-lg`}
          onClick={handleSave}
          disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full table-auto divide-y divide-gray-200 dark:divide-neutral-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-gray-500 text-start">Date</th>
                <th className="px-4 py-2 text-gray-500 text-start">Type</th>
                <th className="px-4 py-2 text-gray-500 text-start">Payee</th>
                <th className="px-4 py-2 text-gray-500 text-start">Category</th>
                <th className="px-4 py-2 text-gray-500 text-start">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {selectedPurchases.map((purchase, index) => (
                <tr key={index}>
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
                    {selectedCategories[purchase.transaction_ID] ? (
                      <select
                        value={selectedCategories[purchase.transaction_ID]}
                        onChange={e =>
                          handleCategoryChange(
                            purchase.transaction_ID,
                            e.target.value
                          )
                        }
                        className="border border-gray-700 rounded-lg px-2 py-1">
                        {categorizedResults[purchase.transaction_ID]?.map(
                          (category, index) => (
                            <option key={index} value={category.name}>
                              {category.name}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <span className="text-red-500">No Matches Found</span>
                    )}
                  </td>
                  <td className="px-4 py-2 min-w-24 font-medium text-gray-800">
                    -${Math.abs(purchase.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className={`fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center ${isModalOpen ? '' : 'hidden'}`}>
        <div className="bg-white w-96 p-6 rounded-lg">
          {error ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-red-500">Error</h2>
              <p className="mb-6 font-medium text-gray-800">{error}</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-green-500">Success</h2>
              <p className="mb-6 font-medium text-gray-800">
                Transactions have been successfully saved.
              </p>
            </>
          )}
          <div className="flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              onClick={() => window.location.reload()}>
              Return to Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
