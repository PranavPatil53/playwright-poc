const { test, expect } = require('@playwright/test');
const { loginAndVerify } = require('../../utils/login-helper');

// ============================================================
// 05 - NAVIGATION TESTS
// Concepts: hamburger menu, getByRole, toHaveURL, logout flow
// ============================================================

test.describe('Navigation Tests', () => {

  // Login before each test
  test.beforeEach(async ({ page }) => {
    await loginAndVerify(page);
  });

  test('Open and close hamburger menu', async ({ page }) => {
    // Open the hamburger menu
    await page.locator('#react-burger-menu-btn').click();

    // Verify the menu is visible with all options
    const menu = page.locator('.bm-menu');
    await expect(menu).toBeVisible();

    // Verify menu items are present
    await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
    await expect(page.locator('#about_sidebar_link')).toBeVisible();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await expect(page.locator('#reset_sidebar_link')).toBeVisible();

    // Close the menu
    await page.locator('#react-burger-cross-btn').click();

    // Verify the menu is hidden
    await expect(menu).not.toBeVisible();
  });

  test('Navigate to About page from menu', async ({ page }) => {
    // Open the hamburger menu
    await page.locator('#react-burger-menu-btn').click();

    // Click on "About" link
    await page.locator('#about_sidebar_link').click();

    // Verify we navigated to the Sauce Labs website
    await expect(page).toHaveURL(/saucelabs.com/);
  });

  test('Logout redirects to login page', async ({ page }) => {
    // Open the hamburger menu
    await page.locator('#react-burger-menu-btn').click();

    // Click Logout
    await page.locator('#logout_sidebar_link').click();

    // Verify we are back on the login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Verify login form is visible
    await expect(page.locator('#login-button')).toBeVisible();
    await expect(page.locator('#user-name')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('Reset App State clears the cart', async ({ page }) => {
    // Add items to the cart first
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Open the hamburger menu
    await page.locator('#react-burger-menu-btn').click();

    // Click "Reset App State"
    await page.locator('#reset_sidebar_link').click();

    // Close the menu
    await page.locator('#react-burger-cross-btn').click();

    // Verify the cart badge is gone (cart is empty)
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('All Items link navigates back to products', async ({ page }) => {
    // Navigate to cart first
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart.html/);

    // Open the hamburger menu
    await page.locator('#react-burger-menu-btn').click();

    // Click "All Items"
    await page.locator('#inventory_sidebar_link').click();

    // Verify we are back on the products page
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('Social media links are present in the footer', async ({ page }) => {
    // Verify Twitter/X link
    const twitterLink = page.locator('[data-test="social-twitter"]');
    await expect(twitterLink).toBeVisible();

    // Verify Facebook link
    const facebookLink = page.locator('[data-test="social-facebook"]');
    await expect(facebookLink).toBeVisible();

    // Verify LinkedIn link
    const linkedinLink = page.locator('[data-test="social-linkedin"]');
    await expect(linkedinLink).toBeVisible();

    // Verify footer text
    await expect(page.locator('.footer_copy')).toBeVisible();
  });

});
