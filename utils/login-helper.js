const { expect } = require('@playwright/test');
const users = require('../test-data/users.json');

/**
 * Reusable login helper function.
 * Navigates to the login page and logs in with the specified user type.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} userType - Key from users.json (e.g., 'standardUser', 'lockedOutUser')
 */
async function loginAs(page, userType = 'standardUser') {
  const user = users[userType];
  await page.goto('/');
  await page.locator('#user-name').fill(user.username);
  await page.locator('#password').fill(user.password);
  await page.locator('#login-button').click();
}

/**
 * Logs in and verifies successful navigation to the inventory page.
 * Use this in beforeEach hooks where login + verification is needed.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} userType - Key from users.json
 */
async function loginAndVerify(page, userType = 'standardUser') {
  await loginAs(page, userType);
  await expect(page).toHaveURL(/inventory.html/);
}

module.exports = { loginAs, loginAndVerify };
