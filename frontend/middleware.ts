import { default as defaultMiddleware } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export function middleware(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  const pathname = request.nextUrl.pathname;
  const allowedPaths = ['/privacy-policy'];
  if (allowedPaths.includes(pathname)) {
    return NextResponse.next();
  }
  if (callbackUrl) {
    return NextResponse.rewrite(new URL('/', request.url));
  }
  return defaultMiddleware(request as NextRequestWithAuth);
}
