# Umair Builds brand integration — local validation report

The approved horizontal identity replaces the shared header/footer text marks. The existing page layout, palette, typography, personal content, job titles, copyright, forms, analytics consent, project data, router, and animation implementations are preserved. No dependencies were added and nothing was pushed, published, uploaded, or deployed.

## Artwork and placement

- Header: `Umair_Builds_Horizontal_Header_Transparent_2000.png` for the light site theme; `Umair_Builds_Horizontal_Header_DarkMode_Transparent_2000.png` for the dark site theme.
- Footer: the dark-background/white-text horizontal variant in both site themes, because the footer remains dark.
- One accessible image per placement, with `Umair Builds` alternative text and a homepage link named `Umair Builds home`.
- The original files are 2000×447px. Their identical alpha bounds are x=73, y=73, width=1853, height=301. Only fully transparent outer padding was removed. No visible pixels, type, symbol, colors, or proportions were rebuilt.
- Header display widths: 168px below 992px, 160px at 992–1199px, and 200px from 1200px. Footer: 200px. The established 72px/84px header heights are unchanged.
- The early head script restores the explicit saved site theme before component insertion. The header's inert template receives the matching source before entering the document. Theme changes update that same image; no pair of hidden theme images is used.
- Header images are eager/high-priority; the footer image is lazy. Real dimensions and a shared aspect ratio reserve the logo space.

## Optimized production assets

All WebP files use lossless encoding with alpha. Comparison of decoded visible RGBA pixels against the same crop/resize of the approved originals found zero differences. PNG fallbacks also preserve transparency. No upscaling, vector conversion, SVG wrapper, JPEG background rectangle, or aggressive lossy compression was introduced.

| File under `assets/brand/` | Dimensions | Bytes |
| --- | --- | ---: |
| `umair-builds-horizontal-dark-200.webp` | 200×32 | 6,400 |
| `umair-builds-horizontal-dark-400.webp` | 400×65 | 18,086 |
| `umair-builds-horizontal-dark-400.png` | 400×65 | 21,552 |
| `umair-builds-horizontal-light-200.webp` | 200×32 | 8,530 |
| `umair-builds-horizontal-light-400.webp` | 400×65 | 25,946 |
| `umair-builds-horizontal-light-400.png` | 400×65 | 29,182 |
| `umair-builds-icon-16.png` | 16×16 | 762 |
| `umair-builds-icon-32.png` | 32×32 | 1,750 |
| `umair-builds-icon-48.png` | 48×48 | 2,853 |
| `umair-builds-icon-180.png` | 180×180 | 15,121 |

The supplied `/favicon.ico` is 9,414 bytes and contains 16/32/48/64px entries. All four favicon PNGs and the ICO are byte-for-byte copies of the supplied kit. All ten HTML pages reference the ICO, 16/32/48px PNGs, and the 180px Apple touch icon. There is no existing manifest/PWA, so 192/512px app icons, manifests, and service workers were not added. The obsolete `assets/icons/favicon.png` was removed and its legacy generator no longer recreates it.

Only these ten brand assets and the root ICO are included. Each asset reference uses a 12-character SHA-256 query version, matching the existing CSS/JS convention. The build verifies asset presence, versions, required dimensions/markup, and the absence of unused files in the brand directory. The original 26-file kit remains local and is ignored by Git.

## Responsive and browser evidence

Chrome completed the following matrix in both themes, with the operating-system color preference deliberately set opposite to the saved site theme:

| Viewport | Logo display | Header height | Minimum horizontal clearance |
| --- | --- | --- | --- |
| 320px | 168×27.28px | 72px | 20.03px |
| 375px | 168×27.28px | 72px | 75.03px |
| 390px | 168×27.28px | 72px | 90.03px |
| 768px | 168×27.28px | 72px | 455.55px |
| 992px | 160×25.98px | 84px | 23.23px |
| 1024px | 160×25.98px | 84px | 38.27px |
| 1199px | 160×25.98px | 84px | 120.52px |
| 1440px | 200×32.48px | 84px | 140.86px |

All 16 combinations passed image decoding, vertical alignment, aspect ratio, menu open/keyboard dismissal, footer contrast/variant, and document-overflow checks. No logo-attributed layout shifts were recorded. Desktop navigation and action text remained on one line. The old 1024px header had wrapped navigation/action text; reducing only the logo width and header gaps resolved this without changing navigation breakpoints or structure.

Request inspection confirmed one initial 200px WebP logo request at 1× density, for the saved theme only. The dark footer logo is requested when needed. The 2× density check selected the 400px WebP, without downloading PNG fallbacks or the unused theme. Theme switching, a Barba homepage navigation, and reload persistence passed. The supplied favicon paths returned image content and both PNG fallbacks decoded at 400×65px.

Screenshots are local review artifacts excluded from deployment. In the comparison images, **before is left; after is right**:

- [Desktop comparison, 1440px](../tmp/brand-review/before-after-desktop.png)
- [Mobile comparison, 390px](../tmp/brand-review/before-after-mobile.png)
- [Light header at 320px](../tmp/brand-review/after-light-320.png)
- [Dark header at 992px](../tmp/brand-review/after-dark-992.png)
- [Light header at 1440px](../tmp/brand-review/after-light-1440.png)
- [Footer on a light-themed page](../tmp/brand-review/after-footer-light-390.png)
- [Dark logo at 2× pixel density](../tmp/brand-review/logo-dark-2x.png)
- [Light logo at 2× pixel density](../tmp/brand-review/logo-light-2x.png)
- [Measured responsive results](../tmp/brand-review/responsive-results.json)
- [All header variants and widths](../tmp/brand-review/header-matrix.png)
- [All-page and sticky-header smoke results](../tmp/brand-review/page-smoke-results.json)

