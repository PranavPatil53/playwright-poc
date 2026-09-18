const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Combined Skill Extraction (SAP FI & Greenfield)
// Flow: Open App → New Search → Type query with both skills →
//       Submit → Interpretation card → Validate both skill chips →
//       Search Candidates → Hover on Match % → Verify tooltip
//       shows both "sap fi" and "green field development" (matched)
// ============================================================

// Natural language query mentioning both niche skills
const searchQuery = 'developer with sap fi and green field skills';

// The must-have skills we specifically expect Anvesha to extract
const expectedSkill1 = 'sap fi';
const expectedSkill2 = 'greenfield development';

test.describe('Anvesha - Combined Skill Extraction & Candidate Match', () => {

  test('Verify combining SAP FI and Greenfield returns the correct intersection of qualified candidates', async ({ page }) => {
    // Step 1: Navigate to the application and start a fresh search
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Search/i }).click();
    await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });

    // Step 2: Type the natural language query containing both skills into the search input
    const chatInput = page.getByPlaceholder('Paste a job description or describe the candidate you\'re looking for…');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await chatInput.fill(searchQuery);
    console.log(`📝 Search query entered: "${searchQuery}"`);

    // Step 3: Submit the search using Ctrl+Enter
    await chatInput.press('Control+Enter');

    // Step 4: Wait for the search interpretation card to appear
    await expect(
      page.getByText('ANVESHA INTERPRETED YOUR SEARCH', { exact: false })
    ).toBeVisible({ timeout: 30000 });
    console.log('🔍 Interpretation card appeared');

    // Step 5: Validate that both skills are extracted as must-have skill chips
    const skillChip1 = page.locator(`span[data-skill="${expectedSkill1}"]`);
    await expect(skillChip1).toBeVisible({ timeout: 10000 });
    console.log(`🎯 Skill chip "${expectedSkill1}" found on interpretation card`);

    const skillChip2 = page.locator(`span[data-skill="${expectedSkill2}"]`);
    await expect(skillChip2).toBeVisible({ timeout: 10000 });
    console.log(`🎯 Skill chip "${expectedSkill2}" found on interpretation card`);

    // Step 6: Click "Search Candidates" to load results
    await page.getByRole('button', { name: /Search Candidates/i }).click();

    // Step 7: Wait for the candidate summary text to confirm results loaded
    const summaryText = page.getByText(/\d+ candidates/i).first();
    await expect(summaryText).toBeVisible({ timeout: 60000 });
    const summaryContent = await summaryText.textContent();
    console.log(`📋 ${summaryContent.trim()}`);

    // Step 8: Wait for the results table to render with data rows
    const tableRows = page.locator('table tr').filter({ has: page.locator('td') });
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    // Step 9: Locate the first candidate's Match % badge (span.match-cell inside 5th column)
    const firstMatchBadge = tableRows.first().locator('span.match-cell');
    await expect(firstMatchBadge).toBeVisible({ timeout: 10000 });

    const matchPercent = await firstMatchBadge.textContent();
    console.log(`📊 First candidate Match %: "${matchPercent.trim()}"`);

    // Step 10: Read the data-reason attribute which contains the tooltip/hover text
    const dataReason = await firstMatchBadge.getAttribute('data-reason');
    expect(dataReason).not.toBeNull();
    console.log(`💬 Match reason (tooltip): "${dataReason}"`);

    // Step 11: Hover over the badge to visually trigger the tooltip
    await firstMatchBadge.hover();
    await page.waitForTimeout(500);

    // Step 12: Validate the tooltip content for both skills
    const tooltipLower = dataReason.toLowerCase();

    // Assert: data-reason should contain "sap fi" (skill is matched/present)
    expect(tooltipLower).toContain(expectedSkill1);
    expect(tooltipLower).not.toContain(`need:${expectedSkill1}`);
    console.log(`✅ Tooltip confirms "${expectedSkill1}" is matched (no "need:" prefix)`);

    // Assert: data-reason should contain "green field development" (skill is matched/present)
    expect(tooltipLower).toContain(expectedSkill2);
    expect(tooltipLower).not.toContain(`need:${expectedSkill2}`);
    console.log(`✅ Tooltip confirms "${expectedSkill2}" is matched (no "need:" prefix)`);
  });

});
