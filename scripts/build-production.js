const fs = require("fs");
const path = require("path");

function collapseOutsideStrings(source) {
  let output = "";
  let quote = "";
  let escaped = false;
  let whitespace = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      output += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      if (whitespace && output && !/\s$/.test(output)) output += " ";
      whitespace = false;
      quote = character;
      output += character;
      continue;
    }
    if (/\s/.test(character)) {
      whitespace = true;
      continue;
    }
    if (whitespace && output && !/[{(:;,}\[]$/.test(output) && !/[}):;,\]]/.test(character)) output += " ";
    whitespace = false;
    output += character;
  }
  return output.trim();
}

const cssFiles = ["style.css", "animations.css", "responsive.css"].map((file) => path.join("assets", "css", file));
const css = cssFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();
fs.writeFileSync(path.join("assets", "css", "portfolio.min.css"), css + "\n");

const jsFiles = ["utilities.js", "navigation.js", "loader.js", "projects.js", "contact.js", "gsap.js", "app.js"].map((file) => path.join("assets", "js", file));
const js = collapseOutsideStrings(jsFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n"));
fs.writeFileSync(path.join("assets", "js", "portfolio.min.js"), js + "\n");

const htmlFiles = fs.readdirSync(process.cwd()).filter((file) => file.endsWith(".html"));
const assetVersion = "motion-v3";
const cssPattern = /<link rel="stylesheet" href="assets\/css\/style\.css">\s*<link rel="stylesheet" href="assets\/css\/animations\.css">\s*<link rel="stylesheet" href="assets\/css\/responsive\.css">/g;
const jsPattern = /<script defer src="assets\/js\/utilities\.js"><\/script>\s*<script defer src="assets\/js\/navigation\.js"><\/script>\s*<script defer src="assets\/js\/loader\.js"><\/script>\s*<script defer src="assets\/js\/projects\.js"><\/script>\s*<script defer src="assets\/js\/contact\.js"><\/script>\s*<script defer src="assets\/js\/gsap\.js"><\/script>\s*<script defer src="assets\/js\/app\.js"><\/script>/g;
htmlFiles.forEach((file) => {
  const source = fs.readFileSync(file, "utf8");
  const production = source
    .replace(cssPattern, '<link rel="stylesheet" href="assets/css/portfolio.min.css?v=' + assetVersion + '">')
    .replace(jsPattern, '<script defer src="assets/js/portfolio.min.js?v=' + assetVersion + '"></script>')
    .replace(/assets\/css\/portfolio\.min\.css(?:\?v=[^"']*)?/g, "assets/css/portfolio.min.css?v=" + assetVersion)
    .replace(/assets\/js\/portfolio\.min\.js(?:\?v=[^"']*)?/g, "assets/js/portfolio.min.js?v=" + assetVersion);
  if (production !== source) fs.writeFileSync(file, production);
});

console.log(`Built ${path.join("assets", "css", "portfolio.min.css")} (${Buffer.byteLength(css)} bytes)`);
console.log(`Built ${path.join("assets", "js", "portfolio.min.js")} (${Buffer.byteLength(js)} bytes)`);
console.log(`Updated production asset references in ${htmlFiles.length} HTML files.`);
