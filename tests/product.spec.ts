import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Varmistetaan, että DataInitializerin tuotteet ovat ehtineet ruudulle
        await expect(page.getByRole('button', { name: 'Products', exact: true })).toBeVisible();
    });

    test('should display default products from initial seed data', async ({ page }) => {
        await page.getByRole('button', { name: 'Products', exact: true }).click();

        // Tarkistetaan, että DataInitializerin luomat tuotteet näkyvät korteissa
        await expect(page.getByText('Koodauskahvi')).toBeVisible();
        await expect(page.getByText('Micronaut t-paita')).toBeVisible();

        // Varmistetaan, että hinnat ovat näkyvissä alussa (EUR)
        await expect(page.getByText('12.50 EUR')).toBeVisible();
        await expect(page.getByText('25.00 EUR')).toBeVisible();
    });
});
