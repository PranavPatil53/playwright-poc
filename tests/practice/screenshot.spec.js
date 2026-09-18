const {test,expect} = require('@playwright/test');

test('screenshot demo',async({page})=>{
    await page.goto('https://www.saucedemo.com/');
    
    await page.locator('#user-name').fill('standard_user');

  await page.locator('#password').fill('secret_sauce');

  await page.locator('#login-button').click();

  await page.screenshot({path:'screenshots/screenshot.png',fullPage:true});



    
});