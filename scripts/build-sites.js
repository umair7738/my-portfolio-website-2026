const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const rootFiles = [
  "index.html",
  "about.html",
  "projects.html",
  "case-studies.html",
  "services.html",
  "skills.html",
  "experience.html",
  "contact.html",
  "privacy.html",
  "404.html",
  "robots.txt",
  "sitemap.xml"
];

for (const file of rootFiles) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

["assets", "components"].forEach(folder => {
  fs.cpSync(
    path.join(root, folder),
    path.join(dist, folder),
    { recursive: true }
  );
});

console.log("Prepared static site output in dist/");