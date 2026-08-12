const { expect } = require('@playwright/test');

/**
 * Performs the standard Anvesha search flow:
 *   1. Open app → 2. Click "Python developers, 3+ yrs" chip →
 *   3. Submit search (Ctrl+Enter) → 4. Wait for interpretation card
 *
 * Use this when you only need the interpretation card visible
 * (e.g., add-role, modify-search tests).
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function searchPythonDevelopers(page) {
  // Step 1: Open the application and start a fresh search
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click "+ New Search" to ensure we start with a fresh welcome page
  await page.getByRole('button', { name: /New Search/i }).click();
  await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });

  // Step 2: Click on the "Python developers, 3+ yrs" suggestion chip
  const pythonChip = page.locator('button.chip', { hasText: 'Python developers, 3+ yrs' });
  await expect(pythonChip).toBeVisible({ timeout: 10000 });
  await pythonChip.click();

  // Step 3: The chip click fills the text input. Now submit using Ctrl+Enter
  const chatInput = page.getByPlaceholder('Paste a job description or describe the candidate you\'re looking for…');
  await expect(chatInput).toHaveValue(/Python/i, { timeout: 5000 });
  await chatInput.press('Control+Enter');

  // Step 4: Wait for the search interpretation card to appear
  await expect(
    page.getByText('ANVESHA INTERPRETED YOUR SEARCH', { exact: false })
  ).toBeVisible({ timeout: 30000 });
}

/**
 * Performs the full search flow including clicking "Search Candidates"
 * and waiting for the candidates table to load.
 *
 * Use this when you need the candidates table visible
 * (e.g., export-pdf, view-resume tests).
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string>} The summary text content (e.g., "500 candidates • Page 1 of 5")
 */
async function searchAndLoadCandidates(page) {
  // Perform the standard search
  await searchPythonDevelopers(page);

  // Validate the card displays "python" as a must-have skill chip
  await expect(page.locator('span[data-skill="python"]')).toBeVisible();

  // Click the "Search Candidates" button on the card
  await page.getByRole('button', { name: /Search Candidates/i }).click();

  // Wait for the candidate summary text (e.g., "500 candidates • Page 1 of 5 • Showing 1–100")
  const summaryText = page.getByText(/\d+ candidates/i).first();
  await expect(summaryText).toBeVisible({ timeout: 60000 });

  return (await summaryText.textContent()).trim();
}

module.exports = { searchPythonDevelopers, searchAndLoadCandidates };
