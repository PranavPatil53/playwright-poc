const {test,expect} = require('@playwright/test');

test('testing with tags', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('//input[@name="user-name"]').fill('standard_user');
  await page.locator('//input[@name="password"]').fill('secret_sauce');
  await page.locator("//input[@class='submit-button btn_action']").click();
});

test('testing invalid credentials', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('//input[@name="user-name"]').fill('gkljlkjflkdsjfsl');
  await page.locator('//input[@name="password"]').fill('kfdslfjds');
  await page.locator("//input[@class='submit-button btn_action']").click();
  await page.locator("//div[@class='error-message-container error']").isVisible();
});
