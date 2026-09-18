const { test, expect } = require('@playwright/test');
const { searchAndLoadCandidates } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Table Columns Validation
// Flow: Search → Candidates table → Verify all column headers →
//       Validate data in each column for every candidate row
// ============================================================

// Expected column headers in the candidates table
const EXPECTED_HEADERS = ['Rank', 'Candidate Name', 'Current Role', 'Email', 'Match %', 'Total Experience'];

// Validation patterns for each column
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

test.describe('Anvesha - Table Columns Validation', () => {

  test('Verify the candidates table displays Rank, Candidate Name, Current Role, Email, Match %, and Total Experience correctly', async ({ page }) => {
    // Step 1: Perform the full search flow and wait for candidates to load
    const summaryContent = await searchAndLoadCandidates(page);
    console.log(`📋 ${summaryContent}`);

    // Step 2: Verify all expected column headers are present
    for (const header of EXPECTED_HEADERS) {
      const headerCell = page.locator('th, thead td, .table-header').getByText(header, { exact: false });
      await expect(headerCell.first()).toBeVisible({ timeout: 10000 });
      console.log(`📌 Column header found: "${header}"`);
    }

    // Step 3: Get all table header cells and identify column indices
    const headerCells = page.locator('table th').or(page.locator('table tr:first-child th'));
    const headerCount = await headerCells.count();
    const headerTexts = [];
    for (let i = 0; i < headerCount; i++) {
      headerTexts.push((await headerCells.nth(i).textContent()).trim());
    }
    console.log(`📊 Table headers: [${headerTexts.join(' | ')}]`);

    // Map expected columns to their indices
    const colIndex = {};
    for (const expected of EXPECTED_HEADERS) {
      const idx = headerTexts.findIndex(h => h.toLowerCase().includes(expected.toLowerCase()));
      expect(idx).toBeGreaterThanOrEqual(0);
      colIndex[expected] = idx;
    }

    // Step 4: Validate data in each column for every candidate row
    const tableRows = page.locator('table tr:has(td)');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);

    let invalidRows = [];

    for (let i = 0; i < rowCount; i++) {
      const cells = tableRows.nth(i).locator('td');
      const errors = [];

      // Rank: should be a number
      const rank = (await cells.nth(colIndex['Rank']).textContent()).trim();
      if (!/^\d+$/.test(rank)) errors.push(`Rank="${rank}" (not a number)`);

      // Candidate Name: should be non-empty
      const name = (await cells.nth(colIndex['Candidate Name']).textContent()).trim();
      if (!name || name.length === 0) errors.push('Candidate Name is empty');

      // Current Role: should be non-empty
      const role = (await cells.nth(colIndex['Current Role']).textContent()).trim();
      if (!role || role.length === 0) errors.push('Current Role is empty');

      // Email: should match email format (or be a placeholder for missing email)
      const email = (await cells.nth(colIndex['Email']).textContent()).trim();
      if (email && email !== '-' && email !== '—' && email !== 'N/A' && email !== '' && !EMAIL_REGEX.test(email)) {
        errors.push(`Email="${email}" (invalid format)`);
      }

      // Match %: should contain a percentage number
      const matchPct = (await cells.nth(colIndex['Match %']).textContent()).trim();
      if (!/\d+(\.\d+)?%?/.test(matchPct)) errors.push(`Match %="${matchPct}" (not a percentage)`);

      // Total Experience: should be non-empty
      const experience = (await cells.nth(colIndex['Total Experience']).textContent()).trim();
      if (!experience || experience.length === 0) errors.push('Total Experience is empty');

      if (errors.length > 0) {
        invalidRows.push({ row: i + 1, rank, name, errors });
      }
    }

    // Log sample of first 3 rows
    for (let i = 0; i < Math.min(3, rowCount); i++) {
      const cells = tableRows.nth(i).locator('td');
      const rank = (await cells.nth(colIndex['Rank']).textContent()).trim();
      const name = (await cells.nth(colIndex['Candidate Name']).textContent()).trim();
      const role = (await cells.nth(colIndex['Current Role']).textContent()).trim();
      const email = (await cells.nth(colIndex['Email']).textContent()).trim();
      const match = (await cells.nth(colIndex['Match %']).textContent()).trim();
      const exp = (await cells.nth(colIndex['Total Experience']).textContent()).trim();
      console.log(`👤 Row ${i + 1}: Rank=${rank} | Name=${name} | Role=${role} | Email=${email} | Match=${match} | Exp=${exp}`);
    }

    // Report any invalid rows
    if (invalidRows.length > 0) {
      for (const row of invalidRows) {
        console.log(`❌ Row ${row.row} (${row.name}): ${row.errors.join(', ')}`);
      }
    }

    expect(invalidRows.length).toBe(0);
    console.log(`✅ All ${rowCount} candidate rows have valid data across all 6 columns!`);
  });

});
