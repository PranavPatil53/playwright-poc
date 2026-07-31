const { test, expect } = require('@playwright/test');
const { loginAndVerify } = require('../utils/login-helper');

// ============================================================
// 02 - PRODUCT BROWSING TESTS
// Concepts: locator, count(), allTextContents(), selectOption, toBeVisible
// ============================================================

test.describe('Product Browsing Tests', () => {

  // Login and navigate to products page before each test
  test.beforeEach(async ({ page }) => {
    await loginAndVerify(page);
  });

  test('Products page displays all 6 products', async ({ page }) => {
    // Verify the Products title
    await expect(page.locator('.title')).toHaveText('Products');

    // Verify there are exactly 6 products on the page
    const productCards = page.locator('.inventory_item');
    await expect(productCards).toHaveCount(6);
  });

  test('Each product has name, price, description, and image', async ({ page }) => {
    const productCards = page.locator('.inventory_item');
    const count = await productCards.count();

    // Loop through each product and verify it has all required elements
    for (let i = 0; i < count; i++) {
      const product = productCards.nth(i);

      // Verify product name exists and is not empty
      const name = product.locator('.inventory_item_name');
      await expect(name).toBeVisible();
      const nameText = await name.textContent();
      expect(nameText.length).toBeGreaterThan(0);

      // Verify product price exists and starts with $
      const price = product.locator('.inventory_item_price');
      await expect(price).toBeVisible();
      const priceText = await price.textContent();
      expect(priceText).toContain('$');

      // Verify product description exists
      const description = product.locator('.inventory_item_desc');
      await expect(description).toBeVisible();

      // Verify product image exists
      const image = product.locator('img.inventory_item_img');
      await expect(image).toBeVisible();
    }
  });

  test('Sort products by name A to Z', async ({ page }) => {
    // Select A to Z sorting
    await page.locator('[data-test="product-sort-container"]').selectOption('az');

    // Get all product names
    const names = await page.locator('.inventory_item_name').allTextContents();

    // Verify the names are in alphabetical order
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  });

  test('Sort products by name Z to A', async ({ page }) => {
    // Select Z to A sorting
    await page.locator('[data-test="product-sort-container"]').selectOption('za');

    // Get all product names
    const names = await page.locator('.inventory_item_name').allTextContents();

    // Verify the names are in reverse alphabetical order
    const sortedNames = [...names].sort().reverse();
    expect(names).toEqual(sortedNames);
  });

  test('Sort products by price low to high', async ({ page }) => {
    // Select low to high sorting
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    // Get all product prices
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();

    // Convert prices from "$xx.xx" to numbers
    const prices = priceTexts.map(p => parseFloat(p.replace('$', '')));

    // Verify prices are in ascending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });

  test('Sort products by price high to low', async ({ page }) => {
    // Select high to low sorting
    await page.locator('[data-test="product-sort-container"]').selectOption('hilo');

    // Get all product prices
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();

    // Convert prices from "$xx.xx" to numbers
    const prices = priceTexts.map(p => parseFloat(p.replace('$', '')));

    // Verify prices are in descending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });

  test('Click on a product to view its detail page', async ({ page }) => {
    // Get the first product name
    const firstProductName = await page.locator('.inventory_item_name').first().textContent();

    // Click on the first product
    await page.locator('.inventory_item_name').first().click();

    // Verify we navigated to the product detail page
    await expect(page).toHaveURL(/inventory-item.html/);

    // Verify the product name matches on the detail page
    await expect(page.locator('.inventory_details_name')).toHaveText(firstProductName);

    // Verify the "Back to products" button is visible
    await expect(page.locator('[data-test="back-to-products"]')).toBeVisible();
  });

});
