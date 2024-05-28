import { classifyTransactions } from './classify';
import { get_accounts } from '@/actions/quickbooks';
import { batchQueryLLM } from '@/actions/llm';
import { Transaction } from '../types/Transaction';

jest.mock('@/actions/quickbooks');
jest.mock('@/actions/llm');

const categorizedTransactions = [
  {
    transaction_ID: '1',
    name: 'Transaction 1',
    date: '2024-05-14',
    transaction_type: 'Cash Expense',
    account: 'Cash',
    category: '',
    amount: 50.0,
  },
  {
    transaction_ID: '2',
    name: 'Transaction 2',
    date: '2024-05-14',
    transaction_type: 'Credit Card Expense',
    account: 'Credit Card',
    category: '',
    amount: 80.0,
  },
];
const uncategorizedTransactions = [
  {
    transaction_ID: '3',
    name: 'Transaction 3',
    date: '2024-05-14',
    transaction_type: 'Cash Expense',
    account: 'Cash',
    category: '',
    amount: 40.0,
  },
];
describe('classifyTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should classify transactions with matches found', async () => {
    const validCategories = ['Category 1', 'Category 2'];

    (get_accounts as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(['Category 1', 'Category 2'])
    );

    (batchQueryLLM as jest.Mock).mockResolvedValueOnce([
      { transaction_ID: '3', possibleCategories: ['Category 1'] },
    ]);

    const result = await classifyTransactions(
      categorizedTransactions,
      uncategorizedTransactions
    );

    expect(result).toEqual({
      '3': ['Category 1'],
    });
  });
  it('should not throw an error if categorizedTransactions is not an array', async () => {
    (get_accounts as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(['Category 1', 'Category 2'])
    );

    (batchQueryLLM as jest.Mock).mockResolvedValueOnce([
      { transaction_ID: '3', possibleCategories: ['Category 1'] },
    ]);

    // Expect classifyTransactions NOT to throw an error
    await expect(
      classifyTransactions({}, uncategorizedTransactions)
    ).resolves.not.toThrowError('categorizedTransactions is not an array');
  });
});
