const { test, expect } = require('@playwright/test');
const credentials = require('../../test-data/practice/credentials.json');

test('Login validation using valid credentials', async ({ page }) => {

    await page.goto('https://www.saucedemo.com/');

    await page.getByRole('textbox',{name:'Username'}).fill(credentials.validuser.username);

    //await page.locator('#password').fill('secret_sauce');
    await page.getByRole('textbox',{name:'Password'}).fill(credentials.validuser.password);

    await page.getByRole('button',{name:'Login'}).click();

   

});
