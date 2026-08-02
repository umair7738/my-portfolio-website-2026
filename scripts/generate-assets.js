const sharp = require("sharp");
const path = require("path");

const outputDir = path.join(process.cwd(), "assets", "images");
const iconDir = path.join(process.cwd(), "assets", "icons");

const projects = [
  ["project-utc-india.webp", "#0f1b38", "#5a3fd4", "UTC INDIA", "WORDPRESS  /  PRODUCT CATALOGUE", "#56d4ff"],
  ["project-atyaf.webp", "#161b2c", "#b06a37", "ATYAF AL MAJD", "CUSTOM FRONTEND  /  BOOTSTRAP", "#ffc36d"],
  ["project-ccie.webp", "#071b29", "#09647a", "CCIE SECURITY", "TRAINING LANDING PAGE", "#54e6ff"],
  ["project-diwali.webp", "#24102b", "#b43e31", "DIWALI SALE", "CAMPAIGN  /  DESIGN + DEVELOPMENT", "#ffba55"],
  ["project-christmas.webp", "#0a2826", "#8f263a", "CHRISTMAS", "CAMPAIGN  /  DESIGN + DEVELOPMENT", "#83f1c5"],
  ["project-equity.webp", "#071b22", "#2a7961", "EQUITY EXCHANGE", "ACADEMY  /  WEBSITE DESIGN", "#82f5c0"],
  ["project-bride.webp", "#2a1522", "#a94b73", "BRIDE IS PRIDE", "WORDPRESS  /  INTERNAL PAGES", "#ffb4d0"]
];

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]);
}

function projectArt([file, start, end, title, subtitle, accent], index) {
  const bars = Array.from({ length: 5 }, (_, row) => {
    const width = 350 - row * 36 + (index % 2) * 42;
    return `<rect x="146" y="${265 + row * 32}" width="${width}" height="10" rx="5" fill="rgba(255,255,255,${0.15 - row * 0.015})"/>`;
  }).join("");
  const svg = `
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient>
        <radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".34"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="28" stdDeviation="32" flood-opacity=".26"/></filter>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)"/>
      <circle cx="1010" cy="110" r="380" fill="url(#glow)"/>
      <path d="M0 650 C280 520 420 820 720 640 C900 532 1010 560 1200 460 V800 H0Z" fill="rgba(3,6,14,.18)"/>
      <rect x="64" y="64" width="1072" height="672" rx="34" fill="rgba(255,255,255,.055)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
      <g filter="url(#shadow)">
        <rect x="105" y="125" width="990" height="540" rx="22" fill="rgba(4,7,16,.48)" stroke="rgba(255,255,255,.14)"/>
        <rect x="105" y="125" width="990" height="78" rx="22" fill="rgba(255,255,255,.045)"/>
        <circle cx="145" cy="165" r="6" fill="rgba(255,255,255,.48)"/><circle cx="170" cy="165" r="6" fill="rgba(255,255,255,.35)"/><circle cx="195" cy="165" r="6" fill="rgba(255,255,255,.22)"/>
        <rect x="426" y="150" width="350" height="30" rx="15" fill="rgba(255,255,255,.07)"/>
        <rect x="146" y="236" width="84" height="10" rx="5" fill="${accent}"/>
        ${bars}
        <rect x="602" y="250" width="405" height="232" rx="22" fill="rgba(255,255,255,.09)" stroke="rgba(255,255,255,.1)"/>
        <circle cx="930" cy="284" r="125" fill="url(#glow)"/>
        <rect x="602" y="508" width="119" height="105" rx="16" fill="rgba(255,255,255,.08)"/><rect x="745" y="508" width="119" height="105" rx="16" fill="rgba(255,255,255,.08)"/><rect x="888" y="508" width="119" height="105" rx="16" fill="rgba(255,255,255,.08)"/>
      </g>
      <text x="110" y="714" fill="white" font-size="65" font-family="Arial, sans-serif" font-weight="700" letter-spacing="-2">${escapeXml(title)}</text>
      <text x="111" y="757" fill="rgba(255,255,255,.64)" font-size="17" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2.4">${escapeXml(subtitle)}</text>
      <text x="1088" y="757" text-anchor="end" fill="${accent}" font-size="16" font-family="Arial, sans-serif" font-weight="700">0${index + 1}</text>
    </svg>`;
  return sharp(Buffer.from(svg)).webp({ quality: 84, effort: 5 }).toFile(path.join(outputDir, file));
}

async function run() {
  await Promise.all(projects.map(projectArt));
  const favicon = `<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#6f5cff"/><stop offset="1" stop-color="#268cff"/></linearGradient></defs><rect width="128" height="128" rx="34" fill="url(#g)"/><text x="64" y="78" text-anchor="middle" fill="white" font-size="42" font-family="Arial, sans-serif" font-weight="700">US</text></svg>`;
  await sharp(Buffer.from(favicon)).png().toFile(path.join(iconDir, "favicon.png"));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
