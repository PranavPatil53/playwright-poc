# 🛒 Playwright E-Commerce POC

A structured Playwright test automation POC targeting **[SauceDemo](https://www.saucedemo.com)** — a demo e-commerce web application.

## 📁 Project Structure

```
playwright-poc/
├── tests/                             # Test spec files
│   ├── 01-login.spec.js               # Login page tests
│   ├── 02-product-browsing.spec.js    # Product listing & sorting tests
│   ├── 03-cart.spec.js                # Shopping cart tests
│   ├── 04-checkout.spec.js            # Checkout flow tests
│   └── 05-navigation.spec.js          # Site navigation tests
├── test-data/                         # Externalized test data (no hardcoding!)
│   ├── users.json                     # User credentials (valid, invalid, locked)
│   └── checkout.json                  # Checkout form data
├── utils/                             # Reusable helper functions
│   └── login-helper.js               # Login utility (used in beforeEach hooks)
├── playwright.config.js               # Playwright configuration
├── package.json                       # Project dependencies & scripts
├── .gitignore                         # Git ignore rules
└── README.md                          # This file
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

### Run individual test suites
```bash
npm run test:login
npm run test:products
npm run test:cart
npm run test:checkout
npm run test:navigation
```

### View test report
```bash
npm run test:report
```

## 📦 Test Data Management

Test data is externalized into JSON files under the `test-data/` directory. This keeps test logic clean and makes it easy to update data without touching test code.

| File | Contents |
|------|----------|
| `test-data/users.json` | User credentials — standard, locked out, and invalid users |
| `test-data/checkout.json` | Checkout form data — first name, last name, postal code |

### Reusable Utilities

The `utils/` directory contains shared helper functions:

- **`login-helper.js`** — Provides `loginAs(page, userType)` and `loginAndVerify(page, userType)` functions used across multiple test files to avoid code duplication.

## 📚 Concepts Covered Per Test File

| # | File | Playwright Concepts |
|---|------|-------------------|
| 1 | `01-login.spec.js` | `goto`, `fill`, `click`, `toHaveURL`, `toHaveText`, `toContainText`, `toBeVisible`, `test.describe`, `test.beforeEach` |
| 2 | `02-product-browsing.spec.js` | `locator`, `count()`, `nth()`, `first()`, `allTextContents()`, `textContent()`, `selectOption`, loop through elements |
| 3 | `03-cart.spec.js` | `toHaveCount`, `not.toBeVisible`, cart badge verification, `data-test` selectors |
| 4 | `04-checkout.spec.js` | Full E2E flow, form field validation, `toContainText`, price parsing & validation, multi-step navigation |
| 5 | `05-navigation.spec.js` | Hamburger menu interaction, `toHaveURL` with regex, logout verification, app state reset, footer verification |

## 🎯 Test Scenarios Summary

### Login Tests (5 tests)
- ✅ Successful login with valid credentials
- ❌ Locked out user error
- ❌ Invalid credentials error
- ❌ Empty username & password validation
- ❌ Empty password validation

### Product Browsing Tests (7 tests)
- Verify all 6 products load
- Verify product card details (name, price, desc, image)
- Sort by name A-Z and Z-A
- Sort by price low-high and high-low
- Navigate to product detail page

### Cart Tests (7 tests)
- Add single/multiple products
- Remove product from inventory page
- Verify cart page items
- Remove product from cart page
- Continue shopping navigation

### Checkout Tests (6 tests)
- Full end-to-end checkout flow
- Form validation (empty fields, missing last name, missing postal code)
- Order summary pricing verification
- Cancel checkout

### Navigation Tests (6 tests)
- Open/close hamburger menu
- Navigate to About page
- Logout flow
- Reset app state
- All Items navigation
- Footer social media links
