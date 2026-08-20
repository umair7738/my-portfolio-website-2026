const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { baseUrl, pages, sitemapPages, pageUrl } = require("./site-config");

const root = process.cwd();
const dist = path.join(root, "dist");
const legacyHost = ["umair-shaikh-portfolio", "webdeveloper15235", "chatgpt", "site"].join(".");
const previousPortfolioHost = ["umair7738portfolio", "free", "nf"].join(".");
const errors = [];
const namespaces = {
  "index.html": "home", "about.html": "about", "projects.html": "projects",
  "case-studies.html": "case-studies", "services.html": "services", "skills.html": "skills",
  "experience.html": "experience", "contact.html": "contact", "privacy.html": "privacy"
};

function read(file) {
  const target = path.join(dist, file);
  if (!fs.existsSync(target)) {
    errors.push(`dist: missing ${file}`);
    return "";
  }
  return fs.readFileSync(target, "utf8");
}

function count(html, pattern) {
  return (html.match(pattern) || []).length;
}

Object.entries(namespaces).forEach(([file, namespace]) => {
  const html = read(file);
  if (count(html, /data-barba="wrapper"/g) !== 1) errors.push(`${file}: expected one Barba wrapper`);
  if (count(html, /data-barba="container"/g) !== 1) errors.push(`${file}: expected one Barba container`);
  if (!html.includes(`data-barba-namespace="${namespace}"`)) errors.push(`${file}: missing namespace ${namespace}`);
  if (!html.includes(`<link rel="canonical" href="${pageUrl(file)}">`)) errors.push(`${file}: incorrect canonical`);
  if (!html.includes(`<meta property="og:url" content="${pageUrl(file)}">`)) errors.push(`${file}: incorrect OG URL`);
  if (!/<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">/i.test(html)) errors.push(`${file}: incorrect robots metadata`);
  ["description", "twitter:card", "twitter:title", "twitter:description", "twitter:image"].forEach((name) => {
    if (!new RegExp(`<meta\\s+name="${name}"[^>]*>`, "i").test(html)) errors.push(`${file}: missing ${name}`);
  });
  ["og:type", "og:title", "og:description", "og:image", "og:image:alt", "og:image:width", "og:image:height"].forEach((property) => {
    if (!new RegExp(`<meta\\s+property="${property}"[^>]*>`, "i").test(html)) errors.push(`${file}: missing ${property}`);
  });
  if (count(html, /<h1\b/gi) !== 1) errors.push(`${file}: must contain exactly one h1`);
  if (!/<header class="site-header"/i.test(html) || !/<nav class="navbar-shell"/i.test(html)) errors.push(`${file}: primary navigation is not static HTML`);
  if (!/<footer class="site-footer"/i.test(html)) errors.push(`${file}: footer is not static HTML`);
  if (/data-component=/.test(html)) errors.push(`${file}: unresolved runtime component placeholder`);
  if (!/portfolio\.min\.css\?v=[a-f0-9]{12}/.test(html)) errors.push(`${file}: missing hashed CSS asset reference`);
  if (!/portfolio\.min\.js\?v=[a-f0-9]{12}/.test(html)) errors.push(`${file}: missing hashed JS asset reference`);
  if (/emailjs\/browser@4\/dist\/email\.min\.js/.test(html)) errors.push(`${file}: EmailJS must be lazy-loaded by contact.js, not in page HTML`);
  if (html.includes(legacyHost) || html.includes(previousPortfolioHost)) errors.push(`${file}: stale or unverified domain reference`);
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[1])) errors.push(`${file}: image missing alt`);
    if (!/\bwidth="\d+"/i.test(match[1]) || !/\bheight="\d+"/i.test(match[1])) errors.push(`${file}: image missing explicit dimensions`);
    if (!/\bdecoding="async"/i.test(match[1])) errors.push(`${file}: image missing async decoding`);
  }
  for (const match of html.matchAll(/<i\b([^>]*\bdata-lucide="[^"]+"[^>]*)>/gi)) {
    if (!/\baria-hidden="true"/i.test(match[1])) errors.push(`${file}: decorative Lucide icon is exposed to assistive technology`);
  }
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(match[1]);
      if (/"item":"(?:index|about|projects|case-studies|services|skills|experience|contact|privacy)\.html"/.test(JSON.stringify(json))) errors.push(`${file}: relative breadcrumb in JSON-LD`);
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
});

const home = read("index.html");
const projects = read("projects.html");
const services = read("services.html");
const contact = read("contact.html");
if (count(home, /<article class="project-card/g) !== 4) errors.push("index.html: expected four static featured project cards");
if (count(projects, /<article class="project-card/g) !== 7) errors.push("projects.html: expected seven static project cards");
if (count(services, /<article class="service-card/g) !== 18) errors.push("services.html: expected eighteen static service cards");
if (!/<form class="contact-form"/i.test(contact)) errors.push("contact.html: contact form is not static HTML");
if (!contact.includes("mailto:umairshaikh7738@gmail.com") || !contact.includes("tel:+917738635355")) errors.push("contact.html: static contact details are incomplete");
if (!home.includes('data-counter="7">7<') || !home.includes('data-counter="18">18<') || !home.includes('data-counter="2">2<') || !home.includes('data-counter="3">3<')) errors.push("index.html: counters do not expose truthful initial values");

const notFound = read("404.html");
if (!/<meta name="robots" content="noindex, follow">/i.test(notFound)) errors.push("404.html: must remain noindex, follow");
if (notFound.includes("data-barba") || notFound.includes("barba-2.10.3")) errors.push("404.html: must remain standalone");

const robots = read("robots.txt");
if (!robots.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) errors.push("dist/robots.txt: wrong sitemap hostname");
const sitemap = read("sitemap.xml");
sitemapPages.forEach((file) => { if (!sitemap.includes(`<loc>${pageUrl(file)}</loc>`)) errors.push(`dist/sitemap.xml: missing ${pageUrl(file)}`); });
if (sitemap.includes("privacy.html") || sitemap.includes("404.html")) errors.push("dist/sitemap.xml: includes a low-value or non-indexable page");

[".htaccess", "assets/vendor/barba-2.10.3.umd.js", "assets/js/portfolio.min.js", "assets/css/portfolio.min.css"].forEach((file) => {
  if (!fs.existsSync(path.join(dist, file))) errors.push(`dist: missing ${file}`);
});

const bundle = read("assets/js/portfolio.min.js");
if (!bundle.includes("EmailJS could not be loaded")) errors.push("dist bundle: lazy EmailJS loader is missing");
const css = read("assets/css/portfolio.min.css");
if (!/\.page-loader\{display:none;?\}/.test(css) || !css.includes("loader-failsafe") || !css.includes("motion-failsafe")) errors.push("dist CSS: progressive loader or motion fail-safe is missing");
if (!css.includes("html:not(.js) .desktop-nav{display:flex")) errors.push("dist CSS: JavaScript-free mobile navigation fallback is missing");
if (css.includes("body.loading{overflow:hidden}")) errors.push("dist CSS: loader can still permanently lock page scrolling");
const nodeCheck = spawnSync(process.execPath, ["--check", path.join(dist, "assets/js/portfolio.min.js")], { encoding: "utf8" });
if (nodeCheck.status !== 0) errors.push(`dist/assets/js/portfolio.min.js: ${nodeCheck.stderr.trim()}`);

if (errors.length) {
  console.error("Distribution validation failed:\n- " + errors.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Validated ${Object.keys(namespaces).length} composed pages, static content, metadata, schema, assets, robots, sitemap, and standalone 404.`);
}
