const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const dist = path.join(root, "dist");
const pages = {
  "index.html": "home",
  "about.html": "about",
  "projects.html": "projects",
  "case-studies.html": "case-studies",
  "services.html": "services",
  "skills.html": "skills",
  "experience.html": "experience",
  "contact.html": "contact",
  "privacy.html": "privacy"
};
const errors = [];

function read(file) {
  const target = path.join(dist, file);
  if (!fs.existsSync(target)) {
    errors.push(`dist: missing ${file}`);
    return "";
  }
  return fs.readFileSync(target, "utf8");
}

Object.entries(pages).forEach(function ([file, namespace]) {
  const html = read(file);
  if ((html.match(/data-barba="wrapper"/g) || []).length !== 1) errors.push(`${file}: expected one Barba wrapper`);
  if ((html.match(/data-barba="container"/g) || []).length !== 1) errors.push(`${file}: expected one Barba container`);
  if (!html.includes(`data-barba-namespace="${namespace}"`)) errors.push(`${file}: missing namespace ${namespace}`);
  const barbaIndex = html.indexOf("barba-2.10.3.umd.js");
  const bundleIndex = html.indexOf("portfolio.min.js");
  if (barbaIndex < 0 || bundleIndex < 0 || barbaIndex > bundleIndex) errors.push(`${file}: Barba must load before portfolio.min.js`);
  if (!/portfolio\.min\.css\?v=[a-f0-9]{12}/.test(html)) errors.push(`${file}: missing hashed CSS asset reference`);
  if (!/portfolio\.min\.js\?v=[a-f0-9]{12}/.test(html)) errors.push(`${file}: missing hashed JS asset reference`);
});

const notFound = read("404.html");
if (notFound.includes("data-barba") || notFound.includes("barba-2.10.3")) errors.push("404.html: must remain standalone");

[
  "assets/vendor/barba-2.10.3.umd.js",
  "assets/js/portfolio.min.js",
  "assets/css/portfolio.min.css",
  "components/navbar.html"
].forEach(function (file) { if (!fs.existsSync(path.join(dist, file))) errors.push(`dist: missing ${file}`); });

const vercelFile = path.join(root, "vercel.json");
if (fs.existsSync(vercelFile)) {
  const vercel = JSON.parse(fs.readFileSync(vercelFile, "utf8"));
  if (vercel.buildCommand !== "npm run build") errors.push("vercel.json: buildCommand must be npm run build");
  if (vercel.outputDirectory !== "dist") errors.push("vercel.json: outputDirectory must be dist");
  if (vercel.cleanUrls !== true) errors.push("vercel.json: cleanUrls must remain enabled");
  if (vercel.rewrites) errors.push("vercel.json: rewrites must be absent with cleanUrls enabled");
}

const nodeCheck = spawnSync(process.execPath, ["--check", path.join(dist, "assets/js/portfolio.min.js")], { encoding: "utf8" });
if (nodeCheck.status !== 0) errors.push(`dist/assets/js/portfolio.min.js: ${nodeCheck.stderr.trim()}`);

if (errors.length) {
  console.error("Distribution validation failed:\n- " + errors.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Validated ${Object.keys(pages).length} Barba pages, standalone 404, Vercel config, and production assets.`);
}
