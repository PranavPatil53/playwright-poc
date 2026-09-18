const { test, expect } = require('@playwright/test');
const data = require('../../test-data/webapp-poc/checkout-data.json');

// ============================================================
// 01 - WEBAPP POC GUEST CHECKOUT
// Concepts: Guest Checkout, Form Actions, Selectors, Waiters
// ============================================================

test.describe('Webapp POC Checkout Flow', () => {
  /* test.use({ 
     viewport: null,
     launchOptions: {
       args: ['--start-maximized']
     }
   });*/

  test('Guest checkout and place order with card', async ({ page }) => {
    // Step 1: Open the website
    await page.goto('https://test.newbalance.co.uk/');

    // Dismiss cookie consent banner (blocks other elements)
    const cookieBtn = page.locator('#onetrust-accept-btn-handler');
    await cookieBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
    if (await cookieBtn.isVisible()) {
      await cookieBtn.click();
      await cookieBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
    }

    // Dismiss country/region modal if present
    const countryModal = page.locator('#change-country-modal');
    if (await countryModal.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click "Continue" button or the X close button
      const continueLink = countryModal.locator('a:has-text("Continue"), button:has-text("Continue")').first();
      if (await continueLink.isVisible().catch(() => false)) {
        await continueLink.click();
      } else {
        // Fallback: close the modal via the X button
        await countryModal.locator('button.close, [aria-label="Close"]').click();
      }
      await countryModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
    }

    // Step 2: Scroll down and click on "Shoes" category
    await page.getByRole('link', { name: 'Shoes img alt text', exact: false }).first().click();

    // Step 3: Select the specific shoe
    await page.getByRole('link', { name: 'M411V2-33404-M411LB2' }).first().click();

    // Step 4: Select a size and Add to Bag
    // The "Enjoy 10%" popup often appears here and blocks the screen. Dismiss it first.
    await page.waitForTimeout(2000); // Wait a moment for it to potentially trigger
    await page.keyboard.press('Escape'); // Press escape to close any active modal

    const closePromo = page.locator('button[aria-label="Close"], button.close, .modal-close').last();
    if (await closePromo.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closePromo.click();
    }

    // Select width if required (Standard is usually pre-selected, but just in case)
    const widthStandard = page.getByRole('button', { name: 'Standard', exact: true });
    if (await widthStandard.isVisible()) {
      await widthStandard.click();
    }

    // Wait for and click size 9 or 8 using exact text match
    const size9 = page.getByText('9', { exact: true });
    const size8 = page.getByText('8', { exact: true });

    if (await size9.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await size9.first().evaluate(el => el.click());
    } else if (await size8.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await size8.first().evaluate(el => el.click());
    } else {
      // Fallback: click any element that looks like an available size (e.g. 7.5)
      const sizeFallback = page.getByText('7.5', { exact: true });
      if (await sizeFallback.first().isVisible().catch(() => false)) {
        await sizeFallback.first().evaluate(el => el.click());
      }
    }

    await page.getByRole('button', { name: 'Add to Bag' }).click();

    // Wait for the cart to update
    await page.waitForTimeout(3000);

    // Step 5: Proceed to Cart / Checkout
    // Use dispatchEvent to bypass viewport/scroll issues when minicart is partially hidden
    await page.locator('.minicart-link, a[href*="cart"]').first().dispatchEvent('click');

    // Sometimes we go to the cart page, sometimes a minicart opens
    const checkoutBtns = page.locator('button, a, [role="button"]').filter({ hasText: /Checkout/i });
    await checkoutBtns.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });
    for (let i = 0; i < await checkoutBtns.count(); i++) {
      const btn = checkoutBtns.nth(i);
      const text = await btn.textContent();
      if (text && !text.toLowerCase().includes('paypal') && await btn.isVisible()) {
        await btn.evaluate(el => el.click());
        break;
      }
    }

    // Step 6: Guest Checkout Selection
    const guestBtns = page.locator('button, a, [role="button"], label, div, span').filter({ hasText: /Guest checkout/i });
    await guestBtns.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => { });
    for (let i = 0; i < await guestBtns.count(); i++) {
      const btn = guestBtns.nth(i);
      // Ensure exact text match or very close to it to avoid matching huge parent containers
      const text = (await btn.textContent() || "").trim().toLowerCase();
      if (text === 'guest checkout' && await btn.isVisible()) {
        await btn.evaluate(el => el.click());
        break;
      }
    }

    // Step 7: Fill Shipping Details
    await page.getByRole('textbox', { name: /Email/i }).fill(data.guestCheckout.email);
    await page.getByRole('textbox', { name: /Phone/i }).fill(data.guestCheckout.phone);
    await page.getByRole('textbox', { name: /First Name/i }).fill(data.guestCheckout.firstName);
    await page.getByRole('textbox', { name: /Last Name/i }).fill(data.guestCheckout.lastName);
    // Type 'London' to trigger the address autocomplete — broader term ensures results
    // Using .fill() bypasses JS keystroke events and the address lookup rejects the input
    // Previous CSS selectors (input[id*="address" i]) matched a hidden input (addressValidationMessage)
    const streetInput = page.getByRole('textbox', { name: /Street Address/i });
    await streetInput.click();
    await streetInput.fill('');
    await streetInput.pressSequentially('London', { delay: 1000 });

    const streetInput1 = page.getByRole('textbox', { name: /Street Address/i });
    await streetInput1.click();
    await streetInput1.fill('');
    await streetInput1.pressSequentially('London', { delay: 100 });

    // Dropdown 1: Address suggestions appear after typing
    // Wait for the autocomplete dropdown, then select the first suggestion
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Dropdown 2: City/postal code options appear immediately after selecting from dropdown 1
    // Select the first option to auto-fill address, city, and postcode fields
    await page.waitForTimeout(3000);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    // Wait for all address fields to be auto-populated after dropdown selection
    await page.waitForTimeout(5000);

    // Proceed to Payment
    await page.getByRole('button', { name: /Continue to Payment/i }).click({ force: true });

    // Confirm Shipping Address / Save & Continue to Payment if modal appears
    const saveAndContinueBtn = page.getByRole('button', { name: /Save & continue|Save and continue/i });
    if (await saveAndContinueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveAndContinueBtn.click();
    }

    // Step 8: Fill Payment Details
    // Payment fields (Card Number, Expiry Date, CVV) are inside Adyen hosted iframes in the payment form
    await page.waitForTimeout(8000);

    // 1. Credit Card Number (First iframe in form)
    const cardNumberInput = page.frameLocator('form iframe').nth(0).getByRole('textbox', { name: /Card number/i });
    await cardNumberInput.waitFor({ state: 'visible', timeout: 15000 });
    await cardNumberInput.click();
    await cardNumberInput.fill(data.payment.cardNumber);

    // 2. Expiration Date (Second iframe in form)
    const expiryInput = page.frameLocator('form iframe').nth(1).getByRole('textbox', { name: /Expiry date/i });
    await expiryInput.waitFor({ state: 'visible', timeout: 15000 });
    await expiryInput.click();
    await expiryInput.fill(data.payment.expiryDate);

    // 3. Security Code / CVV (Third iframe in form)
    const securityCodeInput = page.frameLocator('form iframe').nth(2).getByRole('textbox', { name: /Security code/i });
    await securityCodeInput.waitFor({ state: 'visible', timeout: 18000 });
    await securityCodeInput.click();
    await securityCodeInput.fill(data.payment.cvv);

    // Step 9: Click 'Review your order' button
    const reviewOrderBtn = page.getByRole('button', { name: /Review your order|Place Order/i }).first();
    if (await reviewOrderBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await reviewOrderBtn.click();
    }

    // Step 10: Select Terms & Conditions checkbox on final page
    await page.waitForTimeout(5000);
    const termsCheckbox = page.getByRole('checkbox')
      .or(page.locator('input[type="checkbox"]'))
      .or(page.locator('label:has-text("Terms & Conditions"), label:has-text("checking this box")'));

    if (await termsCheckbox.count() > 0) {
      const checkbox = termsCheckbox.first();
      if (await checkbox.isVisible({ timeout: 5000 }).catch(() => false)) {
        if (!(await checkbox.isChecked().catch(() => false))) {
          await checkbox.check({ force: true }).catch(async () => {
            await checkbox.click({ force: true });
          });
        }
      }
    }

    // Step 11: Final 'Place your order' button click
    const placeYourOrderBtn = page.getByRole('button', { name: /Place your order/i }).first();
    if (await placeYourOrderBtn.isVisible({ timeout: 9000 }).catch(() => false)) {
      await placeYourOrderBtn.click();
    }

    // Step 12: Verify order placement confirmation ("Thank you for your order!")
    const thankYouText = page.getByText(/Thank you for your order/i)
      .or(page.locator('h1, h2, h3').filter({ hasText: /Thank you/i }));
    await expect(thankYouText.first()).toBeVisible({ timeout: 100000 });
  });

});
