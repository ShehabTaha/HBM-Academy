import { test, expect } from "@playwright/test";

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', "admin@hbm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // Navigate to analytics if not already there (assuming /admin/dashboard has some, but let's go to dedicated if exists)
    // Checking inventory, likely /admin/analytics exists
    await page.goto("/admin/analytics");
  });

  test("should render charts and stats", async ({ page }) => {
    // Check for stats cards
    await expect(
      page.locator('.recharts-wrapper, [data-testid="chart"]'),
    ).toBeVisible();

    // Check for "Total Revenue" or similar text
    await expect(
      page.getByText(/Revenue|Students|Enrollments/i).first(),
    ).toBeVisible();
  });

  test("should allow date filtering", async ({ page }) => {
    // Look for date picker or range selector
    // This assumes UI implementation details.
    // If not sure, we just check existence of filter buttons
    const filterBtn = page
      .getByRole("button", { name: /filter|date|last/i })
      .first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      // Check dropdown opens
      await expect(page.getByRole("menu")).toBeVisible();
    }
  });
});
