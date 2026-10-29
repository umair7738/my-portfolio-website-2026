const fs = require("fs");
const path = require("path");

const catalogPath = path.join("assets", "i18n", "en.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const projects = require("../data/projects.js");
const services = require("../data/services.js");
const slugify = (value) => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ui = {
  "ui.project.status.LIVE": "Live",
  "ui.project.status.ARCHIVED": "Archived",
  "ui.project.status.UNAVAILABLE": "Unavailable",
  "ui.project.technologies": "Project technologies",
  "ui.project.liveSite": "Live site",
  "ui.project.unavailable": "Currently unavailable",
  "ui.project.caseStudy": "Case study",
  "ui.project.featured": "Featured",
  "ui.project.resultOne": "{count} project",
  "ui.project.resultMany": "{count} projects",
  "ui.service.discuss": "Discuss this service",
  "ui.form.invalid": "Please review the highlighted fields.",
  "ui.form.unconfigured": "Email delivery is not configured yet. Please contact me directly by email.",
  "ui.form.sending": "Sending your enquiry…",
  "ui.form.success": "Thanks — your enquiry has been sent. I’ll get back to you soon.",
  "ui.form.failure": "The enquiry could not be sent. Please email me directly instead.",
  "ui.loader.loading": "Loading interface",
  "ui.loader.motion": "Composing motion",
  "ui.loader.polishing": "Polishing details",
  "ui.loader.ready": "Experience ready",
  "ui.navigation.backProgress": "Back to top — {progress}% page progress"
  ,"ui.language.choose": "Choose language"
  ,"ui.language.dialog": "Choose website language"
  ,"ui.language.search": "Search country or language"
  ,"ui.language.notReady": "Not ready"
  ,"ui.language.savedError": "Saved language could not be loaded. English is shown."
};
Object.assign(catalog, ui);

projects.forEach((project) => {
  const prefix = "project." + project.slug + ".";
  const status = project.status.value;
  const detailItems = [project.typeLabel, project.role, project.year].filter(Boolean);
  const primary = project.caseStudy ? "Read " + project.title + " case study" : status === "LIVE" && project.url ? "View " + project.title + " website" : null;
  catalog[prefix + "mediaDisclosure"] = project.media.kind === "ARCHIVE_TREATMENT" ? "Archive visual · live snapshot unavailable" : "Current site snapshot · " + project.media.capturedOn;
  catalog[prefix + "categoryType"] = project.categoryLabel + " · " + project.typeLabel;
  catalog[prefix + "description"] = project.description;
  catalog[prefix + "alt"] = project.media.alt;
  if (detailItems.length) catalog[prefix + "detailLine"] = detailItems.join(" · ");
  if (primary) catalog[prefix + "primaryAria"] = primary;
  else catalog[prefix + "archiveAria"] = project.title + " archived project visual";
});

services.forEach((service) => {
  const prefix = "service." + slugify(service.title) + ".";
  catalog[prefix + "title"] = service.title;
  catalog[prefix + "description"] = service.description;
  service.items.forEach((item, index) => { catalog[prefix + "item." + index] = item; });
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log("English translation catalog: " + Object.keys(catalog).length + " keys");
