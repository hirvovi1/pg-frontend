import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Create a unique account to use for checkout
    const uniqueName = `Tester ${Date.now()}`;
    await page.getByRole("button", { name: "+ New Account" }).click();
    await page.getByRole("textbox", { name: "Account owner" }).fill(uniqueName);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("article").filter({ hasText: uniqueName })).toBeVisible();

    // Store uniqueName for tests to use
    (page as any).uniqueName = uniqueName;
  });

  test("successfully completes the checkout flow to mock payment page", async ({ page }) => {
    const uniqueName = (page as any).uniqueName;
    await page.getByRole("button", { name: "View cart" }).click();

    // Select the account
    const option = page.locator("select#checkout-buyer option").filter({ hasText: uniqueName });
    const label = await option.innerText();
    await page.getByLabel("Select Active Buyer Profile:").selectOption({ label });

    // Click proceed
    await page.getByRole("button", { name: "Proceed to Paytrail Checkout" }).click();

    // Should be redirected to mock payment page
    await expect(page).toHaveURL(/\/mock-payment\//);
    await expect(page.getByRole("heading", { name: "Complete your payment" })).toBeVisible();

    // Complete payment
    await page.getByRole("button", { name: "Return to shop" }).click();

    // Should be back on the shop app
    await expect(page).not.toHaveURL(/\/mock-payment\//);
    await expect(page.getByRole("heading", { name: "Your accounts" })).toBeVisible();
  });

  test("shows error when proceeding without selecting an account", async ({ page }) => {
    await page.getByRole("button", { name: "View cart" }).click();
    await page.getByRole("button", { name: "Proceed to Paytrail Checkout" }).click();

    await expect(page.getByText("Select an active buyer profile before continuing.")).toBeVisible();
  });
});
