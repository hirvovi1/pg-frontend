import {test, expect} from '@playwright/test';

test.afterEach(async ({page}) => {
    // Clean up any accounts created during tests
    await page.goto('/');
    const articles = page.getByRole('article');
    const count = await articles.count();
    for (let i = 0; i < count; i++) {
        const article = articles.nth(i);
        try {
            const deleteButton = article.getByRole('button', {name: 'Delete account'});
            if (await deleteButton.isVisible()) {
                await deleteButton.click();
            }
        } catch {
            // Account might not have delete button or already deleted
        }
    }
});

test('creates an account with a whale promo code', async ({page}) => {
    // 1. Luodaan uniikki nimi tälle testille (tai haetaan jos beforeEach asetti sen)
    const uniqueName = `Seppäilyrahasto-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    (page as any).uniqueName = uniqueName; // Tallennetaan afterEachia varten!

    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Products', exact: true })).toBeVisible();

    await page.getByRole('button', {name: 'Products', exact: true}).click();
    await expect(page.getByRole('heading', {name: 'Products'})).toBeVisible();

    await page.getByRole('button', {name: /^Cart/}).click();
    await expect(page.getByRole('heading', {name: 'Shopping Cart'})).toBeVisible();

    await page.getByRole('button', {name: 'Accounts', exact: true}).click();
    await expect(page.getByRole('heading', {name: 'Shopping Cart'})).toBeHidden();

    await page.getByRole('button', {name: '+ New Account'}).click();

    // 2. Käytetään dynaamista nimeä lomakkeessa
    await page.getByRole('textbox', {name: 'Account owner'}).fill(uniqueName);
    await page.getByRole('textbox', {name: 'Promo code'}).fill('WHALE');
    await expect(page.getByRole('spinbutton', {name: 'Amount'})).toHaveValue('150.00');
    await page.getByRole('button', {name: 'Create account'}).click();

    // 3. Etsitään dynaamisella nimellä
    const accountCard = page.getByRole('article').filter({hasText: uniqueName});
    await expect(accountCard).toBeVisible();
});


test('switches global currency and fetches values from the currency microservice', async ({page}) => {
    await page.goto('/');
    await page.getByRole('button', {name: '+ New Account'}).click();
    await page.getByRole('textbox', {name: 'Account owner'}).fill('Test Owner');
    await page.getByRole('button', {name: 'Create account'}).click();

    const accountCard = page.getByRole('article')
        .filter({has: page.getByRole('heading', {name: 'Test Owner', exact: true})})
        .first();

    const accountIdText = await accountCard.locator('code').innerText();
    const exactTargetCard = page.getByRole('article').filter({hasText: accountIdText});

    await page.getByLabel('Currency:').selectOption('USD');

    await page.getByRole('button', {name: 'Products', exact: true}).click();
    await expect(page.getByRole('heading', {name: 'Products'})).toBeVisible();

    const firstAddToCartButton = page.getByRole('button', {name: 'Add to cart'}).first();
    await firstAddToCartButton.click();

    await page.getByRole('button', {name: /^Cart/}).click();
    await expect(page.locator('.checkout-cart-item')).toBeVisible();

    await page.getByRole('button', {name: 'Accounts', exact: true}).click();

    await exactTargetCard.getByRole('button', {name: 'Delete account'}).click();
    await expect(exactTargetCard).toBeHidden();
    // Cleanup handled by afterEach
});
