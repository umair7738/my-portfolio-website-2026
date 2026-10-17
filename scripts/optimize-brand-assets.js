// Explicit, local-only export step. The normal build needs only the checked-in derivatives.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const kit = path.join(root, "Umair_Builds_Logo_Kit_Corrected_v2");
const output = path.join(root, "assets", "brand");

async function verifyImage(file, expectedWidth, expectedHeight) {
  const metadata = await sharp(file).metadata();
  if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
    throw new Error(`${path.basename(file)} must be ${expectedWidth}×${expectedHeight}, found ${metadata.width}×${metadata.height}`);
  }
}

async function run() {
  fs.mkdirSync(output, { recursive: true });
  const websiteAssets = path.join(kit, "03_Website_WebP");
  for (const variant of ["light", "dark"]) {
    for (const width of [200, 400]) {
      const source = path.join(websiteAssets, `umair-builds-horizontal-${variant}-${width}.webp`);
      await verifyImage(source, width, width === 200 ? 36 : 72);
      fs.copyFileSync(source, path.join(output, path.basename(source)));
    }
    const png = path.join(websiteAssets, `umair-builds-horizontal-${variant}-400.png`);
    await verifyImage(png, 400, 72);
    fs.copyFileSync(png, path.join(output, path.basename(png)));
  }
  for (const size of [16, 32, 48, 180]) {
    const source = path.join(kit, "05_Favicons", `favicon-${size}x${size}.png`);
    await verifyImage(source, size, size);
    fs.copyFileSync(source, path.join(output, `umair-builds-icon-${size}.png`));
  }
  fs.copyFileSync(path.join(kit, "05_Favicons", "favicon.ico"), path.join(root, "favicon.ico"));
  console.log("Copied the approved v2 website derivatives and supplied v2 favicons without redrawing or re-rasterizing the artwork.");
  for (const file of fs.readdirSync(output)) {
    const full = path.join(output, file);
    const meta = await sharp(full).metadata();
    console.log(`${file}: ${meta.width}×${meta.height}, ${fs.statSync(full).size} bytes`);
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
