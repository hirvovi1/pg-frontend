import { test, expect } from '@playwright/test';

test('creates an account with a whale promo code', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

  await page.getByRole('button', { name: 'Accounts', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeHidden();

  await page.getByRole('button', { name: '+ New Account' }).click();
  await page.getByRole('textbox', { name: 'Account owner' }).fill('Seppäilyrahasto');
  await page.getByRole('textbox', { name: 'Promo code' }).fill('WHALE');
  await expect(page.getByRole('spinbutton', { name: 'Amount' })).toHaveValue('150.00');
  await page.getByRole('button', { name: 'Create account' }).click();

  const accountCard = page.getByRole('article').filter({ hasText: 'Seppäilyrahasto' });
  await expect(accountCard).toBeVisible();
  await accountCard.getByRole('button', { name: 'Delete account' }).click();
  await expect(accountCard).toBeHidden();
});

test('switches global currency and fetches values from the currency microservice', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ New Account' }).click();
  await page.getByRole('textbox', { name: 'Account owner' }).fill('Test Owner');
  await page.getByRole('button', { name: 'Create account' }).click();

  const accountCard = page.getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Test Owner', exact: true }) })
    .first();

  const accountIdText = await accountCard.locator('code').innerText();
  const exactTargetCard = page.getByRole('article').filter({ hasText: accountIdText });

  await page.getByLabel('Currency:').selectOption('USD');

  await page.getByRole('button', { name: 'Products', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

  const firstAddToCartButton = page.getByRole('button', { name: 'Add to cart' }).first();
  await firstAddToCartButton.click();

  await page.getByRole('button', { name: 'Cart', exact: true }).click();
  await expect(page.locator('.checkout-cart-item')).toBeVisible();

  await page.getByRole('button', { name: 'Accounts', exact: true }).click();

  await exactTargetCard.getByRole('button', { name: 'Delete account' }).click();
  await expect(exactTargetCard).toBeHidden();
});
