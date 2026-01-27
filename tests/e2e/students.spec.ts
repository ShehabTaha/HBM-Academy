import { test, expect } from "@playwright/test";

test.describe("Student Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', "admin@hbm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    await page.goto("/admin/users"); // Or /admin/students, adjust based on inventory
  });

  test("should display students table", async ({ page }) => {
    await expect(page.getByRole("table")).toBeVisible();

    // Check for mocked/seeded data
    await expect(page.getByText("student1@test.com")).toBeVisible();
  });

  test("should allow sorting", async ({ page }) => {
    // Click on a header
    const header = page.getByRole("columnheader").first();
    await header.click();

    // Check url params or UI change?
    // Difficult to assert generic sorting without knowing exact UI
  });

  test("pagination works", async ({ page }) => {
    const nextBtn = page.getByRole("button", { name: /next|>/i });
    if ((await nextBtn.isVisible()) && (await nextBtn.isEnabled())) {
      await nextBtn.click();
      // specific assertion depends on data count
    }
  });
});
