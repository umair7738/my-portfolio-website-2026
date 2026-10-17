# Umair Builds brand integration — local validation report

The approved horizontal identity replaces the shared header/footer text marks. The existing page layout, palette, typography, personal content, job titles, copyright, forms, analytics consent, project data, and router are preserved. The original integration preserved animation implementations; the loader startup correction below addresses the subsequently reported visual glitch. No dependencies were added and nothing was pushed, published, uploaded, or deployed.

## Artwork and placement

- Header: the corrected v2 `03_Website_WebP/umair-builds-horizontal-light-400.webp` for the light site theme and `03_Website_WebP/umair-builds-horizontal-dark-400.webp` for the dark site theme, with the supplied 200px WebP candidates selected at normal density.
- Footer: the dark-background/white-text horizontal variant in both site themes, because the footer remains dark.
- One accessible image per placement, with `Umair Builds` alternative text and a homepage link named `Umair Builds home`.
- The corrected v2 website exports are supplied at 200px/36px and 400px/72px for production use. The kit's source horizontal PNGs are 2400×430px with matching alpha bounds; the v2 guide identifies the SVGs as path-based reconstructions of the approved concept, not the original native design source.
- Header display widths: 168px below 992px, 160px at 992–1199px, and 200px from 1200px. Footer: 200px. The established 72px/84px header heights are unchanged.
- The early head script restores the explicit saved site theme before component insertion. The header's inert template receives the matching source before entering the document. Theme changes update that same image; no pair of hidden theme images is used.
- Header images are eager/high-priority; the footer image is lazy. Real dimensions and a shared aspect ratio reserve the logo space.

## Optimized production assets

All WebP files use lossless encoding with alpha. Comparison of decoded visible RGBA pixels against the same crop/resize of the approved originals found zero differences. PNG fallbacks also preserve transparency. No upscaling, vector conversion, SVG wrapper, JPEG background rectangle, or aggressive lossy compression was introduced.

| File under `assets/brand/` | Dimensions | Bytes |
| --- | --- | ---: |
| `umair-builds-horizontal-dark-200.webp` | 200×36 | 2,752 |
| `umair-builds-horizontal-dark-400.webp` | 400×72 | 4,982 |
| `umair-builds-horizontal-dark-400.png` | 400×72 | 7,482 |
| `umair-builds-horizontal-light-200.webp` | 200×36 | 3,074 |
| `umair-builds-horizontal-light-400.webp` | 400×72 | 5,350 |
| `umair-builds-horizontal-light-400.png` | 400×72 | 8,325 |
| `umair-builds-icon-16.png` | 16×16 | 773 |
| `umair-builds-icon-32.png` | 32×32 | 1,741 |
| `umair-builds-icon-48.png` | 48×48 | 2,761 |
| `umair-builds-icon-180.png` | 180×180 | 11,751 |

The supplied v2 `/favicon.ico` is 8,820 bytes and contains 16/32/48/64px entries. All four favicon PNGs and the ICO are byte-for-byte copies of the corrected v2 kit. All ten HTML pages reference the ICO, 16/32/48px PNGs, and the 180px Apple touch icon. There is no existing manifest/PWA, so 192/512px app icons, manifests, and service workers were not added. The obsolete `assets/icons/favicon.png` was removed and its legacy generator no longer recreates it.

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

Request inspection confirmed one initial 200px WebP logo request at 1× density, for the saved theme only. The dark footer logo is requested when needed. The 2× density check selected the 400px WebP, without downloading PNG fallbacks or the unused theme. Theme switching, a Barba homepage navigation, and reload persistence passed. The supplied favicon paths returned image content and both PNG fallbacks decoded at 400×72px.

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

- `npm run build`: passed twice, including metadata normalization, minified production bundles, and site validation for all ten pages.
- Repeat build: completed without introducing additional source changes.
- JavaScript syntax checks: passed for every JavaScript file under `scripts/`, `assets/js/`, and `tests/`.
- `git diff --check`: passed.
- Compared every page's title, canonical link, social preview metadata, and JSON-LD with Git HEAD: unchanged except the approved existing WebSite name, `Umair Builds`. The existing `og:site_name` uses the same brand name. No Organization, Person, or other schema entities were added or duplicated. There were no existing schema logo URLs to replace.
- Preserved the existing privacy-page sitemap priority of 0.3 by correcting the metadata generator's conflicting default; the sitemap's contents are unchanged from HEAD.
- The dedicated branding run completed with **10 passed, 6 expected skips, 0 failed** across the configured Playwright projects.
- The first new branding test attempted Escape while Bootstrap was still opening the menu and failed. Its synchronization now waits for Bootstrap's completed `show` state before exercising dismissal; the keyboard assertion remains and no product behavior was changed to make it pass.
- Full regression suite, `node node_modules/@playwright/test/cli.js test --workers=1 --reporter=line`: **45 passed, 27 expected skips, 0 failed**. This covers desktop, tablet, mobile/touch, and reduced-motion projects. Existing test files/configuration and assertions were not weakened or altered.
- Final browser smoke check: all nine indexable/shared-layout pages loaded decoded header and footer logos in both themes (18 page/theme combinations) with no console or page errors. The standalone 404 page's favicon responses were verified by the regression suite. Sticky/scrolled header state, return-on-up-scroll visibility, and theme switching in both directions passed at the requested responsive widths.

