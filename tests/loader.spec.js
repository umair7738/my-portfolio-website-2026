const { test, expect } = require("@playwright/test");

test("does not flash static loader letters before the desktop intro starts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Explicit desktop loading-race scenario.");
  let releaseFooter;
  const footerReady = new Promise((resolve) => { releaseFooter = resolve; });
  await page.route("**/components/footer.html", async (route) => {
    await footerReady;
    await route.continue();
  });
  await page.route("**/assets/js/portfolio.min.js*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()) + ";window.__loaderPlays=0;const originalLoaderPlay=Portfolio.Loader.play;Portfolio.Loader.play=function(){window.__loaderPlays++;return originalLoaderPlay.apply(this,arguments);};" });
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".page-loader")).toHaveCount(1);
    // Components can finish out of order. Never paint the final letters and
    // then reset them to their entrance position when a slower request ends.
    await expect(page.locator(".loader-stage")).toBeVisible();
    const entrance = await page.locator(".loader-letter").first().evaluate((letter) => ({
      y: new DOMMatrixReadOnly(getComputedStyle(letter).transform).m42,
      height: letter.getBoundingClientRect().height,
      clipped: getComputedStyle(letter.parentElement).overflow === "hidden"
    }));
    expect(entrance.clipped).toBe(true);
    expect(entrance.y).toBeGreaterThan(entrance.height * .9);
    expect(await page.evaluate(() => window.__loaderPlays)).toBe(0);
    releaseFooter();
    await expect(page.locator(".page-loader")).toHaveCount(0, { timeout: 15000 });
    expect(await page.evaluate(() => window.__loaderPlays)).toBe(1);
    await page.locator('.desktop-nav [data-nav="about"]').click();
    await expect(page).toHaveURL(/about\.html$/);
    await expect(page.locator(".page-loader")).toHaveCount(0);
    expect(await page.evaluate(() => window.__loaderPlays)).toBe(1);
  } finally {
    releaseFooter();
  }
});

test("keeps the first-paint cover until a delayed mobile loader reveals the page", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Explicit touch/mobile loading-race scenario.");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  let releaseLoader;
  const loaderReady = new Promise((resolve) => { releaseLoader = resolve; });
  await page.route("**/components/loader.html", async (route) => {
    await loaderReady;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-theme-logo]")).toHaveAttribute("data-logo-ready", "");
    // Cross the old independent 760–960ms cover deadline while the actual
    // loader request is held. The page must not show before the loader arrives.
    await page.waitForTimeout(1200);
    const cover = await page.evaluate(() => {
      const style = getComputedStyle(document.body, "::before");
      return { opacity: style.opacity, visibility: style.visibility };
    });
    expect(cover).toEqual({ opacity: "1", visibility: "visible" });
    releaseLoader();
    await expect(page.locator(".page-loader")).toHaveCount(1);
    await expect(page.locator(".loader-stage")).toBeVisible();
    await expect(page.locator(".page-loader")).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator("body")).not.toHaveClass(/\bloading\b/);
    await expect(page.locator(".home-hero .hero-content")).toBeVisible();
  } finally {
    releaseLoader();
    await context.close();
  }
});
