import { default as defaultMiddleware } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export function middleware(request: NextRequest) {
  // If the request is coming from the OAuth callback, redirect to the home page,
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  if (callbackUrl) {
    return NextResponse.rewrite(new URL('/', request.url));
  }
  // Otherwise, continue with the default middleware.
  return defaultMiddleware(request as NextRequestWithAuth);
}
