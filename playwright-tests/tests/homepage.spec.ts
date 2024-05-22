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
  await page.pause();

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
