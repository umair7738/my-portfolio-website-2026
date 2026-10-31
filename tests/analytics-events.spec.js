const { test, expect } = require("@playwright/test");

async function openWithConsent(page, path) {
  await page.addInitScript(() => localStorage.setItem("portfolio-analytics-consent", "granted"));
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.__analyticsEvents = [];
    window.gtag = function () { window.__analyticsEvents.push(Array.from(arguments)); };
  });
}

async function trackedEvent(page, selector) {
  await page.locator(selector).first().evaluate((element) => {
    const href = element.getAttribute("href");
    element.removeAttribute("href");
    element.click();
    if (href) element.setAttribute("href", href);
  });
  return page.evaluate(() => window.__analyticsEvents.find((entry) => entry[0] === "event" && entry[1] !== "page_view"));
}

test("classifies outbound, service, and project interactions with safe parameters", async ({ page }) => {
  await openWithConsent(page, "/");
  const profile = await trackedEvent(page, "[data-analytics-event='profile_download']");
  expect(profile).toEqual(["event", "profile_download", { page_path: "/", audience: "recruiter", link_location: "hero" }]);

  await openWithConsent(page, "/services.html");
  const service = await trackedEvent(page, "[data-analytics-event='service_cta_click']");
  expect(service[1]).toBe("service_cta_click");
  expect(service[2]).toMatchObject({ page_path: "/services.html", link_location: "service_card" });
  expect(service[2].service_slug).toMatch(/^[a-z0-9-]+$/);

  await openWithConsent(page, "/contact.html");
  const recruiterContact = await trackedEvent(page, "[data-analytics-event='recruiter_contact_click']");
  expect(recruiterContact).toEqual(["event", "recruiter_contact_click", {
    page_path: "/contact.html", audience: "recruiter", contact_method: "email", link_location: "contact_page"
  }]);

  await openWithConsent(page, "/projects.html");
  await expect(page.locator(".project-card [data-analytics-event='project_view']").first()).toBeVisible();
  const project = await trackedEvent(page, ".project-card [data-analytics-event='project_view']");
  expect(project[1]).toBe("project_view");
  expect(project[2]).toMatchObject({ page_path: "/projects.html", link_location: "project_card" });
  expect(project[2].project_slug).toMatch(/^[a-z0-9-]+$/);

  [profile, service, recruiterContact, project].forEach((entry) => {
    expect(JSON.stringify(entry[2])).not.toMatch(/@|Test Visitor|\+91|message/i);
  });
});
