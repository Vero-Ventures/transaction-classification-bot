'use server';
import { Transaction, SearchEngineTransaction } from '@/types/Transaction';
import { typesense } from '@/lib/typesense-client';
import { v4 as uuidv4 } from 'uuid';

export const classify = async (transactions: Transaction[]) => {
  const userID = uuidv4();
  const transactionsWithUserID: SearchEngineTransaction[] = transactions.map(
    transaction => ({
      ...transaction,
      userId: userID,
    })
  );

  try {
    const result = await typesense
      .collections('transactions')
      .documents()
      .import(transactionsWithUserID);
    console.log('Transactions added:', result);
  } catch (error) {
    console.error('Error adding transactions:', error);
  }
};
