import { find_industry } from '@/actions/quickbooks';
import { GET } from './route';

jest.mock('@/actions/quickbooks');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle errors correctly', async () => {
    // Mock the find_industry function to throw an error
    (find_industry as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to fetch industry')
    );

    // Expect the GET function to reject
    await expect(GET()).rejects.toThrow();
  });
  it('should return the industry data correctly', async () => {
    const mockIndustryData = { id: '57', name: 'Test Industry' };
    (find_industry as jest.Mock).mockResolvedValueOnce(mockIndustryData);

    const response = await GET();
    const jsonResponse = await response.json();

    expect(find_industry).toHaveBeenCalled();
    expect(jsonResponse).toEqual(mockIndustryData);
  });
});
