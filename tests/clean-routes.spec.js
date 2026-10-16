const { test, expect } = require("@playwright/test");

const cleanPages = [
  ["about", "About Umair Shaikh"],
  ["projects", "Web Development Projects"],
  ["case-studies", "Web Development Case Studies"],
  ["services", "Remote Freelance Web Developer"],
  ["skills", "Full Stack Developer Skills"],
  ["experience", "Full Stack Web Development Experience"],
  ["contact", "Contact Umair Shaikh"],
  ["privacy", "Privacy Policy"]
];

test("serves all clean page routes with clean canonicals", async ({ request }) => {
  for (const [route, title] of cleanPages) {
    const response = await request.get(`/${route}`);
    expect(response.ok(), `/${route} should respond successfully`).toBe(true);
    const html = await response.text();
    expect(html).toContain(`<title>${title}`);
    expect(html).toContain(`rel="canonical" href="https://umair-builds.in/${route}"`);
  }
});

test("redirects legacy page URLs to clean routes", async ({ request }) => {
  const response = await request.get("/projects.html?source=legacy", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe("/projects?source=legacy");
});

test("redirects the legacy homepage URL to the root", async ({ request }) => {
  const response = await request.get("/index.html?source=legacy", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe("/?source=legacy");
});
