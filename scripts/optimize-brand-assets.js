// Explicit, local-only export step. The normal build needs only the checked-in derivatives.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const kit = path.join(root, "Umair_Builds_Website_Logo_Kit");
const output = path.join(root, "assets", "brand");

async function alphaBounds(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (!data[(y * info.width + x) * 4 + 3]) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) throw new Error(`Empty artwork: ${file}`);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function run() {
  fs.mkdirSync(output, { recursive: true });
  const variants = [
    ["light", "Umair_Builds_Horizontal_Header_Transparent_2000.png"],
    ["dark", "Umair_Builds_Horizontal_Header_DarkMode_Transparent_2000.png"]
  ];
  const bounds = await Promise.all(variants.map(([, file]) => alphaBounds(path.join(kit, "01_Transparent_PNG", file))));
  if (JSON.stringify(bounds[0]) !== JSON.stringify(bounds[1])) throw new Error("Theme exports must share the same transparent crop bounds; review before exporting.");
  for (const [variant, file] of variants) {
    const source = path.join(kit, "01_Transparent_PNG", file);
    for (const width of [200, 400]) {
      await sharp(source).extract(bounds[0]).resize({ width, withoutEnlargement: true })
        .webp({ lossless: true, effort: 6 })
        .toFile(path.join(output, `umair-builds-horizontal-${variant}-${width}.webp`));
    }
    await sharp(source).extract(bounds[0]).resize({ width: 400, withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(path.join(output, `umair-builds-horizontal-${variant}-400.png`));
  }
  for (const size of [16, 32, 48, 180]) {
    fs.copyFileSync(path.join(kit, "03_Favicons", `favicon-${size}x${size}.png`), path.join(output, `umair-builds-icon-${size}.png`));
  }
  fs.copyFileSync(path.join(kit, "03_Favicons", "favicon.ico"), path.join(root, "favicon.ico"));
  console.log(`Exported approved logos with a ${bounds[0].width}×${bounds[0].height} alpha-only crop; copied supplied favicons unchanged.`);
  for (const file of fs.readdirSync(output)) {
    const full = path.join(output, file);
    const meta = await sharp(full).metadata();
    console.log(`${file}: ${meta.width}×${meta.height}, ${fs.statSync(full).size} bytes`);
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
