const { test, expect } = require('@playwright/test');
const users = require('../test-data/saucedemo/users.json');

// ============================================================
// SEED TEST — Bootstrap for Playwright Test Agents
//
// This file is used by the Planner agent as a starting point
// to explore the application. It handles login and navigates
// to the main authenticated page so the Planner can begin
// mapping out user flows from a valid state.
//
// Do NOT add test scenarios here — this is purely for setup.
// ============================================================

test.describe('Seed — SauceDemo Bootstrap', () => {

  test('Login and reach the products page', async ({ page }) => {
    // Navigate to the SauceDemo login page
    await page.goto('https://www.saucedemo.com');

    // Fill in valid credentials
    await page.locator('#user-name').fill(users.standardUser.username);
    await page.locator('#password').fill(users.standardUser.password);

    // Click the login button
    await page.locator('#login-button').click();

    // Verify we are on the products/inventory page
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.app_logo')).toHaveText('Swag Labs');

    // The Planner agent starts exploring from here
    // The authenticated products page is the main hub of the application
  });

});
