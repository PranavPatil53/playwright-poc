const { test, expect } = require('@playwright/test');
const { loginAndVerify } = require('../utils/login-helper');

// ============================================================
// 03 - CART TESTS
// Concepts: getByText, filter, nth(), toHaveCount, cart badge
// ============================================================

test.describe('Shopping Cart Tests', () => {

  // Login and navigate to products page before each test
  test.beforeEach(async ({ page }) => {
    await loginAndVerify(page);
  });

  test('Add a single product to the cart', async ({ page }) => {
    // Click "Add to cart" on the first product
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Verify the cart badge shows 1
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');

    // Verify the button text changed to "Remove"
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  test('Add multiple products to the cart', async ({ page }) => {
    // Add 3 products to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click();

    // Verify the cart badge shows 3
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('3');
  });

  test('Remove a product from the cart on inventory page', async ({ page }) => {
    // Add a product
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Remove the product
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // Verify the cart badge disappears (no items)
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('Navigate to cart and verify added items', async ({ page }) => {
    // Add 2 products
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Click on the cart icon to navigate to cart page
    await page.locator('.shopping_cart_link').click();

    // Verify we are on the cart page
    await expect(page).toHaveURL(/cart.html/);
    await expect(page.locator('.title')).toHaveText('Your Cart');

    // Verify 2 items are in the cart
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    // Verify specific product names are in the cart
    await expect(page.locator('.inventory_item_name').nth(0)).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_item_name').nth(1)).toHaveText('Sauce Labs Bike Light');
  });

  test('Remove a product from the cart page', async ({ page }) => {
    // Add 2 products
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    // Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(2);

    // Remove the first product (Backpack)
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    // Verify only 1 item remains
    await expect(page.locator('.cart_item')).toHaveCount(1);

    // Verify the remaining item is Bike Light
    await expect(page.locator('.inventory_item_name')).toHaveText('Sauce Labs Bike Light');
  });

  test('Continue Shopping button returns to products page', async ({ page }) => {
    // Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart.html/);

    // Click "Continue Shopping"
    await page.locator('[data-test="continue-shopping"]').click();

    // Verify we are back on the products page
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

});
