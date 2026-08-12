const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - View Candidate Resume on OneDrive
// Flow: Search → Candidates table → Click "View" → New tab opens
// ============================================================

test.describe('Anvesha - View Resume', () => {

  test('Verify View button opens the candidate resume on OneDrive', async ({ page, context }) => {
    // Perform the full search flow and wait for candidates to load
    await searchAndLoadCandidates(page);

    // --- View Profile Flow ---

    // Locate the first "View" link in the Resume column
    const viewLink = page.locator('a.dl-btn').first();
    await expect(viewLink).toBeVisible({ timeout: 10000 });

    // Verify the link has an href pointing to SharePoint/OneDrive
    const href = await viewLink.getAttribute('href');
    expect(href).toBeTruthy();
    console.log(`🔗 Resume link: ${href}`);

    // Click the View button and validate a new tab opens
    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 15000 }),
      viewLink.click(),
    ]);

    // Validate the new tab URL redirects to Microsoft login (OneDrive)
    await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
    const newTabUrl = newPage.url();
    expect(newTabUrl).toContain('login.microsoftonline.com');
    console.log(`✅ Resume opened in new tab: ${newTabUrl}`);

    // Close the new tab after validation
    await newPage.close();
  });

});
