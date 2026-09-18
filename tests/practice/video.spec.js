const {test,expect} = require('@playwright/test');

test('video play pause testing', async ({ page }) => {

    await page.goto('https://www.w3schools.com/html/html5_video.asp');
    const video = page.locator("//video[@id='video1']");
    await video.evaluate(video => video.play());
    await page.waitForTimeout(5000); // Wait for 5 seconds to let the video play

    await video.evaluate(video => video.pause());
});