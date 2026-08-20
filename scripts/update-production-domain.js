const fs = require("fs");
const path = require("path");
const { baseUrl, pages, sitemapPages, pageUrl } = require("./site-config");

const root = process.cwd();
const socialImage = `${baseUrl}/assets/images/og-portfolio.webp`;
const imageAlt = "Umair Shaikh full stack web developer portfolio preview";

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function upsert(html, pattern, tag) {
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

function absoluteStructuredValue(value) {
  if (typeof value !== "string") return value;
  if (value === "index.html") return `${baseUrl}/`;
  if (pages[value]) return pageUrl(value);
  if (/^#(?:person|website|portfolio-studio|portfolio)$/.test(value)) return `${baseUrl}/${value}`;
  return value;
}

function normalizeStructuredData(value, canonical) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeStructuredData(item, canonical));
  }
  if (!value || typeof value !== "object") return absoluteStructuredValue(value);
  const normalized = {};
  Object.entries(value).forEach(([key, item]) => {
    normalized[key] = normalizeStructuredData(item, canonical);
  });
  const types = Array.isArray(normalized["@type"]) ? normalized["@type"] : [normalized["@type"]];
  if (types.includes("Person") && normalized.name === "Umair Shaikh") {
    normalized["@id"] = `${baseUrl}/#person`;
    normalized.url = `${baseUrl}/`;
  }
  if (types.includes("WebSite")) {
    normalized["@id"] = `${baseUrl}/#website`;
    normalized.url = `${baseUrl}/`;
  }
  if (["CollectionPage", "ProfilePage", "AboutPage", "ContactPage"].some((type) => types.includes(type))) {
    normalized.url = canonical;
  }
  return normalized;
}

function normalizeJsonLd(html, canonical) {
  return html.replace(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (full, json) => {
    try {
      const data = normalizeStructuredData(JSON.parse(json), canonical);
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    } catch (_error) {
      return full;
    }
  });
}

Object.entries(pages).forEach(([file, metadata]) => {
  const target = path.join(root, file);
  const canonical = pageUrl(file);
  let html = fs.readFileSync(target, "utf8")
    .replace(/\s*<meta\s+name="keywords"[^>]*>/gi, "");

  html = upsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${metadata.title}</title>`);
  html = upsert(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeAttribute(metadata.description)}">`);
  html = upsert(html, /<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">');
  html = upsert(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}">`);
  html = upsert(html, /<meta\s+property="og:type"[^>]*>/i, `<meta property="og:type" content="${metadata.ogType}">`);
  html = upsert(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeAttribute(metadata.title)}">`);
  html = upsert(html, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeAttribute(metadata.description)}">`);
  html = upsert(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}">`);
  html = upsert(html, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${socialImage}">`);
  html = upsert(html, /<meta\s+property="og:image:alt"[^>]*>/i, `<meta property="og:image:alt" content="${imageAlt}">`);
  html = upsert(html, /<meta\s+property="og:image:width"[^>]*>/i, '<meta property="og:image:width" content="1200">');
  html = upsert(html, /<meta\s+property="og:image:height"[^>]*>/i, '<meta property="og:image:height" content="630">');
  html = upsert(html, /<meta\s+property="og:site_name"[^>]*>/i, '<meta property="og:site_name" content="Umair Shaikh Portfolio">');
  html = upsert(html, /<meta\s+property="og:locale"[^>]*>/i, '<meta property="og:locale" content="en_IN">');
  html = upsert(html, /<meta\s+name="twitter:card"[^>]*>/i, '<meta name="twitter:card" content="summary_large_image">');
  html = upsert(html, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeAttribute(metadata.title)}">`);
  html = upsert(html, /<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeAttribute(metadata.description)}">`);
  html = upsert(html, /<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${socialImage}">`);
  html = upsert(html, /<meta\s+name="twitter:image:alt"[^>]*>/i, `<meta name="twitter:image:alt" content="${imageAlt}">`);
  html = normalizeJsonLd(html, canonical);
  fs.writeFileSync(target, html);
});

fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);

const sitemapEntries = sitemapPages.map((file) => {
  const priority = file === "index.html" ? "1.0" : ["projects.html", "case-studies.html"].includes(file) ? "0.9" : "0.8";
  const changefreq = ["index.html", "projects.html", "case-studies.html", "services.html"].includes(file) ? "monthly" : "yearly";
  return `  <url><loc>${pageUrl(file)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}).join("\n");
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`);

console.log(`Normalized production metadata for ${Object.keys(pages).length} pages using ${baseUrl}.`);
