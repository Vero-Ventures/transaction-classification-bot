import prisma from '@/lib/db';
import { Transaction } from '@/types/Transaction';

export async function addTransactions(transactions: Transaction[]) {
  for (const transaction of transactions) {
    try {
      const existingTransaction =
        await prisma.transactionClassification.findUnique({
          where: { transactionName: transaction.name },
          include: { classifications: true },
        });

      if (existingTransaction) {
        const existingCategory = existingTransaction.classifications.find(
          classification => classification.category === transaction.category
        );

        if (existingCategory) {
          await prisma.classification.update({
            where: { id: existingCategory.id },
            data: { count: { increment: 1 } },
          });
        } else {
          await prisma.classification.create({
            data: {
              category: transaction.category,
              count: 1,
              transactionClassificationId: existingTransaction.id,
            },
          });
        }
      } else {
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
