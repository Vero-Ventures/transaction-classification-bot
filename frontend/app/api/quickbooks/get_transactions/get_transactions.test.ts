import { get_transactions } from '../../../../actions/quickbooks';
import { GET } from './route'; // Update this path to your actual module path

jest.mock('../../../../actions/quickbooks');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the transactions data correctly', async () => {
    const mockTransactionsData = JSON.stringify([{ id: '1', amount: 100 }]);
    (get_transactions as jest.Mock).mockResolvedValueOnce(mockTransactionsData);

    const response = await GET();
    const jsonResponse = await response.json();

    expect(get_transactions).toHaveBeenCalled();
    expect(jsonResponse).toEqual(JSON.parse(mockTransactionsData));
  });

  it('should handle errors correctly', async () => {
    (get_transactions as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch transactions')
    );

    await expect(GET()).rejects.toThrow('Failed to fetch transactions');
  });
});
