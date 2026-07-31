const { test, expect } = require('@playwright/test');
const { loginAndVerify } = require('../utils/login-helper');
const checkoutData = require('../test-data/checkout.json');

// ============================================================
// 04 - CHECKOUT TESTS
// Concepts: test.beforeEach, full E2E flow, form filling, price validation
// ============================================================

test.describe('Checkout Tests', () => {

  // Login, add a product, and navigate to cart before each test
  test.beforeEach(async ({ page }) => {
    await loginAndVerify(page);
  });

  test('Complete checkout flow - end to end', async ({ page }) => {
    // Step 1: Add a product to the cart
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Step 2: Go to cart
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart.html/);

    // Step 3: Click Checkout
    await page.locator('[data-test="checkout"]').click();
    await expect(page).toHaveURL(/checkout-step-one.html/);

    // Step 4: Fill in checkout information
    await page.locator('[data-test="firstName"]').fill(checkoutData.validCheckout.firstName);
    await page.locator('[data-test="lastName"]').fill(checkoutData.validCheckout.lastName);
    await page.locator('[data-test="postalCode"]').fill(checkoutData.validCheckout.postalCode);

    // Step 5: Continue to checkout overview
    await page.locator('[data-test="continue"]').click();
    await expect(page).toHaveURL(/checkout-step-two.html/);

    // Step 6: Verify checkout overview
    await expect(page.locator('.title')).toHaveText('Checkout: Overview');
    await expect(page.locator('.cart_item')).toHaveCount(1);

    // Step 7: Finish the order
    await page.locator('[data-test="finish"]').click();
    await expect(page).toHaveURL(/checkout-complete.html/);

    // Step 8: Verify order confirmation
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('Checkout form validation - empty fields', async ({ page }) => {
    // Add a product and go to checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Try to continue without filling any fields
    await page.locator('[data-test="continue"]').click();

    // Verify error message for first name
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('First Name is required');
  });

  test('Checkout form validation - missing last name', async ({ page }) => {
    // Add a product and go to checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Fill only first name
    await page.locator('[data-test="firstName"]').fill(checkoutData.validCheckout.firstName);
    await page.locator('[data-test="continue"]').click();

    // Verify error message for last name
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Last Name is required');
  });

  test('Checkout form validation - missing postal code', async ({ page }) => {
    // Add a product and go to checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Fill first and last name only
    await page.locator('[data-test="firstName"]').fill(checkoutData.validCheckout.firstName);
    await page.locator('[data-test="lastName"]').fill(checkoutData.validCheckout.lastName);
    await page.locator('[data-test="continue"]').click();

    // Verify error message for postal code
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Postal Code is required');
  });

  test('Verify order summary pricing', async ({ page }) => {
    // Add a product (Sauce Labs Backpack - $29.99)
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Navigate through checkout
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill(checkoutData.validCheckout.firstName);
    await page.locator('[data-test="lastName"]').fill(checkoutData.validCheckout.lastName);
    await page.locator('[data-test="postalCode"]').fill(checkoutData.validCheckout.postalCode);
    await page.locator('[data-test="continue"]').click();

    // Verify the item total
    const itemTotal = page.locator('.summary_subtotal_label');
    await expect(itemTotal).toContainText('$29.99');

    // Verify tax is present
    const tax = page.locator('.summary_tax_label');
    await expect(tax).toBeVisible();
    const taxText = await tax.textContent();
    expect(taxText).toContain('$');

    // Verify total price is present and greater than item price (includes tax)
    const total = page.locator('.summary_total_label');
    await expect(total).toBeVisible();
    const totalText = await total.textContent();
    const totalValue = parseFloat(totalText.replace(/[^0-9.]/g, ''));
    expect(totalValue).toBeGreaterThan(29.99);
  });

  test('Cancel checkout returns to cart', async ({ page }) => {
    // Add a product and go to checkout
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();

    // Click Cancel
    await page.locator('[data-test="cancel"]').click();

    // Verify we are back on the cart page
    await expect(page).toHaveURL(/cart.html/);
  });

});
