const QuickBooks = require('node-quickbooks');

export function createQuickBooksClient(
  clientId: string,
  clientSecret: string,
  accessToken: string,
  realmId: string,
  refreshToken: string
) {
  return new QuickBooks(
    clientId,
    clientSecret,
    accessToken,
    false, // no token secret for oAuth 2.0
    realmId,
    true, // use the sandbox?
    true, // enable debugging?
    null, // set minorversion, or null for the latest version
    '2.0', //oAuth version
    refreshToken
  );
}
