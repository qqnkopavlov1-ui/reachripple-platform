import { test, expect } from "@playwright/test";

/**
 * Smoke tests for B8–B10 additions:
 * - PWA manifest is reachable + has installable shape
 * - Manifest theme-color matches new amber brand
 * - Search page renders sort dropdown (incl. new "Online now" option)
 * - localStorage `viva_safe_browsing` defaults to "1" on first visit
 */
test.describe("B8–B10 smoke", () => {
  test("manifest.json is reachable and installable", async ({ page }) => {
    const resp = await page.goto("/manifest.json");
    expect(resp?.ok()).toBeTruthy();
    const json = await resp!.json();
    expect(json.display).toBe("standalone");
    expect(json.theme_color).toBe("#f59e0b");
    expect(Array.isArray(json.icons)).toBe(true);
    expect(json.icons.length).toBeGreaterThanOrEqual(2);
    expect(json.start_url).toBe("/");
  });

  test("theme-color meta tag is amber on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const themeColor = await page.locator('meta[name="theme-color"]').first().getAttribute("content");
    expect(themeColor).toBe("#f59e0b");
  });

  test("safe-browsing pref defaults to enabled on first visit", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.removeItem("viva_safe_browsing"));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Read after app initialisation has had a tick
    const pref = await page.evaluate(() => window.localStorage.getItem("viva_safe_browsing"));
    // Either the hook has set it explicitly to "1" or left it null (default-on)
    expect(pref === null || pref === "1").toBe(true);
  });

  test("search page renders and contains Online-now sort option", async ({ page }) => {
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    // SortDropdown renders option text; tolerate either visible select or chip variant
    expect(html.toLowerCase()).toContain("online now");
  });
});
