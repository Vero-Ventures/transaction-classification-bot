import { TokenSet } from 'next-auth';

export async function refreshToken(token: TokenSet): Promise<TokenSet> {
  const refreshToken = token?.refreshToken;
  const authorization =
    'Basic ' +
    Buffer.from(
      process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
    ).toString('base64');
  const url = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: authorization,
    Accept: 'application/json',
  };
  const data = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken as string,
  });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw responseData;
    }

    const newToken = {
      ...token,
      accessToken: responseData.access_token,
      refreshToken: responseData.refresh_token,
      expiresAt: Date.now() / 1000 + responseData.expires_in,
    } as TokenSet;

    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return token;
  }
}
