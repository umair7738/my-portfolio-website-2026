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
  await page.waitForSelector(".page-loader", { state: "detached" });
  const filter = page.locator("[data-project-filter]").nth(1);
  await filter.scrollIntoViewIfNeeded();
  await expect(filter).toBeVisible();
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

test("keeps page scroll locked while the language list scrolls", async ({ page }) => {
  await mockLocales(page);
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 360));
  const before = await page.evaluate(() => window.scrollY);
  await page.locator("[data-language-trigger]").click();
  await expect(page.locator("[data-language-panel]")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/language-panel-open/);
  const list = page.locator("[data-language-list]");
  await list.hover();
  await page.mouse.wheel(0, 520);
  await page.waitForTimeout(100);
  const state = await page.evaluate(() => ({ pageY: window.scrollY, listY: document.querySelector("[data-language-list]").scrollTop }));
  expect(state.pageY).toBe(before);
  expect(state.listY).toBeGreaterThan(0);
  await page.locator("[data-language-trigger]").click();
  await expect(page.locator("html")).not.toHaveClass(/language-panel-open/);
});

test("uses the Google Translate fallback from the same selector", async ({ page }) => {
  await page.route("**/assets/i18n/manifest.json", (route) => route.fulfill({ json: { ready: ["en-IN"] } }));
  await page.route("https://translate.google.com/translate_a/element.js?cb=PortfolioGoogleTranslateInit", (route) => route.fulfill({
    contentType: "application/javascript",
    body: `window.google={translate:{TranslateElement:function(_,id){var s=document.createElement('select');s.className='goog-te-combo';['','hi','ar','es','fr','de','pt','it','nl','pl','tr','ru','zh-CN','ja','ko','id','vi','th','bn','ur'].forEach(function(v){var o=document.createElement('option');o.value=v;s.append(o)});document.getElementById(id).append(s)}}};window.PortfolioGoogleTranslateInit();`
  }));
  await page.goto("/");
  await page.locator("[data-language-trigger]").click();
  await expect(page.locator("[data-language-google-toggle]")).toHaveCount(0);
  await expect(page.locator(".language-unavailable")).toHaveCount(0);
  await page.locator("[data-language-code='es-ES']").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
  expect(await page.evaluate(() => localStorage.getItem("portfolio-locale-provider"))).toBe("google");
});

test("handles Google wrapped text nodes when returning to a local locale", async ({ page }) => {
  await page.route("**/assets/i18n/manifest.json", (route) => route.fulfill({ json: { ready: ["en-IN"] } }));
  await page.route("https://translate.google.com/translate_a/element.js?cb=PortfolioGoogleTranslateInit", (route) => route.fulfill({
    contentType: "application/javascript",
    body: `window.google={translate:{TranslateElement:function(_,id){var s=document.createElement('select');s.className='goog-te-combo';['','hi','ar','es','fr','de','pt','it','nl','pl','tr','ru','zh-CN','ja','ko','id','vi','th','bn','ur'].forEach(function(v){var o=document.createElement('option');o.value=v;s.append(o)});document.getElementById(id).append(s)}}};window.PortfolioGoogleTranslateInit();`
  }));
  await page.goto("/");
  await page.locator("[data-language-trigger]").click();
  await page.locator("[data-language-code='es-ES']").click();
  await page.evaluate(() => {
    const element = document.querySelector('[data-i18n-text="0:index.text.0001"]');
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const node = walker.nextNode();
    const wrapper = document.createElement("font");
    wrapper.textContent = node.nodeValue;
    node.replaceWith(wrapper);
  });
  const result = await page.evaluate(async () => {
    await Portfolio.I18n.setLocale("en-IN");
    return { code: Portfolio.I18n.code, text: document.querySelector('[data-i18n-text="0:index.text.0001"]').textContent };
  });
  expect(result.code).toBe("en-IN");
  expect(result.text).toBe("Skip to main content");
});
