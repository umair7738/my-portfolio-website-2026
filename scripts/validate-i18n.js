const fs = require("fs");
const path = require("path");

const expectedLocales = ["en-IN", "hi-IN", "ar-AE", "es-ES", "fr-FR", "de-DE", "pt-BR", "it-IT", "nl-NL", "pl-PL", "tr-TR", "ru-RU", "zh-CN", "ja-JP", "ko-KR", "id-ID", "vi-VN", "th-TH", "bn-BD", "ur-PK"];
const manifest = JSON.parse(fs.readFileSync(path.join("assets", "i18n", "manifest.json"), "utf8"));
const english = JSON.parse(fs.readFileSync(path.join("assets", "i18n", "en.json"), "utf8"));
const expectedKeys = Object.keys(english);
const expectedSet = new Set(expectedKeys);
const ready = new Set(manifest.ready);
const approvedUnchanged = new Set(manifest.approvedUnchanged || []);
const errors = [];
const warnings = [];

if (expectedKeys.length !== expectedSet.size) errors.push("English catalog has duplicate keys.");
expectedLocales.forEach((code) => {
  try { if (Intl.getCanonicalLocales(code)[0] !== code) errors.push("Invalid BCP 47 locale: " + code); }
  catch (_error) { errors.push("Invalid BCP 47 locale: " + code); }
  if (!fs.existsSync(path.join("assets", "flags", code.split("-")[1].toLowerCase() + ".svg"))) errors.push("Missing local flag: " + code);
});
if (!ready.has("en-IN")) errors.push("English must remain available.");
ready.forEach((code) => { if (!expectedLocales.includes(code)) errors.push("Unexpected available locale: " + code); });
(manifest.editorialReviewed || []).forEach((code) => { if (!ready.has(code)) errors.push("Editorially reviewed locale is not available: " + code); });
const css = fs.readFileSync(path.join("assets", "css", "style.css"), "utf8");
["hi-IN", "bn-BD", "ar-AE", "ur-PK", "zh-CN", "ja-JP", "ko-KR", "th-TH", "ru-RU", "pl-PL", "tr-TR", "vi-VN"].forEach((code) => {
  if (!css.includes('data-locale="' + code + '"')) errors.push("Missing script-specific font stack: " + code);
});
if (!css.includes('html[dir="rtl"]')) errors.push("Missing RTL styling.");

const htmlFiles = fs.readdirSync(process.cwd()).filter((file) => file.endsWith(".html"))
  .concat(fs.readdirSync("components").filter((file) => file.endsWith(".html")).map((file) => "components/" + file));
htmlFiles.forEach((file) => {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/\bdata-i18n-(?:text|attrs)="([^"]*)"/g)) {
    match[1].split(";").filter(Boolean).forEach((pair) => {
      const key = pair.slice(pair.indexOf(":") + 1);
      if (!expectedSet.has(key) && !/\{\{(?:slug|status)\}\}/.test(key)) errors.push(file + ": unknown translation key " + key);
    });
  }
});

const tokenPattern = /\{[a-zA-Z][a-zA-Z0-9]*\}/g;
const protectedFacts = /\b(?:Umair Shaikh|Nexgeno|HERE Maps|Stripe|Razorpay|PayU|Shipway|GSAP|WordPress|Laravel|PHP|REST|RBAC|HRMS|CRM|EmailJS|GitHub|LinkedIn|CodePen)\b/g;
ready.forEach((code) => {
  const file = path.join("assets", "i18n", code === "en-IN" ? "en.json" : code + ".json");
  if (!fs.existsSync(file)) { errors.push(code + ": missing local translation file"); return; }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const keys = Object.keys(data);
  if (keys.length !== expectedKeys.length) errors.push(code + ": expected " + expectedKeys.length + " keys, found " + keys.length);
  expectedKeys.forEach((key) => {
    const value = data[key];
    if (typeof value !== "string" || !value.trim()) { errors.push(code + ": missing " + key); return; }
    const source = english[key];
    const sourceTokens = source.match(tokenPattern) || [];
    const targetTokens = value.match(tokenPattern) || [];
    if (JSON.stringify(sourceTokens.sort()) !== JSON.stringify(targetTokens.sort())) errors.push(code + ": placeholder mismatch in " + key);
    const sourceFacts = source.match(protectedFacts) || [];
    sourceFacts.forEach((fact) => { if (!value.includes(fact)) errors.push(code + ": protected technical term missing from " + key + ": " + fact); });
    const sourceNumbers = source.match(/\d+(?:[.,]\d+)*/g) || [];
    sourceNumbers.forEach((number) => { if (!value.includes(number)) errors.push(code + ": factual number missing from " + key + ": " + number); });
    if (code !== "en-IN" && value === source && /[A-Za-z]{4}/.test(source) && !approvedUnchanged.has(key)) errors.push(code + ": unapproved English wording in " + key);
  });
  keys.forEach((key) => { if (!expectedSet.has(key)) errors.push(code + ": unknown key " + key); });
});

const incomplete = expectedLocales.filter((code) => !ready.has(code));
if (incomplete.length) warnings.push("Not complete: " + incomplete.join(", "));
if (process.argv.includes("--all") && incomplete.length) errors.push("Only " + ready.size + " of 20 locales are available.");
warnings.slice(0, 30).forEach((message) => console.warn("WARN " + message));
if (warnings.length > 30) console.warn("WARN " + (warnings.length - 30) + " additional warnings");
errors.slice(0, 30).forEach((message) => console.error("ERROR " + message));
if (errors.length > 30) console.error("ERROR " + (errors.length - 30) + " additional errors");
console.log("Translation validation: " + ready.size + "/20 available locales; " + expectedKeys.length + " English keys; " + errors.length + " errors.");
process.exitCode = errors.length ? 1 : 0;
