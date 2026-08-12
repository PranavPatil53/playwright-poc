const { test, expect } = require('@playwright/test');
const path = require('path');

// ============================================================
// SWAG LABS LOGIN TEST - Data-Driven from Excel
// Reads locators & credentials from an Excel file
// ============================================================

const { readExcelData } = require('../../utils/excel-reader');

// Read locators and test data from Excel
const excelPath = path.resolve(__dirname, '..', '..', 'test-data', 'practice', 'swagLabsTestData.xlsx');
const testData = readExcelData(excelPath);
const locators = testData['Login'];   // { usernameField, passwordField, loginButton, errorMessage, productsTitle }
const loginCredentials = testData['Data']; // { username, password }

test.describe('Swag Labs Login - Excel-Driven', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
  });

  test('Successful login with credentials from Excel', async ({ page }) => {
    // Fill username using locator from Excel
    await page.locator(locators.usernameField).fill(loginCredentials.username);

    // Fill password using locator from Excel
    await page.locator(locators.passwordField).fill(loginCredentials.password);

    // Click login button using locator from Excel
    await page.locator(locators.loginButton).click();

    // Verify redirect to inventory page
    await expect(page).toHaveURL(/inventory.html/);

    // Verify the Products title is visible using locator from Excel
    await expect(page.locator(locators.productsTitle)).toHaveText('Products');
  });

  test('Login fails with invalid credentials from Excel', async ({ page }) => {
    // Fill username with an invalid value
    await page.locator(locators.usernameField).fill('invalid_user');

    // Fill password with an invalid value
    await page.locator(locators.passwordField).fill('wrong_password');

    // Click login button using locator from Excel
    await page.locator(locators.loginButton).click();

    // Verify error message using locator from Excel
    const errorMsg = page.locator(locators.errorMessage);
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username and password do not match');
  });

  test('Login fails with empty credentials', async ({ page }) => {
    // Click login without entering any credentials
    await page.locator(locators.loginButton).click();

    // Verify error message using locator from Excel
    const errorMsg = page.locator(locators.errorMessage);
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username is required');
  });

});
