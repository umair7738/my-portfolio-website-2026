const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function collapseOutsideStrings(source) {
  let output = "";
  let quote = "";
  let escaped = false;
  let whitespace = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (lineComment) {
      if (character === "\n" || character === "\r") {
        lineComment = false;
        whitespace = true;
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        whitespace = true;
        index += 1;
      }
      continue;
    }
    if (quote) {
      output += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && nextCharacter === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      blockComment = true;
      index += 1;
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

const jsFiles = ["utilities.js", "lifecycle.js", "navigation.js", "loader.js", "projects.js", "contact.js", "gsap.js", "router.js", "app.js"].map((file) => path.join("assets", "js", file));
// Keep source formatting here: the previous whitespace-only minifier could mistake
// regular expressions for strings and produce invalid JavaScript.
const js = jsFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n").trimEnd();
fs.writeFileSync(path.join("assets", "js", "portfolio.min.js"), js + "\n");

const htmlFiles = fs.readdirSync(process.cwd()).filter((file) => file.endsWith(".html"));
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
const cssVersion = hash(css);
const jsVersion = hash(js);
const cssPattern = /<link rel="stylesheet" href="assets\/css\/style\.css">\s*<link rel="stylesheet" href="assets\/css\/animations\.css">\s*<link rel="stylesheet" href="assets\/css\/responsive\.css">/g;
const jsPattern = /<script defer src="assets\/js\/utilities\.js"><\/script>\s*<script defer src="assets\/js\/lifecycle\.js"><\/script>\s*<script defer src="assets\/js\/navigation\.js"><\/script>\s*<script defer src="assets\/js\/loader\.js"><\/script>\s*<script defer src="assets\/js\/projects\.js"><\/script>\s*<script defer src="assets\/js\/contact\.js"><\/script>\s*<script defer src="assets\/js\/gsap\.js"><\/script>\s*<script defer src="assets\/js\/router\.js"><\/script>\s*<script defer src="assets\/js\/app\.js"><\/script>/g;
htmlFiles.forEach((file) => {
  const source = fs.readFileSync(file, "utf8");
  const production = source
    .replace(cssPattern, '<link rel="stylesheet" href="assets/css/portfolio.min.css?v=' + cssVersion + '">')
    .replace(jsPattern, '<script defer src="assets/js/portfolio.min.js?v=' + jsVersion + '"></script>')
    .replace(/assets\/css\/portfolio\.min\.css(?:\?v=[^"']*)?/g, "assets/css/portfolio.min.css?v=" + cssVersion)
    .replace(/assets\/js\/portfolio\.min\.js(?:\?v=[^"']*)?/g, "assets/js/portfolio.min.js?v=" + jsVersion)
    .replace(/(?:<script(?: async| defer)? src="https:\/\/cdn\.jsdelivr\.net\/npm\/@emailjs\/browser@4\/dist\/email\.min\.js"><\/script>)+/g, "")
    .replace(/<script defer src="assets\/js\/portfolio\.min\.js\?v=[^"]+"><\/script>/g, '<script async src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"><\/script><script defer src="assets/js/portfolio.min.js?v=' + jsVersion + '"><\/script>')
    .replace(/https:\/\/code\.jquery\.com\/jquery-3\.7\.1\.min\.js/g, "assets/vendor/jquery-3.7.1.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.8\/dist\/css\/bootstrap\.min\.css/g, "assets/vendor/bootstrap-5.3.8.min.css")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.8\/dist\/js\/bootstrap\.bundle\.min\.js/g, "assets/vendor/bootstrap-5.3.8.bundle.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.13\.0\/dist\/gsap\.min\.js/g, "assets/vendor/gsap-3.13.0.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.13\.0\/dist\/ScrollTrigger\.min\.js/g, "assets/vendor/ScrollTrigger-3.13.0.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/lenis@1\.3\.11\/dist\/lenis\.min\.js/g, "assets/vendor/lenis-1.3.11.min.js")
    .replace(/https:\/\/unpkg\.com\/lucide@0\.468\.0\/dist\/umd\/lucide\.min\.js/g, "assets/vendor/lucide-0.468.0.min.js");
  if (production !== source) fs.writeFileSync(file, production);
});

console.log(`Built ${path.join("assets", "css", "portfolio.min.css")} (${Buffer.byteLength(css)} bytes)`);
console.log(`Built ${path.join("assets", "js", "portfolio.min.js")} (${Buffer.byteLength(js)} bytes)`);
console.log(`Updated production asset references in ${htmlFiles.length} HTML files.`);
