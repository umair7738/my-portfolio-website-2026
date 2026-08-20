const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const { chromium } = require("@playwright/test");
const projects = require(path.join(process.cwd(), "data", "projects.js"));

const root = process.cwd();
const auditPath = path.join(root, "data", "project-audit.json");
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const slugArg = process.argv.find((argument) => argument.startsWith("--slug="));
const requestedSlug = slugArg ? slugArg.slice("--slug=".length) : null;
const includeManual = process.argv.includes("--include-manual");
const force = process.argv.includes("--force");

function checksum(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

async function optimize(rawDesktop, rawMobile, project) {
  const outputDir = path.join(root, "assets", "images", "projects", project.slug);
  fs.mkdirSync(outputDir, { recursive: true });
  const outputs = {
    desktopAvif960: path.join(outputDir, `${project.slug}-desktop-960.avif`),
    desktopAvif1440: path.join(outputDir, `${project.slug}-desktop-1440.avif`),
    desktopWebp960: path.join(outputDir, `${project.slug}-desktop-960.webp`),
    desktopWebp1440: path.join(outputDir, `${project.slug}-desktop-1440.webp`),
    mobileAvif780: path.join(outputDir, `${project.slug}-mobile-780.avif`),
    mobileWebp780: path.join(outputDir, `${project.slug}-mobile-780.webp`)
  };
  await Promise.all([
    sharp(rawDesktop).resize(960, 640, { fit: "cover", position: "top" }).avif({ quality: 58, effort: 4 }).toFile(outputs.desktopAvif960),
    sharp(rawDesktop).resize(1440, 960, { fit: "cover", position: "top" }).avif({ quality: 58, effort: 4 }).toFile(outputs.desktopAvif1440),
    sharp(rawDesktop).resize(960, 640, { fit: "cover", position: "top" }).webp({ quality: 80, effort: 5 }).toFile(outputs.desktopWebp960),
    sharp(rawDesktop).resize(1440, 960, { fit: "cover", position: "top" }).webp({ quality: 80, effort: 5 }).toFile(outputs.desktopWebp1440),
    sharp(rawMobile).resize(780, 1040, { fit: "cover", position: "top" }).avif({ quality: 58, effort: 4 }).toFile(outputs.mobileAvif780),
    sharp(rawMobile).resize(780, 1040, { fit: "cover", position: "top" }).webp({ quality: 80, effort: 5 }).toFile(outputs.mobileWebp780)
  ]);
  return Object.fromEntries(Object.entries(outputs).map(([name, file]) => [name, {
    file: path.relative(root, file).replace(/\\/g, "/"),
    bytes: fs.statSync(file).size,
    sha256: checksum(file)
  }]));
}

async function stablePage(context, project, rawFile) {
  const page = await context.newPage();
  const captureConfig = (audit.projects[project.slug] && audit.projects[project.slug].captureConfig) || {};
  const response = await page.goto(project.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (!response || response.status() >= 400) throw new Error(`HTTP ${response ? response.status() : "no response"}`);
  for (const selector of captureConfig.dismissSelectors || []) {
    const control = page.locator(selector).first();
    if (await control.isVisible({ timeout: 1500 }).catch(() => false)) await control.click({ timeout: 3000 }).catch(() => {});
  }
  if (captureConfig.readySelector) {
    await page.locator(captureConfig.readySelector).first().waitFor({ state: "visible", timeout: captureConfig.readyTimeoutMs || 15000 });
  }
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}html{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}" }).catch(() => {});
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; window.scrollTo(0, 0); }).catch(() => {});
  await page.waitForTimeout(captureConfig.waitAfterLoadMs || 1200);
  await page.screenshot({ path: rawFile, fullPage: false, animations: "disabled" });
  const result = { finalUrl: page.url(), title: await page.title() };
  await page.close();
  return result;
}

async function captureProject(browser, project) {
  const rawDir = path.join(root, "tmp", "project-snapshots", project.slug);
  fs.mkdirSync(rawDir, { recursive: true });
  const rawDesktop = path.join(rawDir, `${project.slug}-desktop.png`);
  const rawMobile = path.join(rawDir, `${project.slug}-mobile.png`);
  const shared = { ignoreHTTPSErrors: true, reducedMotion: "reduce", locale: "en-IN" };
  const desktopContext = await browser.newContext({ ...shared, viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const mobileContext = await browser.newContext({ ...shared, viewport: { width: 390, height: 520 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  try {
    const desktopResult = await stablePage(desktopContext, project, rawDesktop);
    await stablePage(mobileContext, project, rawMobile);
    const outputs = await optimize(rawDesktop, rawMobile, project);
    audit.projects[project.slug].capture = {
      capturedOn: new Date().toISOString().slice(0, 10),
      sourceUrl: project.url,
      finalUrl: desktopResult.finalUrl,
      pageTitle: desktopResult.title,
      desktopViewport: "1440x960@1",
      mobileViewport: "390x520@2",
      outputs
    };
    console.log(`Captured ${project.title}`);
  } finally {
    await desktopContext.close();
    await mobileContext.close();
  }
}

async function run() {
  const selected = projects.filter((project) => {
    if (requestedSlug && project.slug !== requestedSlug) return false;
    if (project.status.value !== "LIVE") return false;
    const record = audit.projects[project.slug];
    if (!force && record && record.capture && !requestedSlug) return false;
    return includeManual || !record || record.captureMode !== "manual-required";
  });
  if (!selected.length) throw new Error("No matching live projects to capture.");
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  try {
    for (const project of selected) {
      try { await captureProject(browser, project); }
      catch (error) {
        audit.projects[project.slug].captureError = { recordedOn: new Date().toISOString(), message: error.message };
        console.error(`Capture failed for ${project.title}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2) + "\n");
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
