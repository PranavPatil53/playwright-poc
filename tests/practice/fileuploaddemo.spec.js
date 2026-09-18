import {test,expect} from '@playwright/test';

test('file upload demo', async ({page}) => 
{
    await page.goto('https://the-internet.herokuapp.com/upload');
    await page.setInputFiles('#file-upload','tests/practice/demo.txt');
    await page.click('#file-submit');
    await expect(page.locator('#uploaded-files')).toHaveText('demo.txt');
    

});
