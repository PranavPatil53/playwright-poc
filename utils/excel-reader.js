const XLSX = require('xlsx');
const path = require('path');

/**
 * Reads an Excel file and returns data organized by the 'Page' column.
 * 
 * Excel file format expected:
 *   | Page  | Element       | Selector                        |
 *   | Login | usernameField | #user-name                      |
 *   | Login | passwordField | #password                       |
 *   | Login | loginButton   | #login-button                   |
 *   | Data  | username      | standard_user                   |
 *   | Data  | password      | secret_sauce                    |
 * 
 * @param {string} filePath - Absolute or relative path to the .xlsx file
 * @returns {Object} - Data grouped by Page name. e.g. { Login: { usernameField: '#user-name', ... }, Data: { username: 'standard_user', ... } }
 */
function readExcelData(filePath) {
  const absolutePath = path.resolve(filePath);
  const workbook = XLSX.readFile(absolutePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const data = {};

  for (const row of rows) {
    const page = row['Page'];
    const element = row['Element'];
    const selector = row['Selector'];

    if (!page || !element || !selector) continue;

    if (!data[page]) {
      data[page] = {};
    }
    data[page][element] = selector;
  }

  return data;
}

/**
 * Reads an Excel file and returns the rows as an array of objects.
 * Useful for data-driven testing where each row is a test case.
 * 
 * @param {string} filePath - Absolute or relative path to the .xlsx file
 * @returns {Array<Object>} - Array of row objects
 */
function readExcelRows(filePath) {
  const absolutePath = path.resolve(filePath);
  const workbook = XLSX.readFile(absolutePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

module.exports = { readExcelData, readExcelRows };
