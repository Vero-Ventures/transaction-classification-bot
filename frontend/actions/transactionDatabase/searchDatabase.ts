'use server';
import prisma from '@/lib/db';
import { Category } from '@/types/Category';

interface Classification {
  category: string;
  count: number;
}

export async function getTopCategoriesForTransaction(
  name: string,
  validCategories: Category[]
): Promise<{ id: string; name: string }[]> {
  try {
    const transaction = await prisma.transactionClassification.findUnique({
      where: { transactionName: name },
      include: { classifications: true },
    });

    if (!transaction?.classifications) {
      return [];
    }

    const validCategoryMap = validCategories.reduce<{ [key: string]: string }>(
      (acc, category) => {
        acc[category.name] = category.id;
        return acc;
      },
      {}
    );

    const filteredClassifications = transaction.classifications.filter(
      (classification: Classification) =>
        Object.hasOwn(validCategoryMap, classification.category)
    );

    filteredClassifications.sort(
      (a: Classification, b: Classification) => b.count - a.count
    );

    const topClassifications = filteredClassifications.slice(0, 3);

    const result = topClassifications.map((classification: Classification) => ({
      id: validCategoryMap[classification.category],
      name: classification.category,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching categorized transaction:', error);
    return [];
  }
}
