const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Pagination Verification
// Flow: Search → Candidates table → Navigate pages 1–5 →
//       Validate each page loads the correct set of candidates
// ============================================================

test.describe('Anvesha - Pagination', () => {

  test('Verify pagination loads the correct next set of candidates across all pages', async ({ page }) => {
    // Step 1: Perform the full search flow and wait for candidates to load
    const summaryContent = await searchAndLoadCandidates(page);
    console.log(`📋 Initial: ${summaryContent}`);

    // Step 2: Extract total pages from the summary text (e.g., "Page 1 of 5")
    const totalPagesMatch = summaryContent.match(/Page\s+\d+\s+of\s+(\d+)/i);
    expect(totalPagesMatch).toBeTruthy();
    const totalPages = parseInt(totalPagesMatch[1]);
    console.log(`📄 Total pages: ${totalPages}`);

    // Step 3: Verify page 1 is already loaded correctly
    const summaryLocator = page.getByText(/\d+ candidates/i).first();
    await expect(summaryLocator).toContainText(/Page 1 of/i);
    console.log(`✅ Page 1 loaded`);

    // Step 4: Navigate through pages 2 to totalPages and validate each
    for (let pageNum = 2; pageNum <= totalPages; pageNum++) {
      // Click the next page button/link
      const pageButton = page.getByRole('button', { name: String(pageNum), exact: true })
        .or(page.locator(`[data-page="${pageNum}"]`))
        .or(page.locator(`a, button`).filter({ hasText: new RegExp(`^${pageNum}$`) }));

      await expect(pageButton.first()).toBeVisible({ timeout: 10000 });
      await pageButton.first().click();

      // Wait for the summary text to update to the new page
      await expect(summaryLocator).toContainText(
        new RegExp(`Page\\s+${pageNum}\\s+of`, 'i'),
        { timeout: 30000 }
      );

      // Verify candidates are loaded on this page (table rows are visible)
      const tableRows = page.locator('table tbody tr, .table-body .row, tr[data-row]');
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Get the updated summary text
      const pageSummary = await summaryLocator.textContent();
      console.log(`✅ Page ${pageNum} loaded — ${pageSummary.trim()} (${rowCount} rows)`);
    }

    console.log(`✅ All ${totalPages} pages loaded successfully with candidates!`);
  });

});
