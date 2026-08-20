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
  const projectData = require(path.join(root, "data", "projects.js"));
  const context = {
    URL,
    window: {
      Portfolio: {
        projectData,
        utils: { escapeHtml, slugify }
      }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/projects.js"), "utf8"), context);
  return context.window.Portfolio;
}

function fillTemplate(template, values) {
  return Object.entries(values).reduce((html, [token, value]) => html.split(token).join(value), template);
}

function renderProjects(template, projects, renderer, options = {}) {
  return projects.map((project, index) => renderer(template, project, index, {
    priority: Boolean(options.archive && index === 0)
  })).join("\n");
}

function renderProjectSchema(projects) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://umair-builds.in/" },
          { "@type": "ListItem", position: 2, name: "Projects", item: "https://umair-builds.in/projects.html" }
        ]
      },
      {
        "@type": "ItemList",
        name: "Umair Shaikh Portfolio Projects",
        numberOfItems: projects.length,
        itemListElement: projects.map((project, index) => {
          const item = {
            "@type": "CreativeWork",
            position: index + 1,
            name: project.title,
            description: project.description
          };
          if (project.status.value === "LIVE") item.url = project.url;
          if (project.media && project.media.desktop && project.media.desktop.webp960) {
            item.image = `https://umair-builds.in/${project.media.desktop.webp960}`;
          }
          return item;
        })
      }
    ]
  });
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
  if (html.includes("data-projects-grid")) {
    const projectLimit = Number((html.match(/data-project-limit="(\d+)"/) || [])[1] || data.projectData.length);
    const featuredOnly = /data-projects-featured/.test(html);
    const selected = data.projectData.slice()
      .sort((a, b) => (Number(a.featuredRank) || Number.MAX_SAFE_INTEGER) - (Number(b.featuredRank) || Number.MAX_SAFE_INTEGER))
      .filter((project) => !featuredOnly || Number(project.featuredRank) > 0)
      .slice(0, projectLimit);
    const cards = renderProjects(components["project-card"], selected, data.Projects.renderProjectCard, { archive: !featuredOnly });
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
  if (/data-project-schema/.test(html)) {
    html = html.replace(/(<script type="application\/ld\+json" data-project-schema>)[\s\S]*?(<\/script>)/, `$1${renderProjectSchema(data.projectData)}$2`);
  }
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
