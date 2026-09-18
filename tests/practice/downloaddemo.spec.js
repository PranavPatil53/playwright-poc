const {test, expect} = require('@playwright/test');

test('Download demo', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/download');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a[href="download/some-file.txt"]')
  ]);

  await download.saveAs('demo.text');
  expect(download.suggestedFilename()).toBe('some-file.txt' );
});