import { test, expect } from '@playwright/test';

test.describe('Currency Operations', () => {

    test.beforeEach(async ({ page }) => {
        // Aloitetaan täysin puhtaalla selaimen muistilla joka kerta
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
    });

    test('successfully switches global currency and updates basket', async ({ page }) => {
        // Varmistetaan ensin, että sivu ja Viten ekat lataukset ovat valmiit (Alkukytkin)
        await expect(page.getByRole('button', { name: 'Products', exact: true })).toBeVisible();

        // 1. Luodaan tili dynaamisesti (käytetään uniikkia nimeä)
        const uniqueName = `CurrencyBuyer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await page.getByRole('button', { name: 'Accounts', exact: true }).click();
        await page.getByRole('button', { name: '+ New Account' }).click();
        await page.getByRole('textbox', { name: 'Account owner' }).fill(uniqueName);
        await page.getByRole('button', { name: 'Create account' }).click();

        // Varmistetaan, että tili pamahti DOMiin
        await expect(page.getByRole('article').filter({ hasText: uniqueName }).first()).toBeVisible();

        // 2. VAIHDETAAN VALUUTTA JA ODOTETAAN MIKROPALVELUN VASTAUSTA
        await Promise.all([
            // Odotetaan, että selaimesi tekemä haku Controllerin convert-endpointiin vastaa 200 OK
            page.waitForResponse(response =>
                    response.url().includes('/api/v1/frontend/currency/convert') && response.status() === 200,
                { timeout: 20000 } // Annetaan raskaalle palvelulle reilu 20s aikaa herätä kylmässä ajossa
            ),
            // Tämä valinta laukaisee sen API-kutsun frontissa:
            page.getByLabel('Currency:').selectOption('USD')
        ]);

        // Nyt ollaan 100% varmasti USD-tilassa ja kurssit on laskettu! Jatketaan tuotteisiin...
        await page.getByRole('button', { name: 'Products', exact: true }).click();

        // 3. Nyt kun valuuttapalvelu on vastannut, lisätään tuote ostoskoriin
        await page.getByRole('button', { name: 'Add to cart' }).first().click();

        // 4. Avataan ostoskori – tämän PITÄISI nyt kestää hitaassakin CI:ssä,
        // koska tausta ehti rauhassa asettua USD-tilaan ylempänä
        await page.getByRole('button', { name: /^Cart/ }).click();
        await expect(page.locator('.checkout-cart-item')).toBeVisible({ timeout: 15000 });
    });

});
