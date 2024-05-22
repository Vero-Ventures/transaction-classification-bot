'use server';

import { options } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
const QB = require('node-quickbooks');

// Create a QuickBooks client object.
export async function create_qb_object() {
  // Get the server session and save it as a constant.
  const session = await getServerSession(options);

  // Record the server session values.
  const oauthToken = session?.accessToken;
  const realmId = session?.realmId;
  const refreshToken = session?.refreshToken;

  // Create the QuickBooks API calls object.
  const qbo = new QB(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    oauthToken,
    false,
    realmId,
    false,
    true,
    null,
    '2.0',
    refreshToken
  );

  // Return the QuickBooks API calls object.
  return qbo;
}
