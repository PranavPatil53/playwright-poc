const { test, expect } = require('@playwright/test');

// ============================================================
// Anvesha - Update App Button
// Flow: Open App → Click "Update App" → Popup appears →
//       Validate version info & up-to-date / update message
// ============================================================

test.describe('Anvesha - Update App', () => {

    test('Verify Update App button opens a popup with version info and update status', async ({ page }) => {
        // Step 1: Navigate to the application
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Step 2: Locate and click the "Update App" button in the sidebar
        const updateAppBtn = page.getByRole('button', { name: /Update App/i });
        await expect(updateAppBtn).toBeVisible({ timeout: 10000 });
        await updateAppBtn.click();

        // Step 3: Verify the Update App popup / modal appears
        // Healed: replaced bogus class "slkdsk" with "modal" to match the actual modal element
        const popup = page.locator('[class*="modal"], [class*="dialog"], [class*="popup"], [role="dialog"], [role="alertdialog"]').first();
        await expect(popup).toBeVisible({ timeout: 15000 });
        console.log('📦 Update App popup appeared');

        // Step 4: Validate the popup title
        await expect(popup.getByText('Update App')).toBeVisible();

        // Step 5: Validate the "Latest release" section shows version info
        await expect(popup.getByText('Latest release:')).toBeVisible({ timeout: 10000 });
        const latestRelease = popup.getByText(/Anvesha-V\d+(\.\d+)*/i);
        await expect(latestRelease).toBeVisible({ timeout: 10000 });
        const latestReleaseContent = await latestRelease.textContent();
        console.log(`🔖 Latest release: ${latestReleaseContent.trim()}`);

        // Step 6: Validate the "Current version" is displayed
        const currentVersionText = popup.getByText(/Current version:/i);
        await expect(currentVersionText).toBeVisible({ timeout: 10000 });
        const currentVersionContent = await currentVersionText.textContent();
        console.log(`🔖 ${currentVersionContent.trim()}`);

        // Step 7: Validate the popup shows either "UP TO DATE" badge or an update option
        const statusBadge = popup.locator('span.version-badge');
        const actionButton = popup.locator('#confirmUpdateBtn');

        await expect(statusBadge).toBeVisible({ timeout: 10000 });
        const badgeText = await statusBadge.textContent();
        console.log(`📋 Status badge: ${badgeText.trim()}`);

        await expect(actionButton).toBeVisible();
        const btnText = await actionButton.textContent();
        console.log(`🔘 Action button: ${btnText.trim()}`);

        if (/up to date/i.test(badgeText)) {
            console.log('✅ App is UP TO DATE!');
        } else {
            console.log('⬆️ An update is available!');
        }
    });

});
