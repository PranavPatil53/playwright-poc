const { test, expect } = require('@playwright/test');

test.describe('Dynamic Table', () => {
    test('Get price of Samsung Galaxy from the dynamic table(QUIZ)', async ({ page }) => {
        await page.goto('https://demoapps.qspiders.com/ui/table/dynamicTable');
        const table = page.locator('table');
        await table.waitFor({ state: 'visible' });
        //finding index of the price column in the table
        const headers = table.locator('thead th');
        const headerTexts = await headers.allInnerTexts();
        const priceIndex = headerTexts.findIndex(text => text.trim().toLowerCase() === 'price');

        //seeing where the samsung galaxcy is in the table and getting price
        const row = table.locator('tbody tr').filter({ hasText: 'Samsung Galaxy' });
        await expect(row).toBeVisible();


        const price = await row.locator('th, td').nth(priceIndex).innerText();

        console.log(`The price of Samsung Galaxy is: ${price.trim()}`);


        expect(price.trim()).toBeTruthy();
    });
});
