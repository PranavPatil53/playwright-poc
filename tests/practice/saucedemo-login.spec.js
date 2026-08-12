const { test, expect } = require('@playwright/test');

test('Login to SauceDemo', async ({ page }) => {

  await page.goto('https://www.saucedemo.com/');

  await page.locator('#user-name').fill('standard_user');

  await page.locator('#password').fill('secret_sauce');

  await page.locator('#login-button').click();

  await expect(page).toHaveURL(/inventory.html/);

  await expect(page.locator('.title')).toHaveText('Products');

});
