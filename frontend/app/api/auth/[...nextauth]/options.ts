import { refreshToken } from '@/lib/refreshToken';
import type { NextAuthOptions } from 'next-auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export const options: NextAuthOptions = {
  providers: [
    {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      id: 'quickbooks',
      name: 'QuickBooks',
      type: 'oauth',
      wellKnown:
        'https://developer.api.intuit.com/.well-known/openid_sandbox_configuration',
      authorization: {
        params: {
          scope:
            'com.intuit.quickbooks.accounting openid profile email phone address',
        },
      },
      userinfo: {
        async request(context) {
          if (context?.tokens?.access_token) {
            return await context.client.userinfo(context?.tokens?.access_token);
          } else {
            throw new Error('No access token');
          }
        },
      },
      idToken: true,
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.givenName + ' ' + profile.familyName,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.userId = profile?.sub;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.realmId = cookies().get('realmId')?.value;
        token.expiresAt = account.expires_at;

        cookies().delete('realmId');
        return token;
      }
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt) {
        return token;
      }

      const newToken = await refreshToken(token);
      return newToken;
    },
    async session({ session, user, token }) {
      session.userId = token.userId;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.realmId = token.realmId;
      session.expiresAt = token.expiresAt;
      console.log(`session callback invoked`);
      return session;
    },
    async signIn({ user, account, profile }) {
      // console.log("User info:", user);
      // console.log("Account info:", account);
      // console.log("Profile data from provider:", profile);
      const email = user.email;
      if (email) {
        const userData = await prisma.user.findUnique({
          where: { email },
        });

        if (userData) {
          // Existing user, check if profile is complete
        } else {
          // New user, presumably profile is not complete
          await prisma.user.create({
            data: {
              email,
              first_name: profile?.givenName,
              last_name: profile?.familyName,
              industry: '',
            },
          });
          (user as any).profileComplete = false;
          console.log(`New user created in db: ${user}`);
        }
      }
      console.log(`signIn callback invoked`);
      return true;
    },
  },
  session: {
    maxAge: 24 * 60 * 60,
  },
};
