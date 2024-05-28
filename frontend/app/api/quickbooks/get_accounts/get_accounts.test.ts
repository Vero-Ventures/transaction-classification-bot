import { get_accounts } from '../../../../actions/quickbooks';
import { GET } from './route';
jest.mock('../../../../actions/quickbooks');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the accounts data correctly', async () => {
    const mockAccountsData = JSON.stringify([{ id: '1', name: 'Account 1' }]);
    (get_accounts as jest.Mock).mockResolvedValueOnce(mockAccountsData);

    const response = await GET();
    const jsonResponse = await response.json();

    expect(get_accounts).toHaveBeenCalled();
    expect(jsonResponse).toEqual(JSON.parse(mockAccountsData));
  });

  it('should handle errors correctly', async () => {
    (get_accounts as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch accounts')
    );

    await expect(GET()).rejects.toThrow('Failed to fetch accounts');
  });
});
