'use server';
import prisma from '@/lib/db';
import { Category } from '@/types/Category';
export async function getTopCategoriesForTransaction(
  name: string,
  validCategories: Category[]
) {
  try {
    const transaction = await prisma.transactionClassification.findUnique({
      where: { transactionName: name },
      include: { classifications: true },
    });

    if (!transaction || !transaction.classifications) {
      return [];
    }

    const validCategoryMap = validCategories.reduce(
      (acc, category) => {
        acc[category.name] = category.id;
        return acc;
      },
      {} as { [key: string]: string }
    );

    const filteredClassifications = transaction.classifications.filter(
      classification =>
        Object.prototype.hasOwnProperty.call(
          validCategoryMap,
          classification.category
        )
    );

    filteredClassifications.sort((a, b) => b.count - a.count);

    const topClassifications = filteredClassifications.slice(0, 3);

    const result = topClassifications.map(classification => ({
      id: validCategoryMap[classification.category],
      name: classification.category,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching categorized transaction:', error);
    return [];
  }
}
