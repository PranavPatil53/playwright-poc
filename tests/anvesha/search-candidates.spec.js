const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Search Python Developers with 3+ Years Experience
// Flow: Open App → New Search → Click chip → Send →
//       Card appears → Click "Search Candidates" → Validate table
// ============================================================

test.describe('Anvesha - Candidate Search', () => {

  test('Search for Python Developers with 3+ years experience by chip displayed on the home page', async ({ page }) => {
    const summaryContent = await searchAndLoadCandidates(page);

    // Log the total candidates retrieved
    console.log(`✅ Test passed! Summary: ${summaryContent}`);
  });

});
