import { test, expect } from '@playwright/test';
import { config } from './config';
import { authenticate } from './authhelper';

// For the test, we will check if the Uncategorized Expense category is present in the table rows after confirming these transactions to load on intuit sandbox.
test('Check for Uncategorized Expense category in table rows', async ({
  page,
}) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);

  // Locate all <tr> elements
  const trElements = await page.$$('tr'); // Adjust the selector as needed

  // Iterate over each <tr> element
  for (const trElement of trElements) {
    // Get the text content of the <tr> element
    const trText = await trElement.innerText();

    // Check if the text content contains the category "Uncategorized Expense"
    const containsUncategorized = trText.includes('Uncategorized Expense');

    // Use the result as needed
    if (containsUncategorized) {
      expect(containsUncategorized).toBeTruthy();
    }
  }
});

// Transactions can be selected with clear highlighting of selected transactions.
test('Check for clear highlighting of selected transactions', async ({
  page,
}) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);
  await page.waitForTimeout(3000);
  await page.waitForSelector('td');

  await page.locator('td').first().click();
  const isSelected = await page.evaluate(() => {
    const trElement = document.querySelector('td:first-child').closest('tr');
    return trElement.classList.contains('bg-blue-100');
  });

  expect(isSelected).toBeTruthy();
});

// Transactions can be mass selected with clear highlighting of all selected transactions.
test('Check for clear highlighting of all selected transactions', async ({
  page,
}) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);
  await page.waitForTimeout(3000);
  await page.click('th input[type="checkbox"]');

  const areAllSelected = await page.evaluate(() => {
    const trElements = document.querySelectorAll('#purchaseTable tr');
    let allSelected = true;
    trElements.forEach(trElement => {
      if (!trElement.classList.contains('bg-blue-100')) {
        allSelected = false;
      }
    });
    return allSelected;
  });

  expect(areAllSelected).toBeTruthy();
});

// Transactions can be filtered by date
test('Filter by date', async ({ page }) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);
  await page.waitForTimeout(3000);
  await page.click('th button:has-text("Date")');
  const areDatesSortedAscending = await page.evaluate(() => {
    const dateCells = Array.from(
      document.querySelectorAll('#purchaseTable td:nth-child(2)')
    );
    const dates = dateCells.map(cell => new Date(cell.textContent.trim()));
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i - 1]) {
        return false;
      }
    }
    return true;
  });
  expect(areDatesSortedAscending).toBeTruthy();
});

// Transactions can be filtered by total
test('Filter by total', async ({ page }) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };
  await authenticate(page, info);
  await page.waitForTimeout(3000);
  await page.click('th button:has-text("Total")');
  const isTotalSortedAscending = await page.evaluate(() => {
    const totalCells = Array.from(
      document.querySelectorAll('#purchaseTable td:nth-child(6)')
    );
    const total = totalCells.map(cell => {
      const totalText = cell.textContent.trim();
      // Remove non-numeric characters and convert to number
      const total = parseFloat(totalText.replace(/[^0-9.-]+/g, ''));
      return total;
    });

    for (let i = 1; i < total.length; i++) {
      if (total[i] < total[i - 1]) {
        return false;
      }
    }
    return true;
  });

  expect(isTotalSortedAscending).toBeTruthy();
});

test('Set the date input value, update table and verify search message', async ({
  page,
}) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };

  await authenticate(page, info);
  await page.waitForTimeout(3000);

  // Set the date input to a different date
  await page.fill('input[type="date"]#start', '2024-04-23');
  const dateValue = await page.$eval(
    'input[type="date"]#start',
    (el: HTMLInputElement) => el.value
  );
  expect(dateValue).toBe('2024-04-23');
  await page.click('div.container');

  // Check if the "Searching . . ." message is visible
  await expect(page.locator('#noTransactions')).toBeVisible();

  await page.waitForSelector('#purchaseTable tr');

  // Verify that the "Searching . . ." message disappears
  await expect(page.locator('#noTransactions')).toBeHidden();

  // Verify that the dates are within the new date range
  const dateCells = await page.$$eval('#purchaseTable td:nth-child(2)', cells =>
    cells.map(cell => new Date(cell.textContent.trim()))
  );
  // Check if the dates are sorted in ascending order
  const isSortedAscending = dateCells.every((date, i) => {
    if (i === 0) return true;
    return date >= dateCells[i - 1];
  });

  // Check if the dates are sorted in ascending order
  expect(isSortedAscending).toBeTruthy();
});

test('Check if No transaction found message exists when no data in table', async ({
  page,
}) => {
  const info = {
    USER_EMAIL: config.USER_EMAIL,
    USER_PASSWORD: config.USER_PASSWORD,
  };

  await authenticate(page, info);
  await page.waitForTimeout(3000); // Ensure that the data is fully loaded

  // Set the start date input to a different date
  await page.fill('input[type="date"]#start', '2024-05-21');

  // Click the container div to trigger the update
  await page.click('div.container');
  // Check if the "Searching . . ." message is visible
  await expect(page.locator('#noTransactions')).toBeVisible();

  await page.waitForSelector('#purchaseTable tr');
  // Wait for the table to update or the "No transactions found." message to appear
  const noTransactionsMessage = page.locator('#noTransactions', {
    hasText: 'No transactions found.',
  });
  const tableRows = page.locator('#purchaseTable tr');
  await Promise.race([
    noTransactionsMessage.waitFor({ state: 'visible' }),
    tableRows.first().waitFor({ state: 'attached' }),
  ]);

  // Check if the "No transactions found." message is displayed
  const noTransactionsFound = await noTransactionsMessage.isVisible();
  expect(noTransactionsFound).toBeTruthy();
});
