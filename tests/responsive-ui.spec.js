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

test("keeps fixed quick actions out of short mobile reading areas", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The explicit short-viewport check runs once in Chromium.");
  for (const viewport of [
    { name: "short", width: 390, height: 506, expected: "none" },
    { name: "standard", width: 390, height: 844, expected: "flex" }
  ]) {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".floating-actions")).toHaveCSS("display", viewport.expected);
    } finally {
      await context.close();
    }
  }
});

test("aligns and advances the home process timeline at 425 by 642", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The exact mobile regression check runs once in Chromium.");
  const context = await browser.newContext({ viewport: { width: 425, height: 642 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".process-motion-line")).toBeAttached();
    await expect(page.locator(".page-loader")).toBeHidden({ timeout: 10000 });
    const consent = page.getByRole("button", { name: "Not now" });
    if (await consent.isVisible()) await consent.click();

    const initialLayout = await page.evaluate(() => {
      const process = document.querySelector(".process-steps");
      const projects = document.querySelector("[data-projects-featured]");
      const trigger = window.ScrollTrigger.getAll().find((item) => item.trigger === process);
      return {
        projectHeight: projects.getBoundingClientRect().height,
        processTop: process.getBoundingClientRect().top + window.scrollY,
        triggerStart: trigger.start,
        triggerEnd: trigger.end
      };
    });
    const cards = page.locator("[data-projects-featured] .project-card");
    for (let index = 0; index < await cards.count(); index += 1) {
      await cards.nth(index).scrollIntoViewIfNeeded();
      await page.waitForTimeout(120);
    }
    await page.locator(".horizontal-section").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const layoutAfterApproach = await page.evaluate(() => {
      const process = document.querySelector(".process-steps");
      const projects = document.querySelector("[data-projects-featured]");
      const trigger = window.ScrollTrigger.getAll().find((item) => item.trigger === process);
      return {
        projectHeight: projects.getBoundingClientRect().height,
        processTop: process.getBoundingClientRect().top + window.scrollY,
        triggerStart: trigger.start,
        triggerEnd: trigger.end
      };
    });
    expect(layoutAfterApproach.projectHeight).toBeCloseTo(initialLayout.projectHeight, 0);
    expect(layoutAfterApproach.processTop).toBeCloseTo(initialLayout.processTop, 0);
    expect(layoutAfterApproach.triggerStart).toBeCloseTo(initialLayout.triggerStart, 0);
    expect(layoutAfterApproach.triggerEnd).toBeCloseTo(initialLayout.triggerEnd, 0);

    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
      window.ScrollTrigger.refresh();
      const trigger = window.ScrollTrigger.getAll().find((item) => item.trigger && item.trigger.matches(".process-steps"));
      window.scrollTo(0, trigger.start + ((trigger.end - trigger.start) * .5));
      window.ScrollTrigger.update();
    });
    await page.waitForTimeout(500);

    const middle = await page.evaluate(() => {
      const process = document.querySelector(".process-steps");
      const line = process.querySelector(".process-motion-line");
      const marker = process.querySelector(".process-percent");
      const steps = Array.from(process.querySelectorAll(".process-step"));
      const dotCenter = (step) => {
        const box = step.getBoundingClientRect();
        const dot = getComputedStyle(step, "::before");
        return {
          x: box.left + parseFloat(dot.left) + (parseFloat(dot.width) / 2),
          y: box.top + parseFloat(dot.top) + (parseFloat(dot.height) / 2)
        };
      };
      const lineBox = line.getBoundingClientRect();
      const markerBox = marker.getBoundingClientRect();
      const dots = steps.map(dotCenter);
      return {
        progress: parseFloat(getComputedStyle(process).getPropertyValue("--process-progress")),
        lineCenterX: lineBox.left + (lineBox.width / 2),
        lineStartY: lineBox.top,
        firstDot: dots[0],
        markerLeft: markerBox.left,
        markerRight: markerBox.right,
        viewportWidth: document.documentElement.clientWidth,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        active: steps.map((step) => step.classList.contains("is-process-active")),
        textOpacity: steps.map((step) => parseFloat(getComputedStyle(step.querySelector("h3")).opacity))
      };
    });

    expect(middle.horizontalOverflow).toBe(false);
    expect(Math.abs(middle.lineCenterX - middle.firstDot.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(middle.lineStartY - middle.firstDot.y)).toBeLessThanOrEqual(1);
    expect(middle.markerLeft).toBeGreaterThanOrEqual(0);
    expect(middle.markerRight).toBeLessThanOrEqual(middle.viewportWidth);
    expect(middle.progress).toBeGreaterThan(.45);
    expect(middle.progress).toBeLessThan(.55);
    expect(middle.active).toEqual([true, true, false, false]);
    expect(middle.textOpacity[0]).toBeCloseTo(1, 1);
    expect(middle.textOpacity[2]).toBeCloseTo(.48, 1);
    await page.screenshot({ path: path.join(process.cwd(), "output", "playwright", "home-process-425x642-mid.png") });

    await page.evaluate(() => {
      const trigger = window.ScrollTrigger.getAll().find((item) => item.trigger && item.trigger.matches(".process-steps"));
      window.scrollTo(0, trigger.end + 2);
      window.ScrollTrigger.update();
    });
    await page.waitForTimeout(400);
    await expect(page.locator(".process-step.is-process-active")).toHaveCount(4);
    await page.screenshot({ path: path.join(process.cwd(), "output", "playwright", "home-process-425x642.png") });
  } finally {
    await context.close();
  }
});
