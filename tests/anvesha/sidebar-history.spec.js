const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Sidebar History
// Flow: Open App → Hover over sidebar → Verify "Recent Searches"
//       section displays a list of past conversations
// ============================================================

test.describe('Anvesha - Sidebar History', () => {

  test('Verify the history in the sidebar opens the list of past conversations', async ({ page }) => {
    // Step 1: Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('🏠 App loaded');

    // Step 2: Hover over the sidebar to expand it
    const sidebar = page.locator('aside');
    await sidebar.hover();
    await page.waitForTimeout(500); // Wait for sidebar expand animation

    // Step 3: Verify "Recent Searches" heading is visible
    const recentSearchesHeading = page.getByText('Recent Searches');
    await expect(recentSearchesHeading).toBeVisible({ timeout: 10000 });
    console.log('📂 "Recent Searches" section is visible');

    // Step 4: Get the count of history items from the sidebar DOM
    // History items are clickable divs with cursor:pointer inside the sidebar,
    // located after the "Recent Searches" heading
    const historyCount = await sidebar.evaluate((aside) => {
      // Find all elements with cursor pointer style inside the sidebar
      // that are NOT buttons (to exclude New Search, pin, etc.)
      const allItems = aside.querySelectorAll('div[style*="cursor"], div[class*="chat"], div[class*="history"]');
      if (allItems.length > 0) return allItems.length;

      // Fallback: find the scrollable container that holds history entries
      // It's the second child of the section that contains "Recent Searches"
      const headings = aside.querySelectorAll('div');
      for (const el of headings) {
        if (el.textContent === 'Recent Searches' && el.parentElement) {
          const container = el.parentElement.nextElementSibling;
          if (container) return container.children.length;
        }
      }
      return 0;
    });

    expect(historyCount).toBeGreaterThan(0);
    console.log(`📜 Found ${historyCount} past conversation(s) in history`);

    // Step 5: Log the first few conversation titles
    const titles = await sidebar.evaluate((aside) => {
      const results = [];
      const headings = aside.querySelectorAll('div');
      for (const el of headings) {
        if (el.textContent === 'Recent Searches' && el.parentElement) {
          const container = el.parentElement.nextElementSibling;
          if (container) {
            const items = container.children;
            for (let i = 0; i < Math.min(5, items.length); i++) {
              results.push(items[i].textContent.trim());
            }
          }
          break;
        }
      }
      return results;
    });

    for (let i = 0; i < titles.length; i++) {
      console.log(`  💬 History item ${i + 1}: "${titles[i]}"`);
    }

    console.log(`✅ Sidebar history displays ${historyCount} past conversation(s)!`);
  });

});
