const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const profiles = [
  { name: "desktop", width: 1440, hasTouch: false },
  { name: "mobile", width: 390, hasTouch: true, isMobile: true },
  { name: "touch-tablet", width: 1024, hasTouch: true, reducedMotion: "reduce" }
];

for (const profile of profiles) {
  test(`visibly animates intro, hero, and cards on ${profile.name}`, async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Explicit input/viewport profiles run once.");
    const directory = path.join(process.cwd(), "tmp", "animation-review");
    fs.mkdirSync(directory, { recursive: true });
    const context = await browser.newContext({ viewport: { width: profile.width, height: 900 }, hasTouch: profile.hasTouch, isMobile: !!profile.isMobile, reducedMotion: profile.reducedMotion || "no-preference" });
    await context.addInitScript(() => {
      window.__visibleMotion = { intro: [], hero: [], card: [], insertions: 0 };
      new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (node.matches(".page-loader") || node.querySelector(".page-loader"))) window.__visibleMotion.insertions += 1;
      }))).observe(document, { childList: true, subtree: true });
      const sample = () => {
        const visible = (element) => element && getComputedStyle(element).visibility === "visible" && Number(getComputedStyle(element).opacity) > 0.05;
        const y = (element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
        const stage = document.querySelector(".loader-stage");
        const letter = document.querySelector(".loader-letter");
        if (visible(stage) && letter) window.__visibleMotion.intro.push(y(letter));
        const hero = document.querySelector(".hero-title .line > span");
        if (hero && document.documentElement.classList.contains("motion-ready") && visible(document.querySelector(".hero-content"))) window.__visibleMotion.hero.push(y(hero));
        const card = document.querySelector(".feature-card");
        if (visible(card) && card.getBoundingClientRect().top < innerHeight) window.__visibleMotion.card.push({ y: y(card), opacity: Number(getComputedStyle(card).opacity) });
        window.__motionFrame = requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    const page = await context.newPage();
    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      // Observe rendered movement, not just a loader that eventually disappears.
      await expect.poll(() => page.evaluate(() => window.__visibleMotion.intro.some((value) => value > 2) && window.__visibleMotion.intro.some((value) => value < 2)), { timeout: 10000 }).toBe(true);
      await page.screenshot({ path: path.join(directory, `intro-${profile.name}.png`) });
      await expect.poll(() => page.evaluate(() => window.__visibleMotion.hero.some((value) => value > 8)), { timeout: 10000 }).toBe(true);
      await expect.poll(() => page.locator(".hero-title .line > span").first().evaluate((line) => new DOMMatrixReadOnly(getComputedStyle(line).transform).m42)).toBeLessThan(40);
      await page.screenshot({ path: path.join(directory, `hero-${profile.name}.png`) });
      await expect(page.locator(".page-loader")).toHaveCount(0);
      await expect.poll(() => page.evaluate(() => window.__visibleMotion.hero.some((value) => Math.abs(value) < 1)), { timeout: 10000 }).toBe(true);
      await page.locator(".feature-card").first().scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => window.__visibleMotion.card.some((value) => value.opacity > 0.05 && value.opacity < 0.95 && value.y > 1)), { timeout: 10000 }).toBe(true);
      await expect.poll(() => page.locator(".feature-card").first().evaluate((card) => Number(getComputedStyle(card).opacity))).toBe(1);
      await page.screenshot({ path: path.join(directory, `cards-${profile.name}.png`) });
      const samples = await page.evaluate(() => { cancelAnimationFrame(window.__motionFrame); return window.__visibleMotion; });
      expect(samples.insertions).toBe(1);
      expect(new Set(samples.intro.filter((value) => value > 2).map((value) => Math.round(value))).size).toBeGreaterThan(3);
      expect(new Set(samples.hero.filter((value) => value > 2).map((value) => Math.round(value))).size).toBeGreaterThan(3);
      fs.writeFileSync(path.join(directory, `motion-${profile.name}.json`), JSON.stringify(samples, null, 2) + "\n");
    } finally {
      await context.close();
    }
  });
}

test("preserves an explicit saved reduced-motion choice", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Explicit stored-preference scenario runs once.");
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.setItem("portfolio-motion", "reduced"));
  const page = await context.newPage();
  try {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(page.locator(".page-loader")).toHaveCount(0);
    await expect(page.locator(".home-hero .hero-content")).toBeVisible();
    expect(await page.locator(".hero-title .line > span").first().evaluate((line) => getComputedStyle(line).transform)).toBe("none");
    expect(await page.locator(".feature-card").first().evaluate((card) => getComputedStyle(card).opacity)).toBe("1");
  } finally {
    await context.close();
  }
});
