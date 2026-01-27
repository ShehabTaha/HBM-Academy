import { test, expect } from "@playwright/test";
import routes from "../../route-inventory.json";

test.describe("Navigation Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/auth/sign-in");
    await page.fill('input[type="email"]', "admin@hbm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);
  });

  // Filter for static admin pages
  const adminPages = routes.filter(
    (r) =>
      r.type === "page" &&
      !r.path.includes("[") && // Skip dynamic routes for now
      r.path.startsWith("/admin"),
  );

  for (const route of adminPages) {
    test(`should load ${route.path}`, async ({ page }) => {
      await page.goto(route.path);

      // Check for successful load
      // Note: If using layouts, title might be constant, but we can check we didn't crash
      await expect(page.locator("text=Application Error")).not.toBeVisible();
      await expect(page.locator("text=404")).not.toBeVisible();

      // Should stay on the URL (not redirect away if we have permission)
      expect(page.url()).toContain(route.path);
    });
  }

  test("sidebar navigation works", async ({ page }) => {
    // Test clicking a few key sidebar items
    // Need to ensure sidebar is visible
    const sidebar = page.locator("aside"); // Assuming semantic html or use data-testid if available

    // This relies on having text in sidebar matching these
    const links = ["Dashboard", "Courses", "Users", "Analytics"];

    for (const linkText of links) {
      // Check if link exists before clicking
      const link = page
        .getByRole("link", { name: linkText, exact: false })
        .first();
      if (await link.isVisible()) {
        await link.click();
        await expect(page.locator("h1, h2").first()).toBeVisible();
      }
    }
  });
});
