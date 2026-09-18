const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Must Have Skills Extraction from Job Description
// Flow: Open App → New Search → Paste JD → Submit →
//       Interpretation card → Validate extracted must-have skills
// ============================================================

// Sample Job Description with clear must-have skills
const jobDescription = `
We are looking for a Senior Data Scientist to join our analytics team.
The ideal candidate should have 5+ years of experience in machine learning,
deep learning, and statistical analysis. Proficiency in Python, TensorFlow,
and SQL is required. Experience with cloud platforms like AWS or Azure
is a plus. The candidate should hold a Master's or PhD in Computer Science,
Statistics, or a related field.
`.trim();

// The must-have skills we expect Anvesha to extract from the JD
const expectedMustHaveSkills = ['python', 'tensorflow', 'sql'];

test.describe('Anvesha - Must Have Skills Extraction', () => {

  test('Verify Must Have Skills are correctly extracted from a natural language job description', async ({ page }) => {
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

    // Step 5: Validate each expected must-have skill appears as a skill chip
    // Skills appear as <span data-skill="skillname"> on the interpretation card
    const extractedSkills = [];

    for (const skill of expectedMustHaveSkills) {
      const skillChip = page.locator(`span[data-skill="${skill}"]`);
      await expect(skillChip).toBeVisible({ timeout: 10000 });
      const skillText = await skillChip.textContent();
      extractedSkills.push(skillText.trim());
      console.log(`🎯 Must-have skill found: "${skillText.trim()}"`);
    }

    // Step 6: Log summary of all extracted must-have skills
    console.log(`✅ All ${extractedSkills.length} must-have skills correctly extracted: [${extractedSkills.join(', ')}]`);
  });

});
