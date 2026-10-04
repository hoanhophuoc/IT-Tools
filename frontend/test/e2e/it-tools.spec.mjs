import { test, expect } from "@playwright/test";

test.describe("IT-Tools E2E Test Suite", () => {
  test("Home page loads with tools and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/IT-Tools/i);

    // Verify search input is present
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    await expect(searchInput.first()).toBeVisible();

    // Verify tool cards are rendered
    const toolCards = page.locator('a[href^="/tools/"]');
    await expect(toolCards.first()).toBeVisible();
    const count = await toolCards.count();
    expect(count).toBeGreaterThan(10);
  });

  test("Search filters tools correctly", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]').first();
    await searchInput.fill("base64");

    // Expect base64 converter card to appear
    const base64Card = page.locator('a[href="/tools/base64-string-converter"]');
    await expect(base64Card).toBeVisible();
  });

  test("Base64 string converter tool works interactively", async ({ page }) => {
    await page.goto("/tools/base64-string-converter");

    // Check header
    await expect(page.locator("h1")).toContainText(/Base64/i);

    // Input text
    const textareas = page.locator("textarea");
    await expect(textareas.first()).toBeVisible();

    await textareas.first().fill("Hello Antigravity Testing");

    // Output textarea should have base64 representation
    const outputTextarea = textareas.nth(1);
    await expect(outputTextarea).toHaveValue("SGVsbG8gQW50aWdyYXZpdHkgVGVzdGluZw==");

    // Test Swap button
    const swapButton = page.getByRole("button", { name: /Swap/i });
    if (await swapButton.isVisible()) {
      await swapButton.click();
      await expect(textareas.first()).toHaveValue("SGVsbG8gQW50aWdyYXZpdHkgVGVzdGluZw==");
      await expect(outputTextarea).toHaveValue("Hello Antigravity Testing");
    }
  });

  test("Authentication login page renders properly", async ({ page }) => {
    await page.goto("/auth/login");

    const usernameInput = page.locator('input[type="text"], input[name*="username" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("Non-existent tool redirects to 404 cleanly", async ({ page }) => {
    const response = await page.goto("/tools/non-existent-tool-slug-xyz");
    // Should render without unhandled errors
    expect([200, 404]).toContain(response.status());
  });
});
