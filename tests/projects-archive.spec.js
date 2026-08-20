const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, (route) => route.abort());
  await page.goto("/projects.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-projects-grid] .project-card")).toHaveCount(17);
  await expect(page.locator(".page-loader")).toBeHidden({ timeout: 15000 });
});

async function openArchiveControls(page) {
  await page.locator(".project-toolbar").evaluate((toolbar) => toolbar.scrollIntoView({ block: "center", behavior: "instant" }));
  await expect(page.locator("[data-project-search]")).toBeAttached();
}

test("renders the complete archive and truthful status links", async ({ page }) => {
  await expect(page.locator("[data-project-result-count]")).toHaveText("17 projects");
  await expect(page.locator(".project-card.is-featured")).toHaveCount(4);
  await expect(page.locator("#project-bride-is-pride")).toHaveAttribute("data-status", "ARCHIVED");
  await expect(page.locator("#project-equity-exchange-academy")).toHaveAttribute("data-status", "ARCHIVED");
  await expect(page.locator("#project-bride-is-pride .project-links a", { hasText: "Live site" })).toHaveCount(0);
  await expect(page.locator("#project-equity-exchange-academy .project-links a", { hasText: "Live site" })).toHaveCount(0);
  await expect(page.locator(".project-technologies")).toHaveCount(17);
});

test("combines search, category, and status filters", async ({ page }) => {
  await openArchiveControls(page);
  await page.getByRole("button", { name: "Education" }).click();
  await expect(page.locator(".project-card:not([hidden])")).toHaveCount(4);
  await page.locator("[data-project-status]").selectOption("ARCHIVED");
  await expect(page.locator(".project-card:not([hidden])")).toHaveCount(1);
  await expect(page.locator("[data-project-result-count]")).toHaveText("1 project");
  await page.locator("[data-project-search]").fill("equity");
  await expect(page.locator("#project-equity-exchange-academy")).toHaveJSProperty("hidden", false);
  await page.locator("[data-project-search-clear]").click();
  await expect(page.locator("[data-project-search]")).toHaveValue("");
});

test("searches project technology stacks", async ({ page }) => {
  await openArchiveControls(page);
  await page.locator("[data-project-search]").fill("wordpress");
  await expect(page.locator(".project-card:not([hidden])")).toHaveCount(2);
  await expect(page.locator("#project-utc-india")).toHaveJSProperty("hidden", false);
  await expect(page.locator("#project-bride-is-pride")).toHaveJSProperty("hidden", false);
  await page.locator("[data-project-search]").fill("laravel");
  await expect(page.locator(".project-card:not([hidden])")).toHaveCount(7);
  await expect(page.locator("#project-motiwala-jewels")).toHaveJSProperty("hidden", false);
  await expect(page.locator("#project-lijjat")).toHaveJSProperty("hidden", false);
});

test("has keyboard-visible controls and no horizontal overflow", async ({ page }) => {
  await openArchiveControls(page);
  await page.getByRole("button", { name: "All", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Education" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".project-card:not([hidden])")).toHaveCount(4);
  await page.locator("[data-project-status]").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("[data-project-status]")).toHaveValue("ARCHIVED");
  await page.locator("[data-project-search]").focus();
  await expect(page.locator("[data-project-search]")).toBeFocused();
  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return {
      documentOverflow: document.documentElement.scrollWidth > width + 1,
      offenders: [...document.querySelectorAll("body *")].filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.position !== "fixed" && rect.width > 0 && (rect.left < -1 || rect.right > width + 1);
      }).slice(0, 12).map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
    };
  });
  expect(layout.documentOverflow, `Elements outside the viewport: ${layout.offenders.join(", ")}`).toBe(false);
});

test("supports the dark and light archive themes", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("[data-site-header] .theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("[data-projects-grid]")).toBeVisible();
});

test("uses mobile project sources on narrow screens", async ({ page, browserName }) => {
  test.skip(page.viewportSize().width >= 768, "Mobile-only assertion");
  const source = page.locator("#project-infinity-learning-academy source[media]").first();
  await expect(source).toHaveAttribute("srcset", /mobile-780\.avif$/);
});
