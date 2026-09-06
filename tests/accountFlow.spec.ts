import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: '+ New Account' }).click();
  await page.getByRole('textbox', { name: 'Account name' }).click();
  await page.getByRole('textbox', { name: 'Account name' }).fill('Seppäilyrahasto');
  await page.getByRole('spinbutton', { name: 'Opening balance' }).click();
  await page.getByRole('spinbutton', { name: 'Opening balance' }).fill('1');
  await page.getByRole('button', { name: 'Create account' }).click();
});