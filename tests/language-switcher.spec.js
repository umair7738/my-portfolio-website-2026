const { test, expect } = require("@playwright/test");
const english = require("../assets/i18n/en.json");

function syntheticBundle(prefix) {
  return Object.fromEntries(Object.entries(english).map(([key, value]) => [key, prefix + value]));
}

async function mockLocales(page, options = {}) {
  await page.route("**/assets/i18n/manifest.json", (route) => route.fulfill({ json: { ready: ["en-IN", "es-ES", "ar-AE", "pt-BR"] } }));
  await page.route("**/assets/i18n/es-ES.json", async (route) => {
    if (options.slowSpanish) await new Promise((resolve) => setTimeout(resolve, 350));
    await route.fulfill({ json: syntheticBundle("[ES] ") });
  });
  await page.route("**/assets/i18n/ar-AE.json", (route) => route.fulfill({ json: syntheticBundle("[AR] ") }));
  await page.route("**/assets/i18n/pt-BR.json", (route) => route.abort());
}

test("searches languages, switches without navigation, and restores the saved choice", async ({ page }) => {
  await mockLocales(page);
  await page.goto("/");
  await expect(page.locator("[data-language-trigger]")).toBeVisible();
  const originalUrl = page.url();
  await page.locator("[data-language-trigger]").click();
  await page.locator("[data-language-search]").fill("Spain");
  await expect(page.locator("[data-language-code='es-ES']")).toBeVisible();
  await page.locator("[data-language-code='es-ES']").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
  await expect(page.locator(".desktop-nav [data-nav='home']")).toHaveText("[ES] Home");
  expect(page.url()).toBe(originalUrl);
  expect(await page.evaluate(() => localStorage.getItem("portfolio-locale"))).toBe("es-ES");
  await page.reload();
  await expect(page.locator(".desktop-nav [data-nav='home']")).toHaveText("[ES] Home");
  await page.evaluate(() => window.barba.go("about.html"));
  await expect(page).toHaveURL(/about\.html$/);
  await expect(page.locator(".page-title")).toContainText("[ES]");
});

test("keeps the latest request and the current locale when a later load fails", async ({ page }) => {
  await mockLocales(page, { slowSpanish: true });
  await page.goto("/");
  await page.waitForFunction(() => window.Portfolio && Portfolio.I18n && Portfolio.Router.started);
  const outcome = await page.evaluate(async () => {
    const first = Portfolio.I18n.setLocale("es-ES");
    const second = Portfolio.I18n.setLocale("ar-AE");
    return Promise.allSettled([first, second]);
  });
  expect(outcome[0].value).toBe(false);
  expect(outcome[1].value).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", "ar-AE");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".desktop-nav [data-nav='home']")).toHaveText("[AR] Home");
  expect(await page.evaluate(() => Portfolio.I18n.setLocale("pt-BR").then(() => "ok", () => "failed"))).toBe("failed");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar-AE");
  expect(await page.evaluate(() => localStorage.getItem("portfolio-locale"))).toBe("ar-AE");
});

test("keeps form values and project filter identifiers stable", async ({ page }) => {
  await mockLocales(page);
  await page.goto("/contact.html");
  await expect(page.locator("#projectType")).toBeVisible();
  await page.locator("#projectType").selectOption("Business website");
  await page.evaluate(() => Portfolio.I18n.setLocale("es-ES"));
  await expect(page.locator("#projectType")).toHaveValue("Business website");
  await page.goto("/projects.html");
  await page.waitForFunction(() => window.Portfolio && Portfolio.Router.started);
  const filter = page.locator("[data-project-filter]").nth(1);
  await filter.click();
  const category = await filter.getAttribute("data-project-filter");
  await page.evaluate(() => Portfolio.I18n.setLocale("ar-AE"));
  await expect(page.locator("[data-project-filter='" + category + "']")).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator(".project-card[data-category='" + category + "']").first().evaluate((card) => card.hidden)).toBe(false);
});

test("does not accept an invalid saved locale", async ({ page }) => {
  await mockLocales(page);
  await page.addInitScript(() => localStorage.setItem("portfolio-locale", "invalid"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-IN");
  expect(await page.evaluate(() => localStorage.getItem("portfolio-locale"))).toBeNull();
});
