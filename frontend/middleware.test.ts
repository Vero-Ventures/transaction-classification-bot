import { middleware } from './middleware';
import { NextResponse } from 'next/server';

jest.mock('next-auth/middleware', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('next/server', () => ({
  __esModule: true,
  NextResponse: {
    rewrite: jest.fn(),
  },
}));

describe('middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should rewrite the URL if callbackUrl is present', () => {
    const request = {
      nextUrl: new URL('http://example.com/?callbackUrl=someUrl'),
      url: new URL('http://example.com/'),
    } as any; // Mocking the request object

    const result = middleware(request);

    expect(NextResponse.rewrite).toHaveBeenCalledWith(
      new URL('/', request.url)
    );
    expect(result).toBeUndefined();
  });

  it('should call default middleware if callbackUrl is not present', () => {
    const request = {
      nextUrl: new URL('http://example.com/'),
      url: new URL('http://example.com/'),
    } as any; // Mocking the request object

    const result = middleware(request);

    expect(NextResponse.rewrite).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
