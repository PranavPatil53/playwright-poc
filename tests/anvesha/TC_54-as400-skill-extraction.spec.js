const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - AS400 Legacy Skill Extraction
// Flow: Open App → New Search → Type natural language query
//       containing "AS400" → Submit → Interpretation card →
//       Validate AS400 is extracted as a must-have skill
// ============================================================

// Natural language query mentioning the niche legacy system skill "AS400"
const searchQuery = 'developer with AS400 mainframe experience';

// The must-have skill we specifically expect Anvesha to extract
const expectedSkill = 'as400';

test.describe('Anvesha - AS400 Skill Extraction', () => {

  test('Verify Anvesha correctly extracts the niche legacy system skill "AS400" from a natural language query', async ({ page }) => {
    // Step 1: Navigate to the application and start a fresh search
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Search/i }).click();
    await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });

    // Step 2: Type the natural language query containing "AS400" into the search input
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

    // Step 5: Validate that "AS400" is extracted as a must-have skill chip
    // Skills appear as <span data-skill="skillname"> on the interpretation card
    const skillChip = page.locator(`span[data-skill="${expectedSkill}"]`);
    await expect(skillChip).toBeVisible({ timeout: 10000 });
    const skillText = await skillChip.textContent();
    console.log(`🎯 Niche legacy skill found: "${skillText.trim()}"`);

    // Step 6: Assert the extracted skill text matches "as400"
    expect(skillText.trim()).toBe(expectedSkill);
    console.log(`✅ Anvesha correctly extracted the niche legacy system skill "AS400" from the natural language query`);
  });

});