## Build, SEO preservation, and regression checks

- `npm run build`: passed, including metadata normalization, minified production bundles, and site validation for all ten pages.
- Repeat build: all 27 checked production-file hashes were unchanged.
- JavaScript syntax checks: passed for every JavaScript file under `scripts/`, `assets/js/`, and `tests/`.
- `git diff --check`: passed.
- Compared every page's title, canonical link, social preview metadata, and JSON-LD with Git HEAD: unchanged except the approved existing WebSite name, `Umair Builds`. The existing `og:site_name` uses the same brand name. No Organization, Person, or other schema entities were added or duplicated. There were no existing schema logo URLs to replace.
- Preserved the existing privacy-page sitemap priority of 0.3 by correcting the metadata generator's conflicting default; the sitemap's contents are unchanged from HEAD.
- Baseline: an earlier concurrent run encountered loader visibility and contact-form timeouts before implementation. A fresh one-worker desktop run completed with **7 passed, 1 skipped**. Loader, router, project-data, contact/analytics implementations, and existing test assertions were not changed to suppress those failures.
- The first new branding test attempted Escape while Bootstrap was still opening the menu and failed. Its synchronization now waits for Bootstrap's completed `show` state before exercising dismissal; the keyboard assertion remains and no product behavior was changed to make it pass.
- Full regression suite, `node node_modules/@playwright/test/cli.js test --workers=1 --reporter=line`: **39 passed, 9 expected skips, 0 failed (6.0 minutes)**. This covers desktop, tablet, mobile/touch, and reduced-motion projects. Six skips avoid repeating the explicit viewport/density matrices in other projects; three are the existing mobile-only source assertion on wider viewports. Existing test files/configuration and assertions were not weakened or altered.
- Final browser smoke check: all nine indexable/shared-layout pages loaded decoded header and footer logos without HTTP or JavaScript errors. The standalone 404 page's favicon responses were verified by the regression suite. Sticky/scrolled header state, return-on-up-scroll visibility, and theme switching in both directions passed at 390, 992, and 1440px.

## Raster quality and verification limits

The kit guide identifies the artwork as raster extractions from a 1448×1086 concept board, not native vectors. All supplied image exports were visually reviewed in a contact sheet, with the selected horizontal variants checked separately at intended sizes and 2× density. The favicon files were also reviewed at their supplied sizes; the 16px mark necessarily carries less internal detail.

The dark export retains minor roughness/uneven extracted edges and both variants retain some source softness on close/high-density inspection. At the chosen normal display sizes, the wordmark and symbol remain readable, with no clipped letters, missing mark, background rectangle, or materially damaged identity observed. These inherited limitations have not been concealed by redrawing or replacing the approved artwork. Unused stacked, tagline, standalone, solid-background, and reference exports are not shipped.

Browser verification uses installed desktop Chrome, including mobile-sized/touch and reduced-motion test projects; this is not a physical-device Safari/Firefox test. The standalone Playwright CLI could not be fetched because registry access was restricted; the existing installed Playwright runner and Chrome were available. No separate W3C HTML/CSS validator was installed; the existing site validator, JavaScript checks, asset checks, and real-browser layout checks were used. Apache/Hostinger responses were not tested live, and real EmailJS delivery/GA ingestion was not exercised: the contact tests use their existing local mocks.

## Changed files

Created:

- The ten assets listed above and root `favicon.ico`.
- `scripts/brand-assets.js`, `scripts/optimize-brand-assets.js`.
- `tests/branding.spec.js` and this report.
- Ignored `tmp/brand-review/` screenshots, measurements, and inspection artifacts.

Modified:

- All ten root HTML pages: favicon references, generated bundle versions, and saved-theme initialization where applicable; existing site-name metadata on the nine indexable pages.
- `components/navbar.html`, `components/footer.html`.
- `assets/css/style.css`, `assets/css/responsive.css`, and generated `assets/css/portfolio.min.css`.
- `assets/js/utilities.js`, `assets/js/navigation.js`, and generated `assets/js/portfolio.min.js`.
- `scripts/site-config.js`, `scripts/update-production-domain.js`, `scripts/build-production.js`, `scripts/validate-site.js`, `scripts/serve-site.js`, `scripts/generate-assets.js`.
- `package.json`, `.gitignore`, `.htaccess`, and `README.md`.

Deleted: the superseded `assets/icons/favicon.png`. `package-lock.json` and dependency versions are unchanged.

## Production readiness

The local production output is ready for manual Hostinger deployment, with the inherited raster quality and browser/hosting verification limits documented above. The root-level build is the existing Hostinger deployment output; no separate `dist/` was created. All available project checks and the final browser smoke checks passed. No deployment action has been taken. A manual upload must include the HTML pages, shared components, optimized assets, root favicon, and existing `.htaccess`, while excluding the source logo kit and internal/tooling/review files. A live Hostinger deployment and its server responses have not been tested or modified.
