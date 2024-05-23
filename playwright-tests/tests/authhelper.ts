import { Page } from 'playwright';

interface Config {
  USER_EMAIL: string;
  USER_PASSWORD: string;
}

async function authenticate(page: Page, config: Config): Promise<void> {
  // Navigate to the login page
  await page.goto('https://transaction-classification-bot.vercel.app/home');

  // Click on the login button
  const loginButton = await page.$('text=Intuit Sign-In');
  if (!loginButton) {
    throw new Error('Login button not found');
  }
  await loginButton.click();

  // Fill in the email
  await page.fill(
    'input[data-testid="IdentifierFirstInternationalUserIdInput"]',
    config.USER_EMAIL
  );

  // Click on the "sign in" button
  await page.click('span.Button-label-e0ecc32');

  // Fill in the password
  await page.fill(
    'input[data-testid="currentPasswordInput"]',
    config.USER_PASSWORD
  );

  // Click on the continue button
  await page.click('button[data-testid="passwordVerificationContinueButton"]');

  // Click on the dropdown menu
  await page.click('.DropdownTypeahead-iconBox-8f787c3');

  // Select the desired option
  await page.click('.Menu-menu-item-wrapper-d1d881d');

  // Click on the "Next" button
  await page.click('text=Next');

  // Wait for the redirection to the home page
  await page.waitForURL(
    'https://transaction-classification-bot.vercel.app/home'
  );
}

export { authenticate };
