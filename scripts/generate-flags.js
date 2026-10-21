const fs = require("fs");
const path = require("path");

const rect = (fill, x = 0, y = 0, width = 60, height = 40) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/>`;
const circle = (fill, cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
function star(cx, cy, outer, inner, points, fill, rotation = -Math.PI / 2) {
  const vertices = Array.from({ length: points * 2 }, (_, index) => {
    const angle = rotation + index * Math.PI / points;
    const radius = index % 2 ? inner : outer;
    return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  });
  return `<polygon points="${vertices.join(" ")}" fill="${fill}"/>`;
}
const horizontal = (...colors) => colors.map((color, index) => rect(color, 0, index * 40 / colors.length, 60, 40 / colors.length)).join("");
const vertical = (...colors) => colors.map((color, index) => rect(color, index * 60 / colors.length, 0, 60 / colors.length, 40)).join("");
const indiaChakra = circle("none", 30, 20, 5.1).replace("/>", ' stroke="#000080" stroke-width=".65"/>') +
  Array.from({ length: 24 }, (_, index) => {
    const angle = index * Math.PI / 12;
    return `<line x1="30" y1="20" x2="${(30 + Math.cos(angle) * 4.8).toFixed(2)}" y2="${(20 + Math.sin(angle) * 4.8).toFixed(2)}" stroke="#000080" stroke-width=".25"/>`;
  }).join("");
const southKorea = rect("#fff") + circle("#cd2e3a", 30, 20, 10) +
  '<path d="M20 20c0-5.52 4.48-10 10-10 5.52 0 10 4.48 10 10-2.76-5.52-7.24-5.52-10 0s-7.24 5.52-10 0z" fill="#0047a0"/>' +
  '<path d="M20 20c2.76 5.52 7.24 5.52 10 0s7.24-5.52 10 0c0 5.52-4.48 10-10 10s-10-4.48-10-10z" fill="#0047a0"/>' +
  [[7, 7], [47, 7], [7, 31], [47, 31]].map(([x, y], index) => `<g transform="translate(${x} ${y}) rotate(${index % 2 ? 35 : -35} 3 2)">${[0, 2, 4].map((offset) => rect("#111", 0, offset, 7, 1.2)).join("")}</g>`).join("");

const flags = {
  in: horizontal("#ff9933", "#fff", "#138808") + indiaChakra,
  ae: horizontal("#00732f", "#fff", "#000") + rect("#e31b23", 0, 0, 14, 40),
  es: rect("#aa151b") + rect("#f1bf00", 0, 10, 60, 20),
  fr: vertical("#0055a4", "#fff", "#ef4135"),
  de: horizontal("#000", "#dd0000", "#ffce00"),
  br: rect("#009739") + '<polygon points="30,4 56,20 30,36 4,20" fill="#ffdf00"/>' + circle("#002776", 30, 20, 10) + '<path d="M21 18q10-3 19 3" fill="none" stroke="#fff" stroke-width="1.5"/>',
  it: vertical("#009246", "#fff", "#ce2b37"),
  nl: horizontal("#ae1c28", "#fff", "#21468b"),
  pl: horizontal("#fff", "#dc143c"),
  tr: rect("#e30a17") + circle("#fff", 25, 20, 10) + circle("#e30a17", 29, 18, 8) + star(39, 20, 5, 2, 5, "#fff"),
  ru: horizontal("#fff", "#0039a6", "#d52b1e"),
  cn: rect("#de2910") + star(13, 11, 7, 2.8, 5, "#ffde00") + [[24, 5], [29, 11], [29, 20], [23, 25]].map(([x, y]) => star(x, y, 2.2, .9, 5, "#ffde00")).join(""),
  jp: rect("#fff") + circle("#bc002d", 30, 20, 11),
  kr: southKorea,
  id: horizontal("#ce1126", "#fff"),
  vn: rect("#da251d") + star(30, 20, 12, 4.8, 5, "#ffff00"),
  th: rect("#a51931") + rect("#fff", 0, 7, 60, 26) + rect("#2d2a4a", 0, 13, 60, 14),
  bd: rect("#006a4e") + circle("#f42a41", 28, 20, 11),
  pk: rect("#01411c") + rect("#fff", 0, 0, 14, 40) + circle("#fff", 39, 20, 11) + circle("#01411c", 43, 17, 9) + star(46, 13, 4, 1.5, 5, "#fff")
};

const directory = path.join("assets", "flags");
fs.mkdirSync(directory, { recursive: true });
Object.entries(flags).forEach(([code, shapes]) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40"><title>${code.toUpperCase()} flag</title>${shapes}</svg>\n`;
  fs.writeFileSync(path.join(directory, code + ".svg"), svg);
});
console.log("Generated " + Object.keys(flags).length + " local flag assets.");
