import { refreshToken } from './refreshToken';
import { TokenSet } from 'next-auth';

// Mock fetch function
global.fetch = jest.fn();

describe('refreshToken', () => {
  const originalToken: TokenSet = {
    accessToken: 'originalAccessToken',
    refreshToken: 'originalRefreshToken',
    expiresAt: Date.now() / 1000 + 3600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refresh token successfully', async () => {
    const mockResponseData = {
      access_token: 'newAccessToken',
      refresh_token: 'newRefreshToken',
      expires_in: 3600,
    };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponseData),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const newToken = await refreshToken(originalToken);

    expect(newToken.accessToken).toBe('newAccessToken');
    expect(newToken.refreshToken).toBe('newRefreshToken');
    expect(newToken.expiresAt).toBeGreaterThan(Date.now() / 1000);
  });

  it('should return original token if refresh fails', async () => {
    const mockResponse = {
      ok: false,
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const updatedToken = await refreshToken(originalToken);

    expect(updatedToken).toEqual(originalToken);
  });
});
