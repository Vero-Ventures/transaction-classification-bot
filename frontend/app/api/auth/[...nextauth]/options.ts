import { refreshToken } from '@/lib/refreshToken';
import type { NextAuthOptions } from 'next-auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export const options: NextAuthOptions = {
  // Define the OAuth 2.0 provider for QuickBooks.
  providers: [
    // Client info.
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
      // Define the user info.
      userinfo: {
        async request(context) {
          if (context?.tokens?.access_token) {
            return await context.client.userinfo(context?.tokens?.access_token);
          } else {
            throw new Error('No access token');
          }
        },
      },
      // Define the ID token, the checks, and the profile object.
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
  // Define the JWT, sign in, and session callbacks.
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        // If the account is found, set the token fields with the account and cookie data.
        token.userId = profile?.sub;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.realmId = cookies().get('realmId')?.value;
        token.expiresAt = account.expires_at;
        // Delete the realmId cookie and return the token.
        cookies().delete('realmId');
        return token;
      }
      // If the account is not found and not expired return the token.
      if (token.expiresAt && Date.now() / 1000 < token.expiresAt) {
        return token;
      }

      // If the token is expired, refresh the token and return the new token.
      const newToken = await refreshToken(token);
      return newToken;
    },
    async session({ session, user, token }) {
      session.userId = token.userId;
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.realmId = token.realmId;
      session.expiresAt = token.expiresAt;
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Get the user email from the profile.
        const email = user.email;
        const [first_name, last_name] = user.name?.split(' ') ?? [];

        if (!email) {
          // Log an error if the user email is not found in the session.
          console.error('No user email found in session');
          return false; // Return false to indicate that sign-in failed
        }

        // Check if the user already exists in the database.
        const userData = await prisma.user.findUnique({
          where: { email },
        });

        // If the user does not exist, create a new user in the database.
        if (!userData) {
          try {
            await prisma.user.create({
              data: {
                email,
                first_name: first_name,
                last_name: last_name,
                industry: '',
              },
            });
            // Log the new user created in the database.
            console.log(`New user created in db: ${JSON.stringify(user)}`);
          } catch (createError) {
            // Log an error and return false to indicate that the new user could not be created and the sign in failed.
            console.error('Error creating new user in db:', createError);
            return false;
          }
        }
      } catch (error) {
        // Log an error and return false to indicate there was an error during sign-in.
        console.error('Error during sign-in:', error);
        return false;
      }
      // Return true to indicate that sign-in was successful.
      return true;
    },
  },
  // Define the session max age.
  session: {
    maxAge: 24 * 60 * 60,
  },
};
