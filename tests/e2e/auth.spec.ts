import { test, expect } from "@playwright/test";

test.describe("Authentication & Authorization", () => {
  test("should redirect unauthenticated user to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/.*\/auth\/sign-in/);
  });

  test("should allow admin to login and access dashboard", async ({ page }) => {
    // This assumes the admin user exists (seeded)
    await page.goto("/auth/sign-in");

    // Fill login form
    // Note: Adjust selectors based on actual login page implementation
    await page.fill('input[type="email"]', "admin@hbm.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Check for admin specific element
    await expect(page.locator("text=Overview")).toBeVisible();
  });

  test("should block student from accessing admin routes", async ({ page }) => {
    // Login as student
    await page.goto("/auth/sign-in");

    await page.fill('input[type="email"]', "student1@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for login to complete (e.g. redirect to student dashboard or home)
    await page.waitForURL((url) => !url.href.includes("sign-in"));

    // Try to access admin dashboard
    await page.goto("/admin/dashboard");

    // Should be redirected or show 403
    // Adjust expectation based on middleware/RBAC implementation
    // If middleware redirects unauthorized users to home or 403 page:
    // await expect(page).not.toHaveURL(/\/admin\/dashboard/);

    // Assuming it redirects to 403 or home
    const title = await page.title();
    // Verify NOT admin dashboard
    expect(page.url()).not.toContain("/admin/dashboard");
  });
});