## v2 quality and verification limits

The corrected v2 kit includes path-based SVG masters with no embedded raster images or external dependencies. The SVGs were structurally inspected and the supplied horizontal WebP/PNG exports were visually reviewed at intended sizes and 2× density. The favicon files were also reviewed at their supplied sizes; the 16px mark necessarily carries less internal detail.

The corrected exports show the full wordmark, clean bottom/right edges, consistent transparency, and matching symbol geometry across light/dark variants. The kit guide notes that the SVG artwork is a reconstructed approximation of the original AI-generated design, so exact native-source curve fidelity is not claimed. Unused stacked, tagline, standalone, solid-background, and reference exports are not shipped.

Browser verification uses installed desktop Chrome, including mobile-sized/touch and reduced-motion test projects; this is not a physical-device Safari/Firefox test. The standalone Playwright CLI could not be fetched because registry access was restricted; the existing installed Playwright runner and Chrome were available. No separate W3C HTML/CSS validator was installed; the existing site validator, JavaScript checks, asset checks, and real-browser layout checks were used. Apache/Hostinger responses were not tested live, and real EmailJS delivery/GA ingestion was not exercised: the contact tests use their existing local mocks.

## Changed files

Modified:

- All ten root HTML pages for regenerated v2 favicon URLs and bundle references.
- `components/navbar.html`, `components/footer.html`, `assets/css/style.css`, and generated `assets/css/portfolio.min.css`.
- The ten checked-in production brand files under `assets/brand/` plus root `favicon.ico`.
- `scripts/brand-assets.js`, `scripts/optimize-brand-assets.js`, `tests/branding.spec.js`, `README.md`, and this report.

Removed: no files in this v2 replacement. The original source kits remain local and the obsolete `assets/icons/favicon.png` is neither present in the deployment assets nor referenced by active pages or scripts. `package-lock.json` and dependency versions are unchanged.

## Production readiness

The local production output is ready for manual Hostinger deployment, with the inherited raster quality and browser/hosting verification limits documented above. The root-level build is the existing Hostinger deployment output; no separate `dist/` was created. All available project checks and the final browser smoke checks passed. No deployment action has been taken. A manual upload must include the HTML pages, shared components, optimized assets, root favicon, and existing `.htaccess`, while excluding the source logo kit and internal/tooling/review files. A live Hostinger deployment and its server responses have not been tested or modified.

## Follow-up: loader startup flash

The reported double-looking intro was reproduced by delaying shared component responses. On desktop, the loader letters could paint in their final static state while the footer request was pending, then jump back to the GSAP entrance position when startup continued. Instrumentation recorded one actual loader playback: the visible reset caused the impression of a second playback. On mobile, an independent cover animation started from the body's first paint and could expose the page before a delayed loader component arrived.

The first correction concealed the loader stage until startup and passed disappearance/timing checks, but those checks did not verify that the intended motion was actually visible. The user's next report exposed that gap. Inspection of the actual `127.0.0.1:5500` preview found a 1024px coarse-pointer/touch mode: JavaScript selected its compact loader path while the CSS animation applied only below 768px. The hero entrance was also explicitly skipped on touch devices.

The final correction uses one GSAP owner for the intro on every viewport/input type. It retains the desktop choreography and a compact one-second version for touch/mobile, including moving letters and a real progress counter. Initial letter/detail positions are defined in CSS rather than hiding the entire stage. The duplicate inline component timers and autonomous mobile CSS timelines were removed. The hero is initialized behind the departing loader panels and its entrance now runs on touch/mobile too; touch scrolling and the other lightweight touch choices remain. An explicit saved reduced-motion choice is still respected. This changes `assets/js/loader.js`, `assets/js/gsap.js`, `components/loader.html`, the three CSS sources, generated bundles, and generated page version references.

The new `tests/animation-visibility.spec.js` reproduces the missing 1024px touch intro before the fix. After rebuilding, it verifies multiple distinct rendered letter and hero positions plus intermediate card fade/slide states on desktop, mobile, and 1024px touch with the preview's OS preference. It also verifies explicit saved reduced motion. The two loading-race regressions verify clipped starting letters, delayed mobile loading, one intro playback, and no replay on internal navigation. The final targeted run completed with **16 passed, 6 expected profile skips, 0 failed (2.0 minutes)**, including the existing desktop/mobile contact/analytics, project, navigation, and branding checks. The earlier 39-pass full-suite result above describes the original brand integration rather than this follow-up. Build validation, JavaScript syntax, and whitespace checks also passed.

Actual animation screenshots and sampled frames are saved under ignored `tmp/animation-review/`: [touch intro](../tmp/animation-review/intro-touch-tablet.png), [touch hero entrance](../tmp/animation-review/hero-touch-tablet.png), [touch card section](../tmp/animation-review/cards-touch-tablet.png), and corresponding `motion-*.json` measurements. The initial diagnosis recordings remain in ignored `tmp/loader-review/`. Nothing was deployed, published, or pushed.
