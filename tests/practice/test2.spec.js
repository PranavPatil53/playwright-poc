const { test, expect } = require('@playwright/test');

test('Login to SauceDemo', async ({ page }) => {

  await page.goto('https://demoapps.qspiders.com/ui/table/dynamicTable');


});
