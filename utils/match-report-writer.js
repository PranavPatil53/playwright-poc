const fs = require('fs');
const path = require('path');

// Report file lives alongside test data for easy discovery
const REPORT_DIR = path.join(__dirname, '..', 'test-data', 'anvesha');
const REPORT_FILE = path.join(REPORT_DIR, 'match-analysis-report.csv');

// CSV column headers
const CSV_HEADER_LIST = [
  'Timestamp',
  'Test ID',
  'Skill Check',
  'Expected Skills',
  'Skills Found',
  'Skills Missing',
  'Extracted Skills (App)',
  'Candidates Analyzed',
  'Average Match %',
  'Category',
  'Top Match %',
  'Good Count (≥70%)',
  'Workable Count (40-69%)',
  'Weak Count (<40%)',
  'Good %',
  'Workable %',
  'Weak %',
  'Top Skills Across Candidates',
  'Search Query'
];
const CSV_HEADERS = CSV_HEADER_LIST.join(',');

/**
 * Escapes a value for safe CSV inclusion (handles commas, quotes, newlines).
 * @param {string|number} value
 * @returns {string}
 */
function escapeCsv(value) {
  const str = value === undefined || value === null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Ensures the report file exists and its header matches the current column set.
 * If an older report with a different header is found, it is renamed rather than
 * overwritten so previously collected runs are never lost.
 */
function ensureReportFile() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  if (!fs.existsSync(REPORT_FILE)) {
    fs.writeFileSync(REPORT_FILE, CSV_HEADERS + '\n', 'utf-8');
    return;
  }

  const existingHeader = fs.readFileSync(REPORT_FILE, 'utf-8').split('\n')[0].trim();
  if (existingHeader !== CSV_HEADERS) {
    // Column set changed — archive the old report so its rows stay readable
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archived = REPORT_FILE.replace(/\.csv$/, `-legacy-${stamp}.csv`);
    fs.renameSync(REPORT_FILE, archived);
    fs.writeFileSync(REPORT_FILE, CSV_HEADERS + '\n', 'utf-8');
    console.log(`ℹ️  Report columns changed — previous report archived to: ${archived}`);
  }
}

/**
 * Appends a match analysis result row to the CSV report file.
 * Creates the file with headers if it doesn't exist yet.
 *
 * @param {Object} result
 * @param {string}   result.testId            - Test case ID from the Excel sheet
 * @param {string}   result.searchQuery       - The natural language search query
 * @param {number}   result.totalCollected    - Number of candidates analyzed
 * @param {number}   result.averageMatch      - Average match percentage
 * @param {string}   result.category          - Good / Workable / Weak
 * @param {number}   result.goodCount         - Candidates with match ≥ 70%
 * @param {number}   result.workableCount     - Candidates with match 40–69%
 * @param {number}   result.weakCount         - Candidates with match < 40%
 * @param {string}   [result.skillCheck]      - PASS / PARTIAL / FAIL / N/A for the expected-skill check
 * @param {string[]} [result.expectedSkills]  - Skills the Excel row expected
 * @param {string[]} [result.skillsFound]     - Expected skills present on the interpretation card
 * @param {string[]} [result.skillsMissing]   - Expected skills absent from the interpretation card
 * @param {string[]} [result.extractedSkills] - All must-have skills the app actually extracted
 * @param {number}   [result.topMatch]        - Match % of the highest ranked candidate
 * @param {Array}    [result.topSkills]       - [{ skill, count }] most frequent matched skills
 */
function appendMatchReport(result) {
  const {
    testId,
    searchQuery,
    totalCollected,
    averageMatch,
    category,
    goodCount,
    workableCount,
    weakCount,
    skillCheck = 'N/A',
    expectedSkills = [],
    skillsFound = [],
    skillsMissing = [],
    extractedSkills = [],
    topMatch = null,
    topSkills = []
  } = result;

  ensureReportFile();

  const timestamp = new Date().toISOString();
  const pct = (count) => (totalCollected > 0 ? ((count / totalCollected) * 100).toFixed(1) + '%' : '0%');
  const list = (arr) => (arr && arr.length ? arr.join('; ') : '—');
  const topSkillsText = topSkills && topSkills.length
    ? topSkills.map(({ skill, count }) => `${skill} (${count})`).join('; ')
    : '—';

  const row = [
    escapeCsv(timestamp),
    escapeCsv(testId),
    escapeCsv(skillCheck),
    escapeCsv(list(expectedSkills)),
    escapeCsv(list(skillsFound)),
    escapeCsv(list(skillsMissing)),
    escapeCsv(list(extractedSkills)),
    totalCollected,
    averageMatch.toFixed(2) + '%',
    escapeCsv(category),
    topMatch === null ? '—' : topMatch.toFixed(2) + '%',
    goodCount,
    workableCount,
    weakCount,
    pct(goodCount),
    pct(workableCount),
    pct(weakCount),
    escapeCsv(topSkillsText),
    escapeCsv(searchQuery)
  ].join(',');

  fs.appendFileSync(REPORT_FILE, row + '\n', 'utf-8');
}

module.exports = { appendMatchReport, REPORT_FILE };
