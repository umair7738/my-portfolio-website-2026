const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const viewports = [
  { name: "320", width: 320, height: 568 },
  { name: "360", width: 360, height: 740 },
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "414", width: 414, height: 896 },
  { name: "430", width: 430, height: 932 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "large-desktop", width: 1920, height: 1080 },
  { name: "mobile-landscape", width: 568, height: 320 }
];

test("keeps the language picker usable and in bounds across the responsive matrix", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The explicit viewport matrix runs once in Chromium.");
  test.setTimeout(120000);
  const output = path.join(process.cwd(), "output", "playwright");
  fs.mkdirSync(output, { recursive: true });

  for (const viewport of viewports) {
    const isTouchLayout = viewport.width < 992;
    const context = await browser.newContext({ viewport, isMobile: isTouchLayout, hasTouch: isTouchLayout });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const trigger = page.locator("[data-language-trigger]");
      await expect(trigger).toBeVisible();
      await trigger.click();
      const panel = page.locator("[data-language-panel]");
      await expect(panel).toBeVisible();

      const layout = await page.evaluate(() => {
        const rect = (selector) => {
          const box = document.querySelector(selector).getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        };
        return {
          panel: rect("[data-language-panel]"),
          viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
          horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          languageLayer: Number(getComputedStyle(document.querySelector("[data-site-header]")).zIndex),
          consentLayer: Number(getComputedStyle(document.querySelector("[data-analytics-consent]")).zIndex)
        };
      });
      expect(layout.horizontalOverflow, `${viewport.name}: page-level horizontal overflow`).toBe(false);
      expect(layout.panel.left, `${viewport.name}: panel left edge`).toBeGreaterThanOrEqual(-1);
      expect(layout.panel.right, `${viewport.name}: panel right edge`).toBeLessThanOrEqual(layout.viewport.width + 1);
      expect(layout.panel.top, `${viewport.name}: panel top edge`).toBeGreaterThanOrEqual(-1);
      expect(layout.panel.bottom, `${viewport.name}: panel bottom edge`).toBeLessThanOrEqual(layout.viewport.height + 1);
      expect(layout.languageLayer, `${viewport.name}: language panel layer`).toBeGreaterThan(layout.consentLayer);

      await page.locator("[data-language-search]").fill("Spain");
      await expect(page.locator("[data-language-code='es-ES']")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();

      if (isTouchLayout) {
        await page.getByRole("button", { name: "Open navigation", exact: true }).click();
        await expect(page.locator("#mobileMenu")).toBeVisible();
        await expect(page.locator("#mobileMenu")).toHaveClass(/\bshow\b/);
        await page.keyboard.press("Escape");
        await expect(page.locator("#mobileMenu")).toBeHidden();
      }
      if (["320", "390", "desktop"].includes(viewport.name)) {
        await trigger.click();
        await page.screenshot({ path: path.join(output, `language-panel-${viewport.name}.png`) });
      }
      expect(pageErrors, `${viewport.name}: uncaught browser errors`).toEqual([]);
    } finally {
      await context.close();
    }
  }
});
