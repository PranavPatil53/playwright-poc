const { test, expect } = require('@playwright/test');
const { readExcelRows } = require('../../utils/excel-reader');
const { appendMatchReport, REPORT_FILE } = require('../../utils/match-report-writer');
const path = require('path');

// Load test data from Excel
const excelPath = path.join(__dirname, '../../test-data/anvesha/skill-extractions.xlsx');
const testData = readExcelRows(excelPath);

// When true, a missing expected skill is logged only and the test still passes.
// When false (default), it is recorded as a soft assertion failure — the test is
// marked failed at the end, but every remaining step still runs so the match %
// analysis and CSV report are always produced.
const SKILL_CHECKS_INFORMATIONAL = process.env.ANVESHA_SKILLS_INFO === '1';

// Logs emitted while tests are being COLLECTED must go to stderr, never stdout.
// Machine-readable reporters (the JSON reporter used by the VS Code Playwright
// extension for test discovery) parse stdout, and stray text there breaks
// discovery — which is what removes the green "run test" gutter icons.
const collectionLog = (message) => console.error(message);

test.describe('Anvesha - Data-Driven Skill Extraction & Candidate Match', () => {

  // Loop through each row in the Excel sheet and create a test
  for (const data of testData) {
    const { TestID, TestDescription, SearchQuery, ExpectedSkills, Run } = data;

    // Skip rows that don't have the minimum required data.
    // ExpectedSkills is optional — a blank cell means "no skill validation, just
    // run the match % analysis for this query".
    if (!TestID || !SearchQuery) {
      collectionLog(`⏭️  Skipping row with missing TestID/SearchQuery: ${JSON.stringify(data)}`);
      continue;
    }

    // Skip rows where Run column is not set to 1 (selective execution)
    if (Number(Run) !== 1) {
      collectionLog(`⏭️  Skipping [${TestID}] ${TestDescription} (Run = ${Run ?? 0})`);
      continue;
    }

    // Split expected skills by comma for multi-skill queries
    const expectedSkillsList = String(ExpectedSkills || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    test(`[${TestID}] ${TestDescription}`, async ({ page }) => {
      // Step 1: Navigate to the application and start a fresh search
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await page.getByRole('button', { name: /New Search/i }).click();
      await expect(page.getByText('Welcome to Anvesha')).toBeVisible({ timeout: 15000 });

      // Step 2: Type the natural language query into the search input
      const chatInput = page.getByPlaceholder('Paste a job description or describe the candidate you\'re looking for…');
      await expect(chatInput).toBeVisible({ timeout: 10000 });
      await chatInput.fill(SearchQuery);
      console.log(`📝 Search query entered: "${SearchQuery}"`);

      // Step 3: Submit the search using Ctrl+Enter
      await chatInput.press('Control+Enter');

      // Step 4: Wait for the search interpretation card to appear
      await expect(
        page.getByText('ANVESHA INTERPRETED YOUR SEARCH', { exact: false })
      ).toBeVisible({ timeout: 30000 });
      console.log('🔍 Interpretation card appeared');

      // Step 5: Record which must-have skills the app actually extracted.
      // These checks are non-blocking on purpose: a missing skill chip must not
      // stop the run, because the match % analysis below is what tells us which
      // candidates exist and how relevant they are.
      const skillChips = page.locator('span[data-skill]');
      await skillChips.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
        console.log('⚠️  No must-have skill chips rendered on the interpretation card');
      });

      const extractedSkills = (await skillChips.evaluateAll(
        els => els.map(el => (el.getAttribute('data-skill') || '').trim())
      )).filter(Boolean);

      console.log(`🧩 App extracted ${extractedSkills.length} must-have skill(s): ${extractedSkills.join(', ') || '—'}`);

      const extractedLower = extractedSkills.map(s => s.toLowerCase());
      const skillsFound = [];
      const skillsMissing = [];

      for (const skill of expectedSkillsList) {
        // Substring match in both directions: the app may normalize "cloud infra"
        // to "cloud infrastructure", or shorten a longer expected label.
        const matchedChip = extractedLower.find(
          extracted => extracted.includes(skill) || skill.includes(extracted)
        );

        if (matchedChip) {
          skillsFound.push(matchedChip === skill ? skill : `${skill} → ${matchedChip}`);
          console.log(`🎯 Skill chip for "${skill}" found as "${matchedChip}"`);
        } else {
          skillsMissing.push(skill);
          console.log(`⚠️  Expected skill "${skill}" was NOT extracted — continuing to match % analysis`);
          if (!SKILL_CHECKS_INFORMATIONAL) {
            expect.soft(
              extractedLower,
              `expected skill "${skill}" to be extracted as a must-have skill chip`
            ).toEqual(expect.arrayContaining([expect.stringContaining(skill)]));
          }
        }
      }

      let skillCheck = 'N/A';
      if (expectedSkillsList.length > 0) {
        if (skillsMissing.length === 0) skillCheck = 'PASS';
        else if (skillsFound.length > 0) skillCheck = 'PARTIAL';
        else skillCheck = 'FAIL';
      }
      console.log(`📌 Skill extraction check: ${skillCheck} (${skillsFound.length} found, ${skillsMissing.length} missing)`);

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

      // Step 9: Locate the first candidate's Match % badge
      const firstMatchBadge = tableRows.first().locator('span.match-cell');
      await expect(firstMatchBadge).toBeVisible({ timeout: 10000 });

      const matchPercent = await firstMatchBadge.textContent();
      console.log(`📊 First candidate Match %: "${matchPercent.trim()}"`);

      // Step 10: Read the data-reason attribute which contains the tooltip/hover text
      const dataReason = (await firstMatchBadge.getAttribute('data-reason')) || '';
      if (!dataReason) {
        console.log('⚠️  Top candidate has no data-reason attribute');
      } else {
        console.log(`💬 Match reason (tooltip): "${dataReason}"`);
      }

      // Step 11: Hover over the badge to visually trigger the tooltip
      await firstMatchBadge.hover();
      await page.waitForTimeout(500);

      // Step 12: Report which expected skills the top candidate actually matched.
      // Informational only — the reason text lists just the skills THIS candidate
      // matched and truncates the list, so an absent skill is not a defect.
      const tooltipLower = dataReason.toLowerCase();
      const ratio = dataReason.match(/(\d+)\s*\/\s*(\d+)\s*mandatory skills matched/i);
      if (ratio) {
        console.log(`📊 Top candidate matched ${ratio[1]}/${ratio[2]} mandatory skills`);
      }

      for (const skill of expectedSkillsList) {
        const present = tooltipLower.includes(skill);
        console.log(`${present ? '✅' : 'ℹ️ '} "${skill}" ${present ? 'appears in' : 'not listed in'} the top candidate's match reason (informational)`);
      }

      // Step 13: Collect Match % and matched-skill names from up to the first 100 candidates
      const allMatchValues = [];
      const allReasons = [];
      const TARGET_CANDIDATES = 100;
      let currentPage = 1;

      // Helper: extract match % values and reasons from the currently visible rows
      const extractMatchValues = async () => {
        const rows = page.locator('table tr').filter({ has: page.locator('td') });
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount && allMatchValues.length < TARGET_CANDIDATES; i++) {
          const badge = rows.nth(i).locator('span.match-cell');
          if (await badge.count() > 0) {
            const text = await badge.textContent();
            const numeric = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(numeric)) {
              allMatchValues.push(numeric);
              allReasons.push((await badge.getAttribute('data-reason')) || '');
            }
          }
        }
      };

      // Collect from page 1 (already loaded)
      await extractMatchValues();
      console.log(`📊 Page ${currentPage}: collected ${allMatchValues.length} match values so far`);

      // Paginate to collect more candidates if needed
      while (allMatchValues.length < TARGET_CANDIDATES) {
        currentPage++;
        // Try clicking the next page button
        const nextPageBtn = page.getByRole('button', { name: String(currentPage), exact: true })
          .or(page.locator(`[data-page="${currentPage}"]`))
          .or(page.locator('a, button').filter({ hasText: new RegExp(`^${currentPage}$`) }));

        // If the next page button is not found, we've reached the last page
        if (await nextPageBtn.first().count() === 0) {
          console.log(`📄 No more pages found after page ${currentPage - 1}`);
          break;
        }

        await nextPageBtn.first().click();

        // Wait for the table to refresh with new rows
        const updatedRows = page.locator('table tr').filter({ has: page.locator('td') });
        await expect(updatedRows.first()).toBeVisible({ timeout: 30000 });
        await page.waitForTimeout(500); // Brief wait for data to settle

        await extractMatchValues();
        console.log(`📊 Page ${currentPage}: collected ${allMatchValues.length} match values so far`);
      }

      // Step 14: Calculate the average match % and categorize the result
      const totalCollected = allMatchValues.length;
      const averageMatch = totalCollected > 0
        ? allMatchValues.reduce((sum, val) => sum + val, 0) / totalCollected
        : 0;
      const topMatch = totalCollected > 0 ? Math.max(...allMatchValues) : null;

      let category = '';
      if (averageMatch >= 70) {
        category = '🟢 Good';
      } else if (averageMatch >= 40) {
        category = '🟡 Workable';
      } else {
        category = '🔴 Weak';
      }

      // Log the summary as a console table
      console.log(`\n📈 Match % Analysis for [${TestID}] — "${SearchQuery}"`);
      console.table([
        {
          'Test ID': TestID,
          'Skill Check': skillCheck,
          'Skills Missing': skillsMissing.join('; ') || '—',
          'Candidates Analyzed': totalCollected,
          'Average Match %': `${averageMatch.toFixed(2)}%`,
          'Top Match %': topMatch === null ? '—' : `${topMatch.toFixed(2)}%`,
          'Category': category
        }
      ]);

      // Also log individual breakdown counts
      const goodCount = allMatchValues.filter(v => v >= 70).length;
      const workableCount = allMatchValues.filter(v => v >= 40 && v < 70).length;
      const weakCount = allMatchValues.filter(v => v < 40).length;
      const share = (count) => (totalCollected > 0 ? `${((count / totalCollected) * 100).toFixed(1)}%` : '0%');

      console.table([
        { 'Range': '≥ 70% (Good)', 'Count': goodCount, 'Percentage': share(goodCount) },
        { 'Range': '40–69% (Workable)', 'Count': workableCount, 'Percentage': share(workableCount) },
        { 'Range': '< 40% (Weak)', 'Count': weakCount, 'Percentage': share(weakCount) }
      ]);

      // Step 14b: Aggregate which skills the collected candidates actually matched.
      // This is the "what talent is actually out there" view — it still works when
      // none of the expected skills were extracted at all.
      const skillFrequency = new Map();
      for (const reason of allReasons) {
        const inner = reason.match(/\(([^)]*)\)/);
        if (!inner) continue;
        for (const raw of inner[1].split(',')) {
          const skill = raw.trim().toLowerCase();
          if (skill) skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
        }
      }

      const topSkills = [...skillFrequency.entries()]
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
        .slice(0, 15);

      if (topSkills.length > 0) {
        console.log(`\n🧠 Most common matched skills across ${totalCollected} candidates:`);
        console.table(topSkills.map(({ skill, count }) => ({
          'Skill': skill,
          'Candidates': count,
          'Share': share(count)
        })));
      } else {
        console.log('\nℹ️  No per-candidate skill names available in the match reasons');
      }

      console.log(`✅ Overall verdict: ${category} (avg ${averageMatch.toFixed(2)}% across ${totalCollected} candidates), skill check: ${skillCheck}`);

      // Step 15: Persist the analysis results to a CSV report file for future review
      appendMatchReport({
        testId: TestID,
        searchQuery: SearchQuery,
        totalCollected,
        averageMatch,
        category,
        goodCount,
        workableCount,
        weakCount,
        skillCheck,
        expectedSkills: expectedSkillsList,
        skillsFound,
        skillsMissing,
        extractedSkills,
        topMatch,
        topSkills
      });
      console.log(`📁 Results saved to: ${REPORT_FILE}`);
    });
  }

});
