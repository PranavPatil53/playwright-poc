// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Unified Playwright Configuration
 *
 * Projects:
 *   anvesha    → Internal Anvesha application tests  (http://127.0.0.1:5000)
 *   saucedemo  → SauceDemo E-Commerce E2E tests      (https://www.saucedemo.com)
 *   api        → REST API tests                      (no baseURL)
 *   practice   → Learning / sandbox tests            (no baseURL)
 *
 * Run a specific project:
 *   npx playwright test --project=anvesha
 */
module.exports = defineConfig({
  /* Global timeout per test */
  timeout: 60_000,

  expect: {
    timeout: 15_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html'],
    ...(process.env.CI ? [] : []),
  ],

  /* Shared settings for all projects */
  use: {
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  /* ================================================================
   * Projects — each maps to a test domain with its own config
   * ================================================================ */
  projects: [
    // ── Anvesha ──────────────────────────────────────────────────
    {
      name: 'anvesha',
      testDir: './tests/anvesha',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5000',
      },
    },

    // ── SauceDemo E-Commerce ─────────────────────────────────────
    {
      name: 'saucedemo',
      testDir: './tests/saucedemo',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
      },
    },

    // ── API Tests ────────────────────────────────────────────────
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        /* API tests don't need a browser viewport */
      },
    },

    // ── Practice / Learning ──────────────────────────────────────
    {
      name: 'practice',
      testDir: './tests/practice',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
