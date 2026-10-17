const { test, expect } = require("@playwright/test");

async function openContactForm(page, consent) {
  await page.addInitScript((analyticsConsent) => {
    window.localStorage.setItem("portfolio-analytics-consent", analyticsConsent);
    window.__emailJsSendCount = 0;
    window.emailjs = {
      init() {},
      async sendForm() {
        window.__emailJsSendCount += 1;
      }
    };
  }, consent);
  await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
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
    leadEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "generate_lead"),
    legacyEvents: window.__analyticsEvents.filter((entry) => entry[0] === "event" && entry[1] === "contact_form_submit")
  }));
  expect(result.sendCount).toBe(services.length);
  expect(result.leadEvents).toHaveLength(services.length);
  expect(result.legacyEvents).toHaveLength(0);
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
