# 🎭 Playwright Test Automation Suite

A unified Playwright test automation project covering multiple applications and testing patterns.

## 📁 Project Structure

```
playwright/
├── .github/workflows/playwright.yml   ← CI pipeline (GitHub Actions)
├── .gitignore
├── README.md                           ← This file
├── docs/
│   └── shortcmds.md                    ← Quick command reference
├── package.json                        ← Unified dependencies & scripts
├── playwright.config.js                ← Single config with named projects
│
├── tests/
│   ├── anvesha/                        ← Anvesha internal application tests
│   │   ├── search-candidates.spec.js   ← Search Python developers via chip
│   │   ├── export-pdf.spec.js          ← Export candidate list as PDF
│   │   ├── add-role.spec.js            ← Add role to search card
│   │   └── view-resume.spec.js         ← View resume on OneDrive
│   │
│   ├── saucedemo/                      ← SauceDemo E-Commerce E2E tests
│   │   ├── 01-login.spec.js            ← Login page tests (5 tests)
│   │   ├── 02-product-browsing.spec.js ← Product listing & sorting (7 tests)
│   │   ├── 03-cart.spec.js             ← Shopping cart tests (6 tests)
│   │   ├── 04-checkout.spec.js         ← Checkout flow tests (6 tests)
│   │   └── 05-navigation.spec.js       ← Site navigation tests (6 tests)
│   │
│   ├── api/                            ← REST API tests
│   │   └── jsonplaceholder.spec.js     ← GET, POST, PATCH examples
│   │
│   └── practice/                       ← Learning / sandbox tests
│       ├── playwright-basics.spec.js   ← Playwright.dev title & navigation
│       ├── assertions.spec.js          ← Basic assertion examples
│       ├── verify-title.spec.js        ← Google title verification
│       ├── saucedemo-login.spec.js     ← Basic login with hardcoded creds
│       ├── saucedemo-tags.spec.js      ← Login using XPath locators
│       ├── saucedemo-json-login.spec.js    ← Login using JSON data file
│       └── saucedemo-excel-login.spec.js   ← Login using Excel data file
│
├── test-data/                          ← Externalized test data
│   ├── saucedemo/
│   │   ├── users.json                  ← User credentials (valid/invalid/locked)
│   │   └── checkout.json               ← Checkout form data
│   └── practice/
│       ├── credentials.json            ← Practice login credentials
│       └── swagLabsTestData.xlsx       ← Excel-driven test data
│
└── utils/                              ← Shared utilities & helpers
    ├── anvesha-search-helper.js        ← Reusable Anvesha search flow
    ├── login-helper.js                 ← SauceDemo login helper
    ├── excel-reader.js                 ← Excel file reader utility
    └── generate-test-data.js           ← Script to generate Excel test data
```

## 🚀 Getting Started

### Install dependencies
```bash
npm install
npx playwright install chromium
```

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see the browser)
```bash
npm run test:headed
```

### Run tests with Playwright UI mode
```bash
npm run test:ui
```

## 🎯 Run Tests by Project

| Command                    | Description                          |
|----------------------------|--------------------------------------|
| `npm run test:anvesha`     | Run Anvesha application tests        |
| `npm run test:saucedemo`   | Run SauceDemo E-Commerce tests       |
| `npm run test:api`         | Run REST API tests                   |
| `npm run test:practice`    | Run learning/sandbox tests           |

### Run Individual SauceDemo Suites

| Command                            | Description                    |
|-------------------------------------|--------------------------------|
| `npm run test:saucedemo:login`      | Login page tests               |
| `npm run test:saucedemo:products`   | Product browsing & sorting     |
| `npm run test:saucedemo:cart`       | Shopping cart tests             |
| `npm run test:saucedemo:checkout`   | Checkout flow tests            |
| `npm run test:saucedemo:navigation` | Site navigation tests          |

### View test report
```bash
npm run test:report
```

## 📦 Test Data Management

Test data is externalized into JSON/Excel files under `test-data/`. This keeps test logic clean and makes data easy to update without touching test code.

| File | Contents |
|------|----------|
| `test-data/saucedemo/users.json` | User credentials — standard, locked out, and invalid users |
| `test-data/saucedemo/checkout.json` | Checkout form data — first name, last name, postal code |
| `test-data/practice/credentials.json` | Practice login credentials |
| `test-data/practice/swagLabsTestData.xlsx` | Excel-driven locators and test data |

## 🔧 Reusable Utilities

| Utility | Purpose |
|---------|---------|
| `utils/anvesha-search-helper.js` | `searchPythonDevelopers(page)` and `searchAndLoadCandidates(page)` — shared Anvesha search flows |
| `utils/login-helper.js` | `loginAs(page, userType)` and `loginAndVerify(page, userType)` — SauceDemo login helpers |
| `utils/excel-reader.js` | `readExcelData(filePath)` — reads Excel files and groups data by page |
| `utils/generate-test-data.js` | Script to regenerate the Excel test data file |

## 📚 Test Coverage Summary

| Domain | Tests | Description |
|--------|-------|-------------|
| **Anvesha** | 4 | Search, export PDF, add role, view resume |
| **SauceDemo** | 30 | Login, products, cart, checkout, navigation |
| **API** | 3 | GET, POST, PATCH against JSONPlaceholder |
| **Practice** | 12 | Learning exercises for locators, assertions, data-driven tests |
| **Total** | **49** | |
