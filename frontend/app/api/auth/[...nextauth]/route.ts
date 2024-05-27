import NextAuth from 'next-auth';
import { options } from './options';
import { cookies } from 'next/headers';

const handler = NextAuth(options);

const GET = async (req: Request, res: Response) => {
  // Define the url from the request.
  const url = new URL(req.url || '');
  // check if request is from /api/auth/callback/quickbooks
  if (url.pathname === '/api/auth/callback/quickbooks') {
    const realmId = url.searchParams.get('realmId');
    if (realmId) {
      cookies().set('realmId', realmId, { secure: true });
    }
  }
  // Pass the request.
  return handler(req, res);
};

export { GET as GET, handler as POST };
