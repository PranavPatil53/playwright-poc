const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Results Persist on Page Refresh
// Flow: Search → Candidates table → Capture results →
//       Refresh page → Verify results are identical
// ============================================================

test.describe('Anvesha - Results Persist on Refresh', () => {

  test('Verify results persist correctly when the page is refreshed while viewing results', async ({ page }) => {
    // Step 1: Perform the full search flow and wait for candidates to load
    const summaryBefore = await searchAndLoadCandidates(page);
    console.log(`📋 Before refresh — Summary: ${summaryBefore}`);

    // Step 2: Capture the candidate table data before refresh
    const tableRows = page.locator('table tr:has(td)');
    const rowCountBefore = await tableRows.count();
    expect(rowCountBefore).toBeGreaterThan(0);
    console.log(`📊 Before refresh — Row count: ${rowCountBefore}`);

    // Capture the first 5 candidate names for comparison
    const namesToCompare = Math.min(5, rowCountBefore);
    const namesBefore = [];
    for (let i = 0; i < namesToCompare; i++) {
      const name = await tableRows.nth(i).locator('td').nth(1).textContent();
      namesBefore.push(name.trim());
    }
    console.log(`👤 Before refresh — First ${namesToCompare} names: [${namesBefore.join(', ')}]`);

    // Step 3: Refresh the page using Ctrl+R keyboard shortcut
    await page.keyboard.press('Control+r');
    await page.waitForLoadState('networkidle');
    console.log('🔄 Page refreshed via Ctrl+R');

    // Step 4: Wait for the candidates table to re-appear after refresh
    const summaryLocator = page.getByText(/\d+ candidates/i).first();
    await expect(summaryLocator).toBeVisible({ timeout: 60000 });
    const summaryAfter = (await summaryLocator.textContent()).trim();
    console.log(`📋 After refresh — Summary: ${summaryAfter}`);

    // Step 5: Verify the summary text matches
    expect(summaryAfter).toBe(summaryBefore);
    console.log('✅ Summary text matches after refresh');

    // Step 6: Verify the row count matches
    const tableRowsAfter = page.locator('table tr:has(td)');
    const rowCountAfter = await tableRowsAfter.count();
    expect(rowCountAfter).toBe(rowCountBefore);
    console.log(`✅ Row count matches: ${rowCountAfter}`);

    // Step 7: Verify the candidate names match
    const namesAfter = [];
    for (let i = 0; i < namesToCompare; i++) {
      const name = await tableRowsAfter.nth(i).locator('td').nth(1).textContent();
      namesAfter.push(name.trim());
    }
    console.log(`👤 After refresh — First ${namesToCompare} names: [${namesAfter.join(', ')}]`);

    for (let i = 0; i < namesToCompare; i++) {
      expect(namesAfter[i]).toBe(namesBefore[i]);
    }

    console.log(`✅ All results persist correctly after page refresh!`);
  });

});
