const { test, expect } = require("@playwright/test");

async function openContactForm(page, consent, failEmailJs = false) {
  await page.addInitScript(({ analyticsConsent, shouldFail }) => {
    window.localStorage.setItem("portfolio-analytics-consent", analyticsConsent);
    window.__emailJsSendCount = 0;
    window.emailjs = {
      init() {},
      async sendForm() {
        window.__emailJsSendCount += 1;
        if (shouldFail) throw new Error("Synthetic local EmailJS failure");
      }
    };
  }, { analyticsConsent: consent, shouldFail: failEmailJs });
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
  await page.route("https://www.clarity.ms/**", (route) => route.abort());
  await page.goto("/contact.html", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#contactForm")).toBeVisible();
  await page.evaluate(() => {
    window.__analyticsEvents = [];
    if (typeof window.gtag === "function") {
      window.gtag = function () {
        window.__analyticsEvents.push(Array.from(arguments));
      };
    }
  });
}

async function submitEnquiry(page, service) {
  await page.locator("#name").fill("Test Visitor");
  await page.locator("#email").fill("visitor@example.com");
  await page.locator("#projectType").selectOption({ label: service });
  await page.locator("#message").fill("This is a local test enquiry with enough detail.");
  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator(".form-status")).toHaveText("Thanks — your enquiry has been sent. I’ll get back to you soon.");
}

test("emits generate_lead once per successful EmailJS submission for every service", async ({ page }) => {
  await openContactForm(page, "granted");

  const services = await page.locator("#projectType option:not([disabled])").allTextContents();
  for (const service of services) {
    await submitEnquiry(page, service);
  }

  const result = await page.evaluate(() => ({
    sendCount: window.__emailJsSendCount,
    startEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "contact_form_start"),
    submitAttempts: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "contact_form_submit_attempt"),
    leadEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "generate_lead"),
    legacyEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "contact_form_submit")
  }));
  expect(result.sendCount).toBe(services.length);
  expect(result.startEvents).toHaveLength(1);
  expect(result.submitAttempts).toHaveLength(services.length);
  expect(result.leadEvents).toHaveLength(services.length);
  expect(result.legacyEvents).toHaveLength(0);
  result.leadEvents.forEach((entry) => {
    expect(Object.keys(entry[2]).sort()).toEqual(["page_path", "service_slug"]);
    expect(JSON.stringify(entry[2])).not.toContain("visitor@example.com");
    expect(JSON.stringify(entry[2])).not.toContain("Test Visitor");
  });
});

test("does not emit analytics when consent is denied", async ({ page }) => {
  await openContactForm(page, "denied");
  await submitEnquiry(page, "Business website");

  const result = await page.evaluate(() => ({
    sendCount: window.__emailJsSendCount,
    hasGtag: typeof window.gtag === "function",
    analyticsEvents: window.__analyticsEvents
  }));
  expect(result.sendCount).toBe(1);
  expect(result.hasGtag).toBe(false);
  expect(result.analyticsEvents).toHaveLength(0);
});

test("does not emit generate_lead when EmailJS submission fails", async ({ page }) => {
  await openContactForm(page, "granted", true);
  await page.locator("#name").fill("Test Visitor");
  await page.locator("#email").fill("visitor@example.com");
  await page.locator("#projectType").selectOption({ label: "Business website" });
  await page.locator("#message").fill("This is a local test enquiry with enough detail.");
  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator(".form-status")).toHaveText("The enquiry could not be sent. Please email me directly instead.");

  const result = await page.evaluate(() => ({
    sendCount: window.__emailJsSendCount,
    submitAttempts: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "contact_form_submit_attempt"),
    leadEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "generate_lead"),
    failedEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "contact_form_submit_failed")
  }));
  expect(result.sendCount).toBe(1);
  expect(result.submitAttempts).toHaveLength(1);
  expect(result.leadEvents).toHaveLength(0);
  expect(result.failedEvents).toEqual([["event", "contact_form_submit_failed", { page_path: "/contact.html", failure_stage: "delivery" }]]);
});
