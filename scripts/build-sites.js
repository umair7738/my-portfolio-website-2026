const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = process.cwd();
const dist = path.join(root, "dist");
const htmlFiles = [
  "index.html", "about.html", "projects.html", "case-studies.html", "services.html",
  "skills.html", "experience.html", "contact.html", "privacy.html", "404.html"
];
const rootFiles = [...htmlFiles, "robots.txt", "sitemap.xml", ".htaccess"];

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[character]);
}

function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function loadContentData() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/projects.js"), "utf8"), context);
  return context.window.Portfolio;
}

function fillTemplate(template, values) {
  return Object.entries(values).reduce((html, [token, value]) => html.split(token).join(value), template);
}

function renderProjects(template, projects) {
  return projects.map((project, index) => fillTemplate(template, {
    "{{category}}": escapeHtml(project.category),
    "{{search}}": escapeHtml([project.title, project.description, project.tags.join(" "), project.categoryLabel].join(" ").toLowerCase()),
    "{{caseStudyUrl}}": escapeHtml(project.caseStudyUrl),
    "{{title}}": escapeHtml(project.title),
    "{{image}}": escapeHtml(project.image),
    "{{imageAlt}}": escapeHtml(project.imageAlt),
    "{{index}}": String(index + 1).padStart(2, "0"),
    "{{host}}": escapeHtml(project.host),
    "{{categoryLabel}}": escapeHtml(project.categoryLabel),
    "{{year}}": escapeHtml(project.year),
    "{{description}}": escapeHtml(project.description),
    "{{tags}}": project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join(""),
    "{{links}}": `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener">Live site <i data-lucide="external-link" aria-hidden="true"></i></a><a href="${escapeHtml(project.caseStudyUrl)}">Case study <i data-lucide="arrow-right" aria-hidden="true"></i></a>`
  })).join("\n");
}

function renderServices(template, services) {
  return services.map((service, index) => fillTemplate(template, {
    "{{icon}}": escapeHtml(service.icon),
    "{{number}}": String(index + 1).padStart(2, "0"),
    "{{title}}": escapeHtml(service.title),
    "{{description}}": escapeHtml(service.description),
    "{{items}}": service.items.map((item) => `<li>${escapeHtml(item)}</li>`).join(""),
    "{{slug}}": slugify(service.title)
  })).join("\n");
}

function composeHtml(source, data, components) {
  let html = source;
  const projectLimit = Number((html.match(/data-project-limit="(\d+)"/) || [])[1] || data.projectData.length);
  if (html.includes("data-projects-grid")) {
    const cards = renderProjects(components["project-card"], data.projectData.slice(0, projectLimit));
    html = html.replace(/<div data-component="project-card"><\/div>/g, "");
    html = html.replace(/(<div class="projects-grid"[^>]*>)[\s\S]*?(<\/div>)/, `$1${cards}$2`);
  }
  if (html.includes("data-services-grid")) {
    const cards = renderServices(components["service-card"], data.serviceData);
    html = html.replace(/<div data-component="service-card"><\/div>/g, "");
    html = html.replace(/(<div class="services-grid"[^>]*>)[\s\S]*?(<\/div>)/, `$1${cards}$2`);
  }
  html = html.replace(/<div data-component="([a-z0-9-]+)"><\/div>/g, (full, name) => components[name] || full);
  html = html.replace(/<i(\s+data-lucide="[^"]+")(?![^>]*\saria-hidden=)([^>]*)>/g, '<i$1 aria-hidden="true"$2>');
  html = html.replace(/<img\b(?![^>]*\sdecoding=)([^>]*)>/g, '<img decoding="async"$1>');
  html = html.replace(/<span data-current-year><\/span>/g, `<span data-current-year>${new Date().getFullYear()}</span>`);
  return html;
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const components = Object.fromEntries(fs.readdirSync(path.join(root, "components"))
  .filter((file) => file.endsWith(".html"))
  .map((file) => [path.basename(file, ".html"), fs.readFileSync(path.join(root, "components", file), "utf8").trim()]));
components["project-card"] = components["project-card"].replace(/^<template[^>]*>|<\/template>$/g, "").trim();
components["service-card"] = components["service-card"].replace(/^<template[^>]*>|<\/template>$/g, "").trim();
const data = loadContentData();

for (const file of rootFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  fs.writeFileSync(path.join(dist, file), file.endsWith(".html") ? composeHtml(source, data, components) : source);
}

fs.cpSync(path.join(root, "assets"), path.join(dist, "assets"), { recursive: true });

console.log(`Prepared ${htmlFiles.length} fully composed HTML pages in dist/.`);
