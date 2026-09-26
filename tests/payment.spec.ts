import { test, expect } from '@playwright/test';

test.describe('Payment Gateways', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
        await page.reload();
    });

    test('should block return button until backend transaction status is SUCCESS', async ({ page }) => {
        const uniqueBuyer = `PayUser-${Date.now()}`;

        // --- 1. Luodaan ostoskori ja tili valmiiksi ---
        await page.getByRole('button', { name: 'Accounts', exact: true }).click();
        await page.getByRole('button', { name: '+ New Account' }).click();
        await page.getByRole('textbox', { name: 'Account owner' }).fill(uniqueBuyer);
        await page.getByRole('button', { name: 'Create account' }).click();

        await page.getByRole('button', { name: 'Products', exact: true }).click();
        await page.getByRole('button', { name: 'Add to cart' }).first().click();
        await page.getByRole('button', { name: /^Cart/ }).click();

        const option = page.locator("select#checkout-buyer option").filter({ hasText: uniqueBuyer });
        const label = await option.innerText();
        await page.getByLabel("Select Active Buyer Profile:").selectOption({ label });

        // --- 2. Siirrytään maksusivulle ---
        await page.getByRole("button", { name: "Proceed to Paytrail Checkout" }).click();
        await expect(page).toHaveURL(/\/mock-payment\//);

        // --- 3. TESTATAAN SOVELLUSLOGIIKKA (Pollaus ja painike) ---
        const returnButton = page.getByRole("button", { name: "Return to shop" });

        // Varmistetaan, että nappi on aluksi lukittu (koska backendissä on se 2s viive)
        await expect(returnButton).toBeDisabled();

        // Odotetaan, että backendin 2s viive kuluu, pollaus onnistuu ja nappi aukeaa automaattisesti
        await expect(returnButton).toBeEnabled({ timeout: 10000 });

        // Palataan takaisin kauppaan
        await returnButton.click();
        await expect(page).not.toHaveURL(/\/mock-payment\//);
    });
});
