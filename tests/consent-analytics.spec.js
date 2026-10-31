const { test, expect } = require("@playwright/test");

async function blockAndTrackAnalytics(page) {
  const requests = [];
  page.on("request", (request) => {
    if (/googletagmanager\.com/.test(request.url())) requests.push(request.url());
  });
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
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
  await expect(page.locator("script[src*='googletagmanager.com']")).toHaveCount(0);
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(banner).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-analytics-consent"))).toBe("denied");
  await page.reload();
  await expect(page.locator("[data-analytics-consent]")).toBeHidden();
  await expect(page.locator("script[src*='googletagmanager.com']")).toHaveCount(0);

  expect(requests).toHaveLength(0);
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

  await page.evaluate(() => document.querySelector("a[href='contact.html']").click());
  await expect(page).toHaveURL(/contact\.html$/);
  await page.waitForFunction(() => (window.dataLayer || []).some((entry) => {
    const command = Array.from(entry);
    return command[0] === "event" && command[1] === "page_view" && command[2].page_path === "/contact.html";
  }));

  const result = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      configs: commands.filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").map((command) => command[2].page_path)
    };
  });
  expect(result).toEqual({ configs: 1, pageViews: ["/", "/contact.html"] });
  expect(requests.filter((url) => url.includes("googletagmanager.com/gtag/js"))).toHaveLength(1);
  expect(pageErrors).toEqual([]);
});

test("withdraws and re-enables analytics without duplicate initialization or page views", async ({ page }) => {
  const requests = await blockAndTrackAnalytics(page);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Allow analytics" }).click();
  await waitForInitialPageView(page);
  await page.getByRole("button", { name: "Manage analytics preferences" }).click();
  await expect(page.locator("[data-analytics-preferences-panel]")).toBeVisible();
  await expect(page.getByRole("button", { name: "Turn off analytics" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-analytics-preferences-panel]")).toBeHidden();
  await expect(page.getByRole("button", { name: "Manage analytics preferences" })).toBeFocused();
  await page.getByRole("button", { name: "Manage analytics preferences" }).click();
  await page.getByRole("button", { name: "Turn off analytics" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("portfolio-analytics-consent"))).toBe("denied");

  const withdrawn = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").map((command) => command[2].page_path),
      googleDenied: commands.some((command) => command[0] === "consent" && command[1] === "update" && command[2].analytics_storage === "denied")
    };
  });
  expect(withdrawn).toEqual({ pageViews: ["/"], googleDenied: true });

  await page.evaluate(() => document.querySelector("a[href='contact.html']").click());
  await expect(page).toHaveURL(/contact\.html$/);
  await page.waitForTimeout(300);
  const deniedNavigation = await page.evaluate(() => {
    window.Portfolio.Analytics.trackEvent("profile_download");
    return (window.dataLayer || []).map((entry) => Array.from(entry)).filter((command) => command[0] === "event").map((command) => command[1]);
  });
  expect(deniedNavigation).toEqual(["page_view"]);

  await page.getByRole("button", { name: "Manage analytics preferences" }).click();
  await page.locator("[data-analytics-preferences-panel]").getByRole("button", { name: "Allow analytics" }).click();
  await page.waitForFunction(() => (window.dataLayer || []).some((entry) => {
    const command = Array.from(entry);
    return command[0] === "event" && command[1] === "page_view" && command[2].page_path === "/contact.html";
  }));
  const reenabled = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      configs: commands.filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").map((command) => command[2].page_path)
    };
  });
  expect(reenabled).toEqual({ configs: 1, pageViews: ["/", "/contact.html"] });

  await page.reload();
  await waitForInitialPageView(page);
  const reloaded = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      consent: localStorage.getItem("portfolio-analytics-consent"),
      configs: commands.filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").map((command) => command[2].page_path)
    };
  });
  expect(reloaded).toEqual({ consent: "granted", configs: 1, pageViews: ["/contact.html"] });

  await page.evaluate(() => document.querySelector("a[href='projects.html']").click());
  await expect(page).toHaveURL(/projects\.html$/);
  await page.waitForFunction(() => (window.dataLayer || []).some((entry) => {
    const command = Array.from(entry);
    return command[0] === "event" && command[1] === "page_view" && command[2].page_path === "/projects.html";
  }));
  const finalState = await page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry));
    return {
      configs: commands.filter((command) => command[0] === "config" && command[1] === "G-6J1PG2GSNQ").length,
      pageViews: commands.filter((command) => command[0] === "event" && command[1] === "page_view").map((command) => command[2].page_path)
    };
  });
  expect(finalState).toEqual({ configs: 1, pageViews: ["/contact.html", "/projects.html"] });
  expect(requests.filter((url) => url.includes("googletagmanager.com/gtag/js"))).toHaveLength(2);
  expect(pageErrors).toEqual([]);
});
