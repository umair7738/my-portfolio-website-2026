const fs = require("fs");
const path = require("path");

const base = "https://umair-shaikh-portfolio.webdeveloper15235.chatgpt.site";
const htmlFiles = fs.readdirSync(process.cwd()).filter((file) => file.endsWith(".html") && file !== "404.html");

htmlFiles.forEach((file) => {
  const canonical = file === "index.html" ? `${base}/` : `${base}/${file}`;
  const source = fs.readFileSync(file, "utf8");
  const updated = source
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:image" content="assets\/images\/og-portfolio\.webp">/g, `<meta property="og:image" content="${base}/assets/images/og-portfolio.webp">`)
    .replace(/<meta name="twitter:image" content="assets\/images\/og-portfolio\.webp">/g, `<meta name="twitter:image" content="${base}/assets/images/og-portfolio.webp">`);
  fs.writeFileSync(file, updated);
});

for (const file of ["robots.txt", "sitemap.xml"]) {
  const source = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, source.replace(/https:\/\/umairportfolio-1\.netlify\.app/g, base));
}

console.log(`Updated production metadata for ${htmlFiles.length} pages.`);
