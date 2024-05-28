import { getServerSession } from 'next-auth';
import { GET } from './route';
const QB = require('node-quickbooks');

jest.mock('next-auth');
jest.mock('node-quickbooks');

describe('GET function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve purchases correctly', async () => {
    const mockSession = {
      accessToken: 'mockAccessToken',
      realmId: 'mockRealmId',
      refreshToken: 'mockRefreshToken',
    };
    (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);

    const mockPurchases = [
      { id: 1, TotalAmt: 100 },
      { id: 2, TotalAmt: 200 },
    ];
    const mockResp = { QueryResponse: { Purchase: mockPurchases } };
    const mockFindPurchases = jest.fn(
      (query: string, callback: (err: Error | null, data: any) => void) => {
        callback(null, mockResp);
      }
    );
    (QB as jest.Mock).mockImplementationOnce(() => {
      return { findPurchases: mockFindPurchases };
    });

    const response = await GET();
    const jsonResponse = await response.json();

    console.log(jsonResponse); // Log the JSON response

    expect(getServerSession).toHaveBeenCalled();
    expect(Array.isArray(jsonResponse)).toBe(true);
    expect(jsonResponse).toEqual(mockPurchases);
  });
  it('should handle errors during purchase retrieval', async () => {
    const mockError = new Error('Failed to fetch purchases');
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      accessToken: 'mockAccessToken',
      realmId: 'mockRealmId',
      refreshToken: 'mockRefreshToken',
    });
    (QB as jest.Mock).mockImplementationOnce(() => {
      return {
        findPurchases: jest.fn(
          (query: string, callback: (err: Error | null, data: any) => void) => {
            callback(mockError, null);
          }
        ),
      };
    });

    const response = await GET();

    expect(getServerSession).toHaveBeenCalled();
    expect(QB).toHaveBeenCalled();
    expect(response).toEqual(Response.error());
  });
});
