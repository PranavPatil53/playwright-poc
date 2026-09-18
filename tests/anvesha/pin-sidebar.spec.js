const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Pin Sidebar
// Flow: Open App → Click sidebar toggle → Click pin button →
//       Verify pin icon color changes (pinned state)
// ============================================================

test.describe('Anvesha - Pin Sidebar', () => {

  test('Verify clicking the pin button changes its icon color', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Expand the sidebar
    const sidebarToggleBtn = page.locator('#sidebarToggle');
    await expect(sidebarToggleBtn).toBeVisible({ timeout: 10000 });
    await sidebarToggleBtn.click();

    // Wait for sidebar to expand
    await page.waitForTimeout(500);

    // Get the pin icon's color before clicking
    const pinIcon = page.locator('#pinBtn i.fa-thumbtack');
    await expect(pinIcon).toBeVisible({ timeout: 10000 });
    const colorBefore = await pinIcon.evaluate(el => getComputedStyle(el).color);

    // Click the pin button
    await page.locator('#pinBtn').click();
    await page.waitForTimeout(500);

    // Verify the pin icon color changed after clicking
    const colorAfter = await pinIcon.evaluate(el => getComputedStyle(el).color);
    expect(colorAfter).not.toBe(colorBefore);
  });

});

