import { test, expect } from '@playwright/test';

test('creates an account with a whale promo code', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ New Account' }).click();
  await page.getByRole('textbox', { name: 'Account owner' }).fill('Seppäilyrahasto');
  await page.getByRole('textbox', { name: 'Promo code' }).fill('WHALE');
  await expect(page.getByRole('spinbutton', { name: 'Amount' })).toHaveValue('150.00');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});