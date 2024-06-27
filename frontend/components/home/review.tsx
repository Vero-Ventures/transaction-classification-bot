'use client';

import { useEffect, useState } from 'react';
import { CategorizedTransaction, Transaction } from '@/types/Transaction';
import { ClassifiedCategory } from '@/types/Category';
import { ReviewTable } from '@/components/data-table/review-table';
import { find_purchase, update_purchase } from '@/actions/quickbooks';

export default function ReviewPage({
  categorizedTransactions,
  categorizationResults,
}: {
  categorizedTransactions: CategorizedTransaction[];
  categorizationResults: Record<string, ClassifiedCategory[]>;
}) {
  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCategories = async () => {
      const initialCategories: Record<string, string> = {};
      categorizedTransactions.forEach(transaction => {
        const firstCategory =
          categorizationResults[transaction.transaction_ID]?.[0]?.name;
        if (firstCategory) {
          initialCategories[transaction.transaction_ID] = firstCategory;
        }
      });
      setSelectedCategories(initialCategories);
    };

    initializeCategories();
  }, [categorizedTransactions, categorizationResults]);

  const handleCategoryChange = (transaction_ID: string, category: string) => {
    setSelectedCategories({
      ...selectedCategories,
      [transaction_ID]: category,
    });
  };

  const handleSave = async (selectedRows: CategorizedTransaction[]) => {
    setIsSaving(true);
    try {
      await Promise.all(
        selectedRows.map(async transaction => {
          const transactionID = transaction.transaction_ID;
          // get the purchase object from QuickBooks
          const purchaseObj = await find_purchase(transactionID, false);

          // get id of the selected category
          const categoryName = selectedCategories[transactionID];
          const accountID = transaction.categories.find(
            category => category.name === categoryName
          )?.id;

          // update the purchase object with the selected category
          if (accountID) {
            const result = await update_purchase(accountID, purchaseObj);
            if (result === '{}') {
              throw new Error('Error saving purchase');
            }
          }
        })
      );
      setError(null);
    } catch (error) {
      console.error('Error saving categories:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Classification Results</h1>
      <ReviewTable
        categorizedTransactions={categorizedTransactions}
        selectedCategories={selectedCategories}
        categorizedResults={categorizationResults}
        handleCategoryChange={handleCategoryChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />
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
    </>
  );
}
