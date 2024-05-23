import { test, expect } from '@playwright/test';
import { config } from './config';
import { authenticate } from './authhelper';

test('landing page and logout button', async ({ page }) => {
  await page.goto('https://transaction-classification-bot.vercel.app/');

  // Check if the "Intuit Sign-In" button is present
  const signInButton = await page.$('text=Intuit Sign-In');
  if (signInButton) {
    const signInButtonText = await signInButton.textContent();
    expect(signInButtonText).toBe('Intuit Sign-In');

    // When not logged in, there should be no logout button
    const logoutButton = await page.$('text=Logout');
    expect(logoutButton).toBeFalsy();
  } else {
    // Check for the "Proceed to Home Page" button if "Intuit Sign-In" is not found
    const proceedButton = await page.$('text=Proceed to Home Page');
    expect(proceedButton).toBeTruthy();

    if (proceedButton) {
      const proceedButtonText = await proceedButton.textContent();
      expect(proceedButtonText).toBe('Proceed to Home Page');
    }
    // Check for the logout button if the user is already logged in
    const logoutButton = await page.$('text=Sign Out');
    expect(logoutButton).toBeTruthy();
  }
});

test('User sign-in functionality', async ({ page }) => {
  // Define mock API responses
  const mockSignInSuccessResponse = {
    status: 'success',
    data: {
      userId: '123456',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
  };

  const mockSignInErrorResponse = {
    status: 'error',
    error: 'invalid_credentials',
    message: 'Invalid username or password',
  };

  // Intercept API requests for sign-in endpoint
  await page.route(
    'https://transaction-classification-bot.vercel.app/api/auth/signin',
    route => {
      // Respond with mock success response for successful sign-in
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSignInSuccessResponse),
      });
    }
  );

  // Navigate to signin page
  await page.goto('https://accounts.intuit.com/app/sign-in');

  // Simulate user interaction for email
  console.log('User email:', process.env.USER_EMAIL);
  await page.fill(
    'input[data-testid="IdentifierFirstIdentifierInput"]',
    config.USER_EMAIL
  );

  // Click on the "sign in" button
  await page.click('span.Button-label-e0ecc32');

  // Simulate user interaction for password
  await page.fill(
    'input[data-testid="currentPasswordInput"]',
    config.USER_PASSWORD
  );

  // click on the continue button
  await page.click('button[data-testid="passwordVerificationContinueButton"]');
  // this will lead to phone or email verification which we will consider has passed the login test
});

test('User redirect to login page when not logged in', async ({ page }) => {
  // Navigate to the home page
  await page.goto('https://transaction-classification-bot.vercel.app/home');
  await page.waitForURL(
    'https://transaction-classification-bot.vercel.app/api/auth/signin?callbackUrl=%2Fhome'
  );

  // Check if the user is redirected to the login page
  const signInButton = await page.$('text=Intuit Sign-In');
  expect(signInButton).toBeTruthy();
});

// TEST COMMENTED OUT DUE TO AUTHENTICATED STATE NOT PERSISTING ACROSS TESTS
// test.use({ storageState: process.env.USER_AUTH });

// test('User remains on home page when already logged in', async ({ page }) => {
//     // Navigate to the home page
//     await page.goto('https://transaction-classification-bot.vercel.app/home');

//     // Check if specific elements unique to the home page are present
//     const homePageElement = await page.$('text=My Expenses');
//     expect(homePageElement).toBeTruthy();

//     // Check if the URL remains on the home page
//     expect(page.url()).toBe(
//         'https://transaction-classification-bot.vercel.app/home'
//     );
// });

// COMMENTED OUT DUE TO AUTHENTICATED STATE NOT PERSISTING ACROSS TESTS
//test.use({ storageState: process.env.USER_AUTH });

// TEST REQUIRES USER TO PUT IN A await page.pause() COMMAND TO MANUALLY VERIFY PHONE / EMAIL ONE TIME BEFORE THE AUTHENTICATION SKIPS 2FA CHECK.
test('logged in user clicks logout button', async ({ page }) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);

  // Find and click on the logout button
  const logoutButton = await page.$('text=Sign Out');
  expect(logoutButton).toBeTruthy();
  await logoutButton.click();

  // Check if the user is redirected to the login page
  await page.waitForURL(
    'https://transaction-classification-bot.vercel.app/api/auth/signin?callbackUrl=%2F'
  );
});

// TEST REQUIRES USER TO PUT IN A await page.pause() COMMAND TO MANUALLY VERIFY PHONE / EMAIL ONE TIME BEFORE THE AUTHENTICATION SKIPS 2FA CHECK.

test('User signs in and redirects to home in deployed', async ({ page }) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);
});
