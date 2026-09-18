const { test, expect } = require('@playwright/test');
const { searchPythonDevelopers } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - New Chat Button in Sidebar
// Flow: Search → Results visible → Open sidebar →
//       Click "+" (New Chat) → Verify fresh conversation starts
// ============================================================

test.describe('Anvesha - New Chat from Sidebar', () => {

  test('Verify the "+" (New Chat) button in the sidebar starts a fresh conversation session', async ({ page }) => {
    // Step 1: Perform a search so we have an active conversation
    await searchPythonDevelopers(page);
    console.log('🔍 Search performed — interpretation card is visible');

    // Verify we have an active conversation (interpretation card present)
    await expect(
      page.getByText('ANVESHA INTERPRETED YOUR SEARCH', { exact: false })
    ).toBeVisible();

    // Step 2: Open the sidebar by clicking the toggle (hamburger) button
    const sidebarToggleBtn = page.locator('#sidebarToggle');
    await expect(sidebarToggleBtn).toBeVisible({ timeout: 10000 });
    await sidebarToggleBtn.click();
    await page.waitForTimeout(500); // Wait for sidebar animation

    // Verify sidebar is expanded with "Recent Searches"
    await expect(page.getByText('Recent Searches')).toBeVisible({ timeout: 10000 });
    console.log('📂 Sidebar expanded');

    // Step 3: Click the "+" (New Chat) button in the sidebar
    const newChatBtn = page.getByRole('button', { name: /New Search/i });
    await expect(newChatBtn).toBeVisible({ timeout: 10000 });
    await newChatBtn.click();
    console.log('➕ Clicked "New Chat" button');

    // Step 4: Verify a fresh conversation session has started

    // 4a. The "Welcome to Anvesha" message should be visible
    await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });
    console.log('✅ Welcome message is displayed');

    // 4b. The search input should be empty (fresh session)
    const chatInput = page.getByPlaceholder('Paste a job description or describe the candidate you\'re looking for…');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await expect(chatInput).toHaveValue('', { timeout: 5000 });
    console.log('✅ Search input is empty');

    // 4c. Suggestion chips should be visible again (fresh welcome page)
    const pythonChip = page.locator('button.chip', { hasText: 'Python developers, 3+ yrs' });
    await expect(pythonChip).toBeVisible({ timeout: 10000 });
    console.log('✅ Suggestion chips are visible');

    // 4d. The previous interpretation card should no longer be visible
    await expect(
      page.getByText('ANVESHA INTERPRETED YOUR SEARCH', { exact: false })
    ).not.toBeVisible({ timeout: 5000 });
    console.log('✅ Previous search results are cleared');

    console.log('✅ New Chat button successfully starts a fresh conversation session!');
  });

});
