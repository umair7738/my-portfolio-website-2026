const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 45000,
  retries: 0,
  fullyParallel: true,
  workers: 2,
  globalSetup: require.resolve("./tests/global-setup.js"),
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "reduced-motion", use: { viewport: { width: 1024, height: 768 }, reducedMotion: "reduce" } }
  ]
});
