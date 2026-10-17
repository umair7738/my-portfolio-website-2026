const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const reviewDirectory = path.join(process.cwd(), "tmp", "brand-review");

async function ready(page) {
  await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-ready", "");
  await expect(page.locator(".page-loader")).toBeHidden({ timeout: 20000 });
}

test("renders approved logos with clearance at every requested width in both themes", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "This explicit viewport matrix runs once.");
  test.setTimeout(180000);
  fs.mkdirSync(reviewDirectory, { recursive: true });
  const results = [];
  for (const theme of ["dark", "light"]) {
    for (const width of [320, 375, 390, 768, 992, 1024, 1199, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme === "light" ? "dark" : "light" });
      await context.addInitScript((savedTheme) => {
        localStorage.setItem("portfolio-theme", savedTheme);
        window.__brandShifts = [];
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput && entry.sources.some((source) => source.node?.closest?.(".brand"))) window.__brandShifts.push(entry.value);
          });
        }).observe({ type: "layout-shift", buffered: true });
      }, theme);
      const page = await context.newPage();
      const requests = [];
      page.on("request", (request) => { if (request.url().includes("/assets/brand/umair-builds-horizontal-")) requests.push(request.url()); });
      await page.goto("/", { waitUntil: "load" });
      await ready(page);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("[data-site-header] img")).toHaveCount(1);
      await expect(page.locator("[data-site-header] img")).toHaveAttribute("alt", "Umair Builds");
      await expect(page.getByRole("link", { name: "Umair Builds home", exact: true })).toHaveCount(2);
      expect(requests, `${theme}/${width}: only the required header variant should load initially`).toHaveLength(1);
      expect(requests[0]).toContain(`horizontal-${theme}-200.webp?v=`);
      const layout = await page.evaluate(() => {
        const rect = (selector) => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right };
        };
        const header = rect(".navbar-shell"), logo = rect("[data-site-header] .brand"), nav = rect(".desktop-nav"), actions = rect(".navbar-actions");
        const image = document.querySelector("[data-site-header] img");
        const textLines = [...document.querySelectorAll(".desktop-nav a, .navbar-actions .btn")].map((link) => {
          const text = [...link.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
          const range = document.createRange(); range.selectNodeContents(text);
          return range.getClientRects().length;
        });
        return { header, logo, nav, actions, textLines, image: { complete: image.complete, width: image.naturalWidth, currentSrc: image.currentSrc }, overflow: document.documentElement.scrollWidth > innerWidth + 1, logoShifts: window.__brandShifts };
      });
      expect(layout.overflow).toBe(false);
      expect(layout.image.complete && layout.image.width > 0).toBe(true);
      expect(layout.header.height).toBe(width < 992 ? 72 : 84);
      expect(Math.abs(layout.logo.y + layout.logo.height / 2 - layout.header.height / 2)).toBeLessThan(1);
      expect(Math.abs(layout.logo.width / layout.logo.height - 1853 / 301)).toBeLessThan(0.01);
      expect(layout.actions.right).toBeLessThanOrEqual(layout.header.right + 1);
      expect(layout.logo.right + 12).toBeLessThanOrEqual(width < 992 ? layout.actions.x : layout.nav.x);
      if (width >= 992) {
        expect(layout.nav.right + 12).toBeLessThanOrEqual(layout.actions.x);
        expect(layout.textLines.every((lines) => lines === 1)).toBe(true);
      }
      expect(layout.logoShifts).toEqual([]);
      await page.screenshot({ path: path.join(reviewDirectory, `after-${theme}-${width}.png`) });
      if (width < 992) {
        await page.getByRole("button", { name: "Open navigation", exact: true }).click();
        await expect(page.locator("#mobileMenu")).toBeVisible();
        await expect(page.locator("#mobileMenu")).toHaveClass(/\bshow\b/);
        await expect(page.locator(".menu-toggle")).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-theme", theme);
        await page.keyboard.press("Escape");
        await expect(page.locator("#mobileMenu")).toBeHidden();
      }
      await page.locator("[data-footer] .brand").scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator("[data-footer] img").evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(await page.locator("[data-footer] img").evaluate((img) => img.currentSrc)).toContain("horizontal-dark-200.webp?v=");
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(reviewDirectory, `after-footer-${theme}-${width}.png`) });
      results.push({ theme, width, ...layout, requestedLogoAssets: requests });
      await context.close();
    }
  }
  fs.writeFileSync(path.join(reviewDirectory, "responsive-results.json"), JSON.stringify(results, null, 2) + "\n");
});

test("keeps the selected logo through theme changes, navigation, and reload", async ({ page }) => {
  await page.goto("/about.html");
  await ready(page);
  const logo = page.locator("[data-site-header] img");
  await page.locator("[data-site-header] .theme-toggle").click();
  await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-theme", "light");
  await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-ready", "");
  expect(await logo.evaluate((img) => img.currentSrc)).toContain("horizontal-light-");
  await page.locator("[data-site-header] .brand").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-theme", "light");
  await page.reload();
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await logo.evaluate((img) => img.currentSrc)).toContain("horizontal-light-");
});

test("loads the higher density logo without fetching PNG fallbacks", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Density check runs once.");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => { if (request.url().includes("/assets/brand/umair-builds-horizontal-")) requests.push(request.url()); });
  await page.goto("/");
  await ready(page);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toContain("horizontal-dark-400.webp?v=");
  await page.locator("[data-site-header] .brand").screenshot({ path: path.join(reviewDirectory, "logo-dark-2x.png") });
  await page.locator("[data-site-header] .theme-toggle").click();
  await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-ready", "");
  await page.locator("[data-site-header] .brand").screenshot({ path: path.join(reviewDirectory, "logo-light-2x.png") });
  expect(requests).toHaveLength(2);
  expect(requests.every((url) => url.includes("400.webp"))).toBe(true);
  await context.close();
});

test("serves every favicon and decodes the PNG logo fallbacks", async ({ page, request }) => {
  await page.goto("/404.html");
  const links = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((nodes) => nodes.map((node) => node.href));
  expect(links).toHaveLength(5);
  for (const url of links) {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  }
  for (const theme of ["light", "dark"]) {
    const dimensions = await page.evaluate(async (variant) => {
      const image = new Image(); image.src = `/assets/brand/umair-builds-horizontal-${variant}-400.png`;
      await image.decode(); return { width: image.naturalWidth, height: image.naturalHeight };
    }, theme);
    expect(dimensions).toEqual({ width: 400, height: 65 });
  }
});
