const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Sidebar Toggle
// Flow: Open App → Click sidebar toggle (hamburger) button →
//       Sidebar expands → Validate "Recent Searches" text visible
// ============================================================

test.describe('Anvesha - Sidebar Toggle', () => {

  test('Verify clicking the sidebar toggle button expands the sidebar with recent chats', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click the sidebar toggle (hamburger) button
    const sidebarToggleBtn = page.locator('#sidebarToggle');
    await expect(sidebarToggleBtn).toBeVisible({ timeout: 10000 });
    await sidebarToggleBtn.click();

    // Verify the "Recent Searches" text appears in the expanded sidebar
    const recentSearchesText = page.getByText('Recent Searches');
    await expect(recentSearchesText).toBeVisible({ timeout: 10000 });
  });

});
