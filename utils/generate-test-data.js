/**
 * Script to generate the test data Excel file for Swag Labs login tests.
 * Run this once with: node utils/generate-test-data.js
 * 
 * Creates: test-data/practice/swagLabsTestData.xlsx
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const data = [
  { Page: 'Login', Element: 'usernameField', Selector: '#user-name' },
  { Page: 'Login', Element: 'passwordField', Selector: '#password' },
  { Page: 'Login', Element: 'loginButton',   Selector: '#login-button' },
  { Page: 'Login', Element: 'errorMessage',  Selector: '[data-test="error"]' },
  { Page: 'Login', Element: 'productsTitle', Selector: '.title' },
  { Page: 'Data',  Element: 'username',      Selector: 'standard_user' },
  { Page: 'Data',  Element: 'password',      Selector: 'secret_sauce' },
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'TestData');

// Set column widths for readability
worksheet['!cols'] = [
  { wch: 10 },  // Page
  { wch: 18 },  // Element
  { wch: 30 },  // Selector
];

const outputDir = path.join(__dirname, '..', 'test-data', 'practice');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'swagLabsTestData.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`✅ Excel file created at: ${outputPath}`);
