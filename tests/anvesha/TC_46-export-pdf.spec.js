const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Export Candidates List as PDF
// Flow: Search → Candidates table → Click PDF download → Validate
// ============================================================

test.describe('Anvesha - PDF Export', () => {

  test('Export candidate list as PDF after searching', async ({ page }) => {
    // Perform the full search flow and wait for candidates to load
    await searchAndLoadCandidates(page);

    // --- Export Flow ---

    // Set up a download listener BEFORE clicking so we capture the event
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.locator('button#downloadPdfBtn').click();

    // Wait for the download to complete
    const download = await downloadPromise;

    // Validate the downloaded file
    const fileName = download.suggestedFilename();
    console.log(`📄 Downloaded file: ${fileName}`);

    // Assert the file is a PDF
    expect(fileName.toLowerCase()).toContain('.pdf');

    // Save the download to a temporary path and verify it has content
    const filePath = await download.path();
    expect(filePath).toBeTruthy();

    // Verify the file is not empty (size > 0)
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    expect(stats.size).toBeGreaterThan(0);
    console.log(`✅ PDF export validated! File: ${fileName}, Size: ${stats.size} bytes`);
  });

});
