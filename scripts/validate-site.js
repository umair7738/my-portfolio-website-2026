const fs = require("fs");
const path = require("path");
const { baseUrl, pages, sitemapPages, pageUrl } = require("./site-config");
const projectData = require(path.join(process.cwd(), "data", "projects.js"));
const projectAudit = require(path.join(process.cwd(), "data", "project-audit.json"));

const root = process.cwd();
const legacyHost = ["umair-shaikh-portfolio", "webdeveloper15235", "chatgpt", "site"].join(".");
const previousPortfolioHost = ["umair7738portfolio", "free", "nf"].join(".");
const htmlFiles = [...Object.keys(pages), "404.html"];
const errors = [];
const warnings = [];
const barbaPages = {
  "index.html": "home", "about.html": "about", "projects.html": "projects",
  "case-studies.html": "case-studies", "services.html": "services", "skills.html": "skills",
  "experience.html": "experience", "contact.html": "contact", "privacy.html": "privacy"
};

const allowedProjectCategories = new Set(["education", "commerce", "creative", "corporate", "industrial", "campaign"]);
const allowedProjectStatuses = new Set(["LIVE", "ARCHIVED", "UNAVAILABLE"]);

if (projectData.length !== 17) errors.push(`project data: expected 17 projects, found ${projectData.length}`);
const projectSlugs = projectData.map((project) => project.slug);
if (new Set(projectSlugs).size !== projectSlugs.length) errors.push("project data: slugs must be unique");
const featuredRanks = projectData.filter((project) => project.featuredRank).map((project) => project.featuredRank).sort();
if (JSON.stringify(featuredRanks) !== JSON.stringify([1, 2, 3, 4])) errors.push("project data: featured ranks must be exactly 1, 2, 3, and 4");
projectData.forEach((project) => {
  if (!allowedProjectCategories.has(project.category)) errors.push(`${project.slug}: invalid project category ${project.category}`);
  if (!project.status || !allowedProjectStatuses.has(project.status.value)) errors.push(`${project.slug}: invalid project status`);
  if (!project.status.verifiedOn) errors.push(`${project.slug}: missing status verification date`);
  if (!project.description || !project.descriptionEvidence || !project.descriptionEvidence.length) errors.push(`${project.slug}: description is missing evidence`);
  (project.descriptionEvidence || []).forEach((reference) => {
    if (!projectAudit.evidence[reference]) errors.push(`${project.slug}: unknown description evidence ${reference}`);
  });
  const auditRecord = projectAudit.projects[project.slug];
  if (!auditRecord || auditRecord.auditRef !== project.auditRef) errors.push(`${project.slug}: missing or mismatched audit record`);
  if (!project.publicSiteAudit || project.publicSiteAudit.auditedOn !== projectAudit.auditedOn) errors.push(`${project.slug}: missing or incorrectly dated public-site audit`);
  const publishedAuditTechnologies = (project.publicSiteAudit && project.publicSiteAudit.technologies || []).map(({ name, confidence }) => ({ name, confidence }));
  const recordedAuditTechnologies = (auditRecord && auditRecord.observedTechnologies || []).map(({ name, confidence }) => ({ name, confidence }));
  if (JSON.stringify(publishedAuditTechnologies) !== JSON.stringify(recordedAuditTechnologies)) errors.push(`${project.slug}: published public-site audit does not match the reviewed audit record`);
  publishedAuditTechnologies.forEach((technology) => {
    if (!technology.name || !["HIGH", "MEDIUM"].includes(technology.confidence)) errors.push(`${project.slug}: invalid public-site audit technology`);
  });
  if (!publishedAuditTechnologies.length && (!project.publicSiteAudit || !project.publicSiteAudit.note)) errors.push(`${project.slug}: empty public-site audit requires an explanatory note`);
  (project.deliveryTechnologies || []).forEach((technology) => {
    if (technology.confidence !== "HIGH") errors.push(`${project.slug}: public delivery technology ${technology.name} is not HIGH confidence`);
    if (!technology.evidenceRefs || !technology.evidenceRefs.length) errors.push(`${project.slug}: public delivery technology ${technology.name} is missing evidence`);
    (technology.evidenceRefs || []).forEach((reference) => {
      if (!projectAudit.evidence[reference]) errors.push(`${project.slug}: unknown technology evidence ${reference}`);
    });
  });
  if (!project.media || !project.media.desktop || !project.media.desktop.webp960) errors.push(`${project.slug}: incomplete project media`);
  else {
    [project.media.desktop.webp960, project.media.desktop.webp1440, project.media.desktop.avif960, project.media.desktop.avif1440,
      project.media.mobile && project.media.mobile.webp, project.media.mobile && project.media.mobile.avif]
      .filter(Boolean).forEach((file) => { if (!fs.existsSync(path.join(root, file))) errors.push(`${project.slug}: missing project asset ${file}`); });
  }
});
if (projectData.find((project) => project.slug === "bride-is-pride").status.value !== "ARCHIVED") errors.push("Bride Is Pride must remain ARCHIVED");
if (projectData.find((project) => project.slug === "equity-exchange-academy").status.value !== "ARCHIVED") errors.push("Equity Exchange Academy must remain ARCHIVED");

