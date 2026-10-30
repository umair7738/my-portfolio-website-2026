const { test, expect } = require("@playwright/test");

async function blockAndTrackAnalytics(page) {
  const requests = [];
  page.on("request", (request) => {
    if (/googletagmanager\.com|clarity\.ms/.test(request.url())) requests.push(request.url());
  });
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
  await page.route("https://www.clarity.ms/**", (route) => route.abort());
  return requests;
}

async function waitForInitialPageView(page) {
  await page.waitForFunction(() => (window.dataLayer || []).some((entry) => {
    const command = Array.from(entry);
    return command[0] === "event" && command[1] === "page_view";
  }));
}

test("keeps analytics denied and remembers the decline", async ({ page }) => {
  const requests = await blockAndTrackAnalytics(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  const banner = page.locator("[data-analytics-consent]");
  await expect(banner).toBeVisible();
  await expect(page.locator("script[src*='googletagmanager.com'], script[src*='clarity.ms']")).toHaveCount(0);
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(banner).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-analytics-consent"))).toBe("denied");
  await page.reload();
  await expect(page.locator("[data-analytics-consent]")).toBeHidden();
  await expect(page.locator("script[src*='googletagmanager.com'], script[src*='clarity.ms']")).toHaveCount(0);

  expect(requests).toHaveLength(0);
  expect(pageErrors).toEqual([]);
});

test("loads GA4 and Clarity once after opt-in and persists the preference", async ({ page }) => {
  const requests = await blockAndTrackAnalytics(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.locator("[data-analytics-consent]")).toBeVisible();
  await page.getByRole("button", { name: "Allow analytics" }).click();
  await expect(page.locator("script[data-portfolio-clarity]")).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-analytics-consent"))).toBe("granted");
  await waitForInitialPageView(page);

  const firstLoad = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      gaScripts: document.querySelectorAll("script[src*='googletagmanager.com/gtag/js']").length,
      clarityScripts: document.querySelectorAll("script[data-portfolio-clarity]").length,
      configs: commands.filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").length
    };
  });
  expect(firstLoad).toEqual({ gaScripts: 1, clarityScripts: 1, configs: 1, pageViews: 1 });
  expect(requests.filter((url) => url.includes("googletagmanager.com/gtag/js"))).toHaveLength(1);
  expect(requests.filter((url) => url.includes("clarity.ms/tag/"))).toHaveLength(1);

  await page.reload();
  await waitForInitialPageView(page);
  const persistedLoad = await page.evaluate(() => ({
    consent: localStorage.getItem("portfolio-analytics-consent"),
    gaScripts: document.querySelectorAll("script[src*='googletagmanager.com/gtag/js']").length,
    clarityScripts: document.querySelectorAll("script[data-portfolio-clarity]").length,
    configs: (window.dataLayer || []).map((entry) => Array.from(entry)).filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
    pageViews: (window.dataLayer || []).map((entry) => Array.from(entry)).filter((command) => command[0] === "event" && command[1] === "page_view").length
  }));
  expect(persistedLoad).toEqual({ consent: "granted", gaScripts: 1, clarityScripts: 1, configs: 1, pageViews: 1 });
  expect(requests.filter((url) => url.includes("googletagmanager.com/gtag/js"))).toHaveLength(2);
  expect(requests.filter((url) => url.includes("clarity.ms/tag/"))).toHaveLength(2);
  expect(pageErrors).toEqual([]);
});

test("supports changing a declined choice and tracks in-page navigation once", async ({ page }) => {
  const requests = await blockAndTrackAnalytics(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Not now" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-analytics-consent"))).toBe("denied");
  expect(requests).toHaveLength(0);

  await page.evaluate(() => localStorage.removeItem("portfolio-analytics-consent"));
  await page.reload();
  await expect(page.locator("[data-analytics-consent]")).toBeVisible();
  await page.getByRole("button", { name: "Allow analytics" }).click();
  await waitForInitialPageView(page);

  if (await page.locator("[data-bs-target='#mobileMenu']").isVisible()) {
    await page.locator("[data-bs-target='#mobileMenu']").click();
    await page.locator("#mobileMenu").getByRole("link", { name: /Contact/ }).click();
  } else {
    await page.getByRole("link", { name: "Start a project" }).click();
  }
  await expect(page).toHaveURL(/contact\.html$/);
  await page.waitForFunction(() => (window.dataLayer || []).some((entry) => {
    const command = Array.from(entry);
    return command[0] === "event" && command[1] === "page_view" && command[2].page_path === "/contact.html";
  }));

  const result = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      configs: commands.filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").map((command) => command[2].page_path),
      clarityScripts: document.querySelectorAll("script[data-portfolio-clarity]").length
    };
  });
  expect(result).toEqual({ configs: 1, pageViews: ["/", "/contact.html"], clarityScripts: 1 });
  expect(requests.filter((url) => url.includes("googletagmanager.com/gtag/js"))).toHaveLength(1);
  expect(requests.filter((url) => url.includes("clarity.ms/tag/"))).toHaveLength(1);
  expect(pageErrors).toEqual([]);
});

test("discloses Clarity and the shared opt-in in the privacy policy and banner", async ({ page }) => {
  await page.goto("/privacy.html");
  await expect(page.locator("[data-analytics-consent]")).toContainText("Google Analytics measures page views and key contact actions. Microsoft Clarity helps understand how visitors use the site. Neither loads until you choose to allow analytics.");
  await expect(page.getByRole("link", { name: "Microsoft Privacy Statement" })).toHaveAttribute("href", "https://privacy.microsoft.com/privacystatement");
  await expect(page.locator("[data-i18n-text='0:privacy.text.0016']")).toContainText("Microsoft Clarity");
  await expect(page.locator("script[src*='clarity.ms'], script[src*='googletagmanager.com']")).toHaveCount(0);
});