const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const sizes = "(max-width: 991.98px) 168px, (max-width: 1199.98px) 160px, 200px";
const logoWidth = 2400;
const logoHeight = 430;

function assetUrl(file) {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex").slice(0, 12);
  return `${file}?v=${hash}`;
}

function logoUrl(theme, width, extension = "webp") {
  return assetUrl(`assets/brand/umair-builds-horizontal-${theme}-${width}.${extension}`);
}

function logoSrcset(theme) {
  return `${logoUrl(theme, 200)} 200w, ${logoUrl(theme, 400)} 400w`;
}

function logoMarkup(placement) {
  const header = placement === "header";
  const source = header
    ? `<source type="image/webp" sizes="${sizes}" data-light-srcset="${logoSrcset("light")}" data-dark-srcset="${logoSrcset("dark")}">`
    : `<source type="image/webp" sizes="200px" srcset="${logoSrcset("dark")}">`;
  const attributes = header
    ? `loading="eager" fetchpriority="high" data-light-src="${logoUrl("light", 400, "png")}" data-dark-src="${logoUrl("dark", 400, "png")}"`
    : `loading="lazy" src="${logoUrl("dark", 400, "png")}"`;
  return `<a class="brand${header ? " magnetic" : ""}" href="/" aria-label="Umair Builds home"><picture class="brand-logo"${header ? " data-theme-logo" : ""}>${source}<img ${attributes} width="${logoWidth}" height="${logoHeight}" alt="Umair Builds" decoding="async"></picture></a>`;
}

function faviconMarkup() {
  const links = [`<link rel="icon" href="/${assetUrl("favicon.ico")}" sizes="16x16 32x32 48x48 64x64" type="image/x-icon">`];
  for (const size of [16, 32, 48]) {
    links.push(`<link rel="icon" href="${assetUrl(`assets/brand/umair-builds-icon-${size}.png`)}" sizes="${size}x${size}" type="image/png">`);
  }
  links.push(`<link rel="apple-touch-icon" href="${assetUrl("assets/brand/umair-builds-icon-180.png")}" sizes="180x180">`);
  return `<!-- BRAND_ICONS_START -->\n  ${links.join("\n  ")}\n  <!-- BRAND_ICONS_END -->`;
}

function updateBrandComponents() {
  for (const [component, placement] of [["navbar", "header"], ["footer", "footer"]]) {
    const file = path.join(root, "components", `${component}.html`);
    const source = fs.readFileSync(file, "utf8");
    const block = `<!-- BRAND_LOGO_START -->${logoMarkup(placement)}<!-- BRAND_LOGO_END -->`;
    const pattern = /<!-- BRAND_LOGO_START -->[\s\S]*?<!-- BRAND_LOGO_END -->|<a class="brand(?: magnetic)?"[^>]*>[\s\S]*?<\/a>/;
    if (!pattern.test(source)) throw new Error(`Missing brand placement in ${component}`);
    const updated = source.replace(pattern, block);
    if (updated !== source) fs.writeFileSync(file, updated);
  }
}

module.exports = { assetUrl, logoMarkup, faviconMarkup, updateBrandComponents };
