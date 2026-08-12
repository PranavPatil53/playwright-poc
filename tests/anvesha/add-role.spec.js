const { test, expect } = require('@playwright/test');
const { searchPythonDevelopers } = require('../../utils/anvesha-search-helper');

// ============================================================
// Anvesha - Add Role to Search Interpretation Card
// Flow: Search → Interpretation card → Type role → Validate
// ============================================================

test.describe('Anvesha - Add Role', () => {

  test('Verify a user can add an additional role using the "Add Role..." input field', async ({ page }) => {
    // Perform the search flow up to the interpretation card
    await searchPythonDevelopers(page);

    // --- Add Role Flow ---

    // Locate the "Add Role..." input field on the interpretation card
    const addRoleInput = page.locator('input.role-input[placeholder="Add Role..."]');
    await expect(addRoleInput).toBeVisible({ timeout: 10000 });

    // Type a new role and press Enter to add it
    const newRole = 'Data Engineer';
    await addRoleInput.fill(newRole);
    await addRoleInput.press('Enter');

    // Validate the new role appears on the search card
    const roleOnCard = page.locator('.chat-box').getByText(newRole, { exact: false });
    await expect(roleOnCard).toBeVisible({ timeout: 10000 });

    console.log(`✅ Role "${newRole}" successfully added and visible on the search card!`);
  });

});
