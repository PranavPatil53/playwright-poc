const { test, expect } = require('@playwright/test');
const users = require('../test-data/users.json');

// ============================================================
// 01 - LOGIN TESTS
// Concepts: goto, fill, click, toHaveURL, toHaveText, test.describe
// ============================================================

test.describe('Login Page Tests', () => {

  // Navigate to login page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Successful login with valid credentials', async ({ page }) => {
    // Fill in the username
    await page.locator('#user-name').fill(users.standardUser.username);

    // Fill in the password
    await page.locator('#password').fill(users.standardUser.password);

    // Click the login button
    await page.locator('#login-button').click();

    // Verify we are redirected to the inventory/products page
    await expect(page).toHaveURL(/inventory.html/);

    // Verify the Products title is visible
    await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
    // await expect(page.getByText('Swag Labs')).toHaveText('Swag Labs');
    // await expect(page.locator('//div[@class="app_logo"]')).toHaveText('Swag Labs');
  });
  //div[@class="app_logo"]
  //id attribute is not available for this element
  test('Login fails with locked out user', async ({ page }) => {
    // Fill in the locked out username
    await page.locator('#user-name').fill(users.lockedOutUser.username);

    // Fill in the password
    await page.locator('#password').fill(users.lockedOutUser.password);

    // Click the login button
    await page.locator('#login-button').click();

    // Verify error message is displayed
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Sorry, this user has been locked out');
  });

  test('Login fails with invalid credentials', async ({ page }) => {
    // Fill in wrong username
    await page.locator('#user-name').fill(users.invalidUser.username);

    // Fill in wrong password
    await page.locator('#password').fill(users.invalidUser.password);

    // Click the login button
    await page.locator('#login-button').click();

    // Verify error message is displayed
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match');
  });

  test('Login fails with empty username and password', async ({ page }) => {
    // Click login without entering credentials
    await page.locator('#login-button').click();

    // Verify error message about required username
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username is required');
  });

  test('Login fails with empty password', async ({ page }) => {
    // Fill only the username
    await page.locator('#user-name').fill(users.standardUser.username);

    // Click login without entering password
    await page.locator('#login-button').click();

    // Verify error message about required password
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Password is required');
  });

});
