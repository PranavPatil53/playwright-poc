const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Anaplan Skill Extraction & Candidate Match Validation
// Flow: Open App → New Search → Type query with "Anaplan" →
//       Submit → Interpretation card → Validate skill chip →
//       Search Candidates → Hover on Match % → Verify tooltip
//       shows "anaplan" (matched) and NOT "need:anaplan" (unmatched)
// ============================================================

// Natural language query mentioning the niche skill "Anaplan"
const searchQuery = 'Anaplan developer with anaplan skill';

// The must-have skill we specifically expect Anvesha to extract
const expectedSkill = 'anaplan';

test.describe('Anvesha - Anaplan Skill Extraction & Candidate Match', () => {

  test('Verify Anaplan is extracted and matched candidates show "anaplan" (not "need:anaplan") on hover', async ({ page }) => {
    // Step 1: Navigate to the application and start a fresh search
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Search/i }).click();
    await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });

    // Step 2: Type the natural language query containing "Anaplan" into the search input
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

    // Step 5: Validate that "anaplan" is extracted as a must-have skill chip
    const skillChip = page.locator(`span[data-skill="${expectedSkill}"]`);
    await expect(skillChip).toBeVisible({ timeout: 10000 });
    console.log(`🎯 Skill chip "${expectedSkill}" found on interpretation card`);

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
    // The match badge stores skill breakdown in its data-reason attribute:
    //   <span class="match-cell" data-reason="1/1 mandatory skills matched (anaplan); 1 yrs experience">97%</span>
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

    // Step 12: Validate the tooltip content
    // Assert: data-reason should contain "anaplan" (skill is matched/present)
    expect(dataReason.toLowerCase()).toContain(expectedSkill);

    // Assert: data-reason should NOT contain "need:anaplan" (which means skill is missing)
    expect(dataReason.toLowerCase()).not.toContain(`need:${expectedSkill}`);
    console.log(`✅ Tooltip confirms "${expectedSkill}" is matched (no "need:" prefix) — "${dataReason}"`);
  });

});
