const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Role Extraction from Job Description
// Flow: Open App → New Search → Paste JD → Submit →
//       Interpretation card → Validate extracted role
// ============================================================

// Sample Job Description with a clear role to extract
const jobDescription = `
We are looking for a Senior Data Scientist to join our analytics team.
The ideal candidate should have 5+ years of experience in machine learning,
deep learning, and statistical analysis. Proficiency in Python, TensorFlow,
and SQL is required. Experience with cloud platforms like AWS or Azure
is a plus. The candidate should hold a Master's or PhD in Computer Science,
Statistics, or a related field.
`.trim();

// The role we expect Anvesha to extract from the JD
const expectedRole = 'Data Scientist';

test.describe('Anvesha - Role Extraction', () => {

  test('Verify the Role field is correctly extracted from a natural language job description', async ({ page }) => {
    // Step 1: Navigate to the application and start a fresh search
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /New Search/i }).click();
    await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });

    // Step 2: Paste the Job Description into the search input
    const chatInput = page.getByPlaceholder('Paste a job description or describe the candidate you\'re looking for…');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await chatInput.fill(jobDescription);
    console.log('📝 Job Description pasted into search input');

    // Step 3: Submit the search using Ctrl+Enter
    await chatInput.press('Control+Enter');

    // Step 4: Wait for the search interpretation card to appear
    await expect(
      page.getByText('ANVESHA INTERPRETED YOUR SEARCH', { exact: false })
    ).toBeVisible({ timeout: 30000 });
    console.log('🔍 Interpretation card appeared');

    // Step 5: Validate the extracted role on the interpretation card
    // The role appears as a chip with class "role-chip" and a data-role attribute
    const roleChip = page.locator('span.role-chip[data-role="data scientist"]');
    await expect(roleChip).toBeVisible({ timeout: 10000 });
    const roleText = await roleChip.textContent();
    console.log(`🎯 Extracted role chip: "${roleText.trim()}"`);

    // Step 6: Verify the "Add Role..." input is also present (card is fully rendered)
    const addRoleInput = page.locator('input.role-input[placeholder="Add Role..."]');
    await expect(addRoleInput).toBeVisible({ timeout: 10000 });

    console.log(`✅ Role "${expectedRole}" was correctly extracted from the Job Description!`);
  });

});
