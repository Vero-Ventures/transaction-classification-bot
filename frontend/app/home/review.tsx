import { useEffect, useState } from "react";
import { Purchase } from "@/interfaces/purchase";
import { formatDate } from "@/utils/format-date";
import { formatPrice } from "@/utils/format-price";

export default function ReviewPage({ selectedPurchases, categorizedResults }: { selectedPurchases: Purchase[], categorizedResults: Record<string, string[]> }) {
    const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});

    useEffect(() => {
        const initialCategories: Record<string, string> = {};
        selectedPurchases.forEach((purchase) => {
            const firstCategory = categorizedResults[purchase.Id]?.[0];
            if (firstCategory) {
                initialCategories[purchase.Id] = firstCategory;
            }
        });
        setSelectedCategories(initialCategories);
    }, [selectedPurchases, categorizedResults]);

    const handleCategoryChange = (purchaseId: string, category: string) => {
        setSelectedCategories({
            ...selectedCategories,
            [purchaseId]: category
        });
    };

    const handleSave = () => {
        console.log(selectedCategories);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Results</h1>
            <div className="overflow-x-auto">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-4 mb-2 rounded-lg"
                    onClick={handleSave}>
                    Save
                </button>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <table className="w-full table-auto divide-y divide-gray-200 dark:divide-neutral-700">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-gray-500 text-start">Date</th>
                                <th className="px-4 py-2 text-gray-500 text-start">Type</th>
                                <th className="px-4 py-2 text-gray-500 text-start">No.</th>
                                <th className="px-4 py-2 text-gray-500 text-start">Payee</th>
                                <th className="px-4 py-2 text-gray-500 text-start">Category</th>
                                <th className="px-4 py-2 text-gray-500 text-start">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                            {selectedPurchases.map((purchase, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {formatDate(purchase.TxnDate) || '-'}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {purchase.PaymentType || '-'}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {purchase.DocNumber || '-'}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {purchase.EntityRef?.name || '-'}
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        <select
                                            value={selectedCategories[purchase.Id] || ''}
                                            onChange={(e) => handleCategoryChange(purchase.Id, e.target.value)}
                                            className="border border-gray-700 rounded-lg px-2 py-1"
                                        >
                                            {categorizedResults[purchase.Id]?.map((category, index) => (
                                                <option key={index} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-gray-800">
                                        {formatPrice(purchase.TotalAmt) || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
