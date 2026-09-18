const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Default Sort Order Verification
// Flow: Search → Candidates table → Read Match % column →
//       Validate values are in descending order
// ============================================================

test.describe('Anvesha - Match % Sort Order', () => {

  test('Verify candidates are sorted by Match % in descending order by default', async ({ page }) => {
    // Step 1: Perform the full search flow and wait for candidates to load
    const summaryContent = await searchAndLoadCandidates(page);
    console.log(`📋 ${summaryContent}`);

    // Step 2: Extract all Match % values from the candidates table
    // Match % cells typically display values like "85%", "72%", etc.
    const matchCells = page.locator('td.match-cell, td[data-column="match"], td:has(.match-score)');
    let matchValues = [];

    // If the specific selectors don't work, fall back to finding % values in table rows
    const cellCount = await matchCells.count();

    if (cellCount > 0) {
      // Use the specific match cells
      for (let i = 0; i < cellCount; i++) {
        const text = await matchCells.nth(i).textContent();
        const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
          matchValues.push(numericValue);
        }
      }
    } else {
      // Fallback: look for percentage values in the table body rows
      const tableRows = page.locator('table tbody tr, .table-body .row, tr[data-row]');
      const rowCount = await tableRows.count();

      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        // Find cells containing a percentage pattern
        const percentCell = row.locator('td, .cell').filter({ hasText: /\d+(\.\d+)?%/ }).first();
        if (await percentCell.count() > 0) {
          const text = await percentCell.textContent();
          const match = text.match(/(\d+(\.\d+)?)%/);
          if (match) {
            matchValues.push(parseFloat(match[1]));
          }
        }
      }
    }

    console.log(`🔢 Match % values found: [${matchValues.join(', ')}]`);
    expect(matchValues.length).toBeGreaterThan(1);

    // Step 3: Verify the values are in descending order
    for (let i = 0; i < matchValues.length - 1; i++) {
      expect(matchValues[i]).toBeGreaterThanOrEqual(matchValues[i + 1]);
    }

    console.log(`✅ All ${matchValues.length} candidates are sorted by Match % in descending order (${matchValues[0]}% → ${matchValues[matchValues.length - 1]}%)`);
  });

});
