import { default as defaultMiddleware } from 'next-auth/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'

export function middleware(request: NextRequest) {

    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl?.endsWith('/')) {
        return NextResponse.rewrite(new URL('/', 'http://localhost:3000'));
    }
    return defaultMiddleware(request as NextRequestWithAuth);
}