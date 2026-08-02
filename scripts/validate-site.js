const fs = require("fs");
const path = require("path");

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
const errors = [];
const warnings = [];

function localTargetExists(file, target) {
  if (!target || /^(?:https?:|mailto:|tel:|#|javascript:|data:)/i.test(target)) return true;
  const clean = target.split("#")[0].split("?")[0];
  if (!clean) return true;
  return fs.existsSync(path.resolve(path.dirname(path.join(root, file)), clean));
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${file}: expected one h1, found ${h1Count}`);
  if (file !== "404.html" && !/<main\b/i.test(html)) errors.push(`${file}: missing main landmark`);
  if (file !== "404.html" && !/class="skip-link"/i.test(html)) errors.push(`${file}: missing skip link`);
  if (file !== "404.html" && !/<meta\s+name="description"/i.test(html)) errors.push(`${file}: missing meta description`);
  if (file !== "404.html" && !/<link\s+rel="canonical"/i.test(html)) errors.push(`${file}: missing canonical link`);
  if (file !== "404.html" && !/application\/ld\+json/i.test(html)) errors.push(`${file}: missing JSON-LD`);

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[1])) errors.push(`${file}: image missing alt`);
    if (!/\bwidth="\d+"/i.test(match[1]) || !/\bheight="\d+"/i.test(match[1])) warnings.push(`${file}: image missing explicit dimensions`);
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    if (!localTargetExists(file, match[1])) errors.push(`${file}: missing local target ${match[1]}`);
  }

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }
}

for (const component of fs.readdirSync(path.join(root, "components")).filter((file) => file.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(root, "components", component), "utf8");
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[1])) errors.push(`components/${component}: image missing alt`);
  }
}

const required = ["robots.txt", "sitemap.xml", "README.md", "assets/css/portfolio.min.css", "assets/js/portfolio.min.js", "assets/images/og-portfolio.webp", "assets/icons/favicon.png", "assets/Umair-Shaikh-Resume.pdf"];
required.forEach((target) => { if (!fs.existsSync(path.join(root, target))) errors.push(`missing required file ${target}`); });

if (warnings.length) console.log("Warnings:\n- " + warnings.join("\n- "));
if (errors.length) {
  console.error("Errors:\n- " + errors.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} pages and ${required.length} required production assets.`);
}