function localTargetExists(file, target) {
  if (!target || target === "/" || /^(?:https?:|mailto:|tel:|#|javascript:|data:)/i.test(target)) return true;
  const clean = target.split("#")[0].split("?")[0];
  return !clean || fs.existsSync(path.resolve(path.dirname(path.join(root, file)), clean));
}

function hasTag(html, pattern, label, file) {
  if (!pattern.test(html)) errors.push(`${file}: missing or incorrect ${label}`);
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${file}: expected one h1, found ${h1Count}`);
  if (!/<main\b/i.test(html)) errors.push(`${file}: missing main landmark`);
  if (file !== "404.html" && !/class="skip-link"/i.test(html)) errors.push(`${file}: missing skip link`);

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[1])) errors.push(`${file}: image missing alt`);
    if (!/\bwidth="\d+"/i.test(match[1]) || !/\bheight="\d+"/i.test(match[1])) warnings.push(`${file}: image missing explicit dimensions`);
  }
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    if (!localTargetExists(file, match[1])) errors.push(`${file}: missing local target ${match[1]}`);
  }
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(match[1]);
      if (JSON.stringify(json).includes('"item":"index.html"')) errors.push(`${file}: relative breadcrumb URL in JSON-LD`);
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }

  if (pages[file]) {
    const metadata = pages[file];
    hasTag(html, new RegExp(`<title>${metadata.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/title>`), "title", file);
    hasTag(html, new RegExp(`<link rel="canonical" href="${pageUrl(file).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">`), "self-canonical", file);
    ["description", "robots", "twitter:card", "twitter:title", "twitter:description", "twitter:image"].forEach((name) => {
      hasTag(html, new RegExp(`<meta\\s+name="${name}"[^>]*>`, "i"), `${name} metadata`, file);
    });
    ["og:type", "og:title", "og:description", "og:url", "og:image", "og:image:alt", "og:image:width", "og:image:height"].forEach((property) => {
      hasTag(html, new RegExp(`<meta\\s+property="${property}"[^>]*>`, "i"), `${property} metadata`, file);
    });
    if (/<meta\s+name="keywords"/i.test(html)) errors.push(`${file}: obsolete meta keywords must be absent`);
    if (!/application\/ld\+json/i.test(html)) errors.push(`${file}: missing JSON-LD`);
  }

  if (barbaPages[file]) {
    if ((html.match(/data-barba="wrapper"/g) || []).length !== 1) errors.push(`${file}: expected exactly one Barba wrapper`);
    if ((html.match(/data-barba="container"/g) || []).length !== 1) errors.push(`${file}: expected exactly one Barba container`);
    if (!html.includes(`data-barba-namespace="${barbaPages[file]}"`)) errors.push(`${file}: missing Barba namespace ${barbaPages[file]}`);
    if (!/portfolio\.min\.css\?v=[a-f0-9]{12}/.test(html)) errors.push(`${file}: missing content-hashed CSS reference`);
    if (!/portfolio\.min\.js\?v=[a-f0-9]{12}/.test(html)) errors.push(`${file}: missing content-hashed JS reference`);
  }
}

const notFound = fs.readFileSync(path.join(root, "404.html"), "utf8");
if (!/<meta name="robots" content="noindex, follow">/i.test(notFound)) errors.push("404.html: must be noindex, follow");
if (notFound.includes("data-barba") || notFound.includes("barba-2.10.3")) errors.push("404.html: must remain standalone without Barba");

const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (/rel="preload"[^>]+project-/i.test(home)) errors.push("index.html: below-the-fold project image must not be preloaded");
[
  ['data-counter="17">17<', "project count"], ['data-counter="18">18<', "service count"],
  ['data-counter="2">2<', "database count"], ['data-counter="3">3<', "payment count"]
].forEach(([needle, label]) => { if (!home.includes(needle)) errors.push(`index.html: inaccurate initial ${label}`); });

const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
if (robots !== `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`) errors.push("robots.txt: production policy or sitemap URL is incorrect");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
sitemapPages.forEach((file) => { if (!sitemap.includes(`<loc>${pageUrl(file)}</loc>`)) errors.push(`sitemap.xml: missing ${pageUrl(file)}`); });
if (sitemap.includes("privacy.html") || sitemap.includes("404.html")) errors.push("sitemap.xml: privacy or 404 URL must be excluded");

const scanFiles = ["README.md", "robots.txt", "sitemap.xml", ...htmlFiles,
  ...fs.readdirSync(path.join(root, "scripts")).map((file) => `scripts/${file}`),
  ...fs.readdirSync(path.join(root, "components")).map((file) => `components/${file}`),
  ...fs.readdirSync(path.join(root, "assets/js")).filter((file) => !file.includes("vendor")).map((file) => `assets/js/${file}`)];
scanFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  if (content.includes(legacyHost)) errors.push(`${file}: contains old production hostname`);
  if (content.includes(previousPortfolioHost)) errors.push(`${file}: contains unverified previous portfolio URL`);
});

const required = [
  ".htaccess", "robots.txt", "sitemap.xml", "README.md", "scripts/site-config.js",
  "assets/css/portfolio.min.css", "assets/js/portfolio.min.js", "assets/vendor/jquery-3.7.1.min.js",
  "assets/vendor/bootstrap-5.3.8.min.css", "assets/vendor/bootstrap-5.3.8.bundle.min.js",
  "assets/vendor/gsap-3.13.0.min.js", "assets/vendor/ScrollTrigger-3.13.0.min.js",
  "assets/vendor/lenis-1.3.11.min.js", "assets/vendor/lucide-0.468.0.min.js",
  "assets/vendor/barba-2.10.3.umd.js", "assets/images/og-portfolio.webp", "assets/icons/favicon.png",
  "assets/umair_resume_june_2026.pdf", "data/projects.js", "data/project-audit.json"
];
required.forEach((target) => { if (!fs.existsSync(path.join(root, target))) errors.push(`missing required file ${target}`); });

if (warnings.length) console.log("Warnings:\n- " + warnings.join("\n- "));
if (errors.length) {
  console.error("Source validation failed:\n- " + errors.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} source pages, canonical metadata, schema URLs, sitemap, robots, claims, and production assets.`);
}
