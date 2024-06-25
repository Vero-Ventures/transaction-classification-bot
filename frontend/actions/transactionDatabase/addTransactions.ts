import prisma from '@/lib/db';
import { Transaction } from '@/types/Transaction';

export async function addTransactions(transactions: Transaction[]) {
  // Iterate through each transaction in the input array.
  for (const transaction of transactions) {
    try {
      // Check if a TransactionClassification with the same name already exists in the database.
      const existingTransaction =
        await prisma.transactionClassification.findUnique({
          where: { transactionName: transaction.name },
          include: { classifications: true },
        });

      if (existingTransaction) {
        // Find if the current transaction's category already exists in the classifications array
        const existingCategory = existingTransaction.classifications.find(
          (classification: { category: string }) =>
            classification.category === transaction.category
        );

        if (existingCategory) {
          // If the category already exists, increment its count by 1
          await prisma.classification.update({
            where: { id: existingCategory.id },
            data: { count: { increment: 1 } },
          });
        } else {
          // If the category doesn't exist, create a new classification
          await prisma.classification.create({
            data: {
              category: transaction.category,
              count: 1,
              transactionClassificationId: existingTransaction.id,
            },
          });
        }
      } else {
        // If the TransactionClassification doesn't exist, create a new one
        await prisma.transactionClassification.create({
          data: {
            transactionName: transaction.name,
            classifications: {
              create: {
                category: transaction.category,
                count: 1,
              },
            },
          },
        });
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }
}
