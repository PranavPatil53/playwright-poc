# Playwright Short Commands

## Step 1 — Open terminal in VS Code
Press **Ctrl + `** (backtick key, below Escape)

## Step 2 — Go to project folder
```
cd C:\Users\Pranav.Patil\Documents\playwright
```

## Step 3 — Run a command from the table below

### Quick Reference

| #  | Short Command                        | What it does                                  |
|----|--------------------------------------|-----------------------------------------------|
| 1  | `npm test`                           | Run all tests (headless)                      |
| 2  | `npm run test:headed`                | Run all tests with browser visible            |
| 3  | `npm run test:anvesha`               | Run only Anvesha tests                        |
| 4  | `npm run test:saucedemo`             | Run only SauceDemo E-Commerce tests           |
| 5  | `npm run test:api`                   | Run only API tests                            |
| 6  | `npm run test:practice`              | Run only practice/learning tests              |
| 7  | `npm run test:ui`                    | Open Playwright UI mode                       |
| 8  | `npm run test:report`                | Open HTML report from last test run           |

---

### Short Command → Original Command Mapping

| #  | Short Command                        | Original Command                                      |
|----|--------------------------------------|-------------------------------------------------------|
| 1  | `npm test`                           | `npx playwright test`                                 |
| 2  | `npm run test:headed`                | `npx playwright test --headed`                        |
| 3  | `npm run test:anvesha`               | `npx playwright test --project=anvesha`               |
| 4  | `npm run test:saucedemo`             | `npx playwright test --project=saucedemo`             |
| 5  | `npm run test:api`                   | `npx playwright test --project=api`                   |
| 6  | `npm run test:practice`              | `npx playwright test --project=practice`              |
| 7  | `npm run test:ui`                    | `npx playwright test --ui`                            |
| 8  | `npm run test:report`                | `npx playwright show-report`                          |
