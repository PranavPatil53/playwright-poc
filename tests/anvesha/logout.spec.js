const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Logout
// Flow: Open App → Click logout button → Redirected to login page
// ============================================================

test.describe('Anvesha - Logout', () => {

  test('Verify clicking the logout button redirects to the login page', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click the logout button
    const logoutBtn = page.locator('a[href="/logout"]');
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    // Verify the URL changed to the login page
    await page.waitForURL('**/login', { timeout: 10000 });
  });

});
