import { find_purchase } from '@/actions/quickbooks';
import { GET } from './route';

jest.mock('@/actions/quickbooks');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the purchase data correctly', async () => {
    const mockPurchaseData = JSON.stringify({
      id: '57',
      name: 'Test Purchase',
    });
    (find_purchase as jest.Mock).mockResolvedValueOnce(mockPurchaseData);

    const response = await GET();
    const jsonResponse = await response.json();

    expect(find_purchase).toHaveBeenCalledWith('57', true);
    expect(jsonResponse).toEqual({ id: '57', name: 'Test Purchase' });
  });

  it('should handle errors correctly', async () => {
    (find_purchase as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch purchase')
    );

    await expect(GET()).rejects.toThrow();
  });
});
