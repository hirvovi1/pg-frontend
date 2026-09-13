import { test, expect } from '@playwright/test';

test('creates an account with a whale promo code', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'View cart' }).click();
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeHidden();
  await page.getByRole('button', { name: 'Hide cart' }).click();
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Your accounts' })).toBeVisible();
  await page.getByRole('button', { name: '+ New Account' }).click();
  await page.getByRole('textbox', { name: 'Account owner' }).fill('Seppäilyrahasto');
  await page.getByRole('textbox', { name: 'Promo code' }).fill('WHALE');
  await expect(page.getByRole('spinbutton', { name: 'Amount' })).toHaveValue('150.00');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
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
  
  // 1. Target the exact card we just generated
  const accountCard = page.getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Test Owner', exact: true }) })
    .first();
  
  // 2. Best Practice: Store the unique text footprint (like the UUID string) 
  // to ensure we track this specific card, even if other cards match the name
  const accountIdText = await accountCard.locator('code').innerText();
  const exactTargetCard = page.getByRole('article').filter({ hasText: accountIdText });

  await page.getByLabel('Currency:').selectOption('USD');
  await page.getByRole('button', { name: 'View cart' }).click();
  
  await expect(page.locator('.checkout-cart-total')).toContainText('56.70 USD');

  await page.getByRole('button', { name: 'Hide cart' }).click();
  
  // 3. Trigger deletion directly on our exact target instance
  await exactTargetCard.getByRole('button', { name: 'Delete account' }).click();
  
  // 4. Assert that this specific instance disappears from the DOM
  await expect(exactTargetCard).toBeHidden();
});

