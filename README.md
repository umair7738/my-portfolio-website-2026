# Umair Shaikh — Portfolio

A production-oriented, multi-page personal portfolio built as a premium software-company-style experience. Current experience and skills are grounded in Umair Shaikh's June 2026 resume; the named project archive is supported by the earlier February 2024 resume. Undocumented metrics, testimonials, certificates, and work history are not fabricated.

Production website: `https://umair-builds.in/`

## Stack

- HTML5 and CSS3
- Bootstrap 5.3
- jQuery 3.7
- GSAP 3.13 with ScrollTrigger
- Lenis smooth scrolling
- Lucide icons
- Self-hosted Manrope and Space Grotesk variable fonts
- EmailJS browser SDK (loaded only when a contact form is submitted)

No React, Vue, Angular, Tailwind, TypeScript, or framework build step is used.

## Local preview

Use an HTTP server so local links, component fallbacks, and browser navigation behave like production.

```bash
npx serve .
```

PHP is also suitable:

```bash
php -S localhost:8080
```

## Content and structure

- `index.html` — home and overview
- `about.html` — story, philosophy, strengths, and career snapshot
- `projects.html` — searchable and filterable resume-listed project archive
- `case-studies.html` — transparent case-study notes with evidence boundaries
- `services.html` — service catalogue and engagement models
- `skills.html` — resume-verified technology groups
- `experience.html` — professional timeline and education
- `contact.html` — validated enquiry form, email, phone, WhatsApp, and LinkedIn
- `privacy.html`, `404.html`, `robots.txt`, and `sitemap.xml` — production support pages
- `components/` — reusable fragments loaded by the pages at runtime
- `llms.txt` — optional human-readable orientation file for answer engines and agents; it is not treated as a ranking signal
- `data/projects.js` — browser/Node-compatible public source of truth for the 17-project archive
- `data/project-audit.json` — internal evidence, availability, observed fingerprints, and reviewed capture records; never deployed
- `assets/js/` — modular site, animation, project, navigation, loader, and form logic
- `assets/css/` — design system, animation helpers, and responsive rules
- `scripts/site-config.js` — production domain and page metadata source of truth
- `.htaccess` — Hostinger/Apache redirects, custom 404 handling, security headers, and asset caching

## Production build

Hostinger's GitHub deployment publishes the repository root to `public_html`, so deploy the root-level site files. The HTML pages load shared components from `components/` in the browser.

Run `npm run build` to normalize production metadata, rebuild the CSS and JavaScript bundles, and validate the source site. This build is deterministic and performs no external availability checks, technology fingerprinting, or screenshot capture.

Use `npm run serve` for a local HTTP preview.

## Umair Builds brand assets

The shared header uses one theme-selected horizontal logo; the footer always uses the approved white-text variant on its dark surface. The header follows the saved `portfolio-theme` preference, independently of the operating system. `assets/brand/` contains only the lossless WebP logo sizes, PNG fallbacks, and supplied favicon PNGs used by the site; the supplied multi-size ICO is at `/favicon.ico`.

`npm run build` updates logo and favicon references with the same 12-character content-hash query convention as the CSS/JS bundles. The build uses checked-in optimized files and does not require the original logo kit. Keep `components/`, the root HTML files, `/favicon.ico`, and `assets/` together when preparing the Hostinger files.

To regenerate derivatives locally, retain the approved `Umair_Builds_Website_Logo_Kit/` folder and run `npm run optimize:brand`, followed by `npm run build`. The exporter removes only fully transparent outer padding and preserves the approved pixels; it does not recreate the identity. The original kit, `tmp/` screenshots/review artifacts, tests, tooling, and internal evidence files are not public deployment assets. The kit is ignored by Git and must not be manually uploaded.

Run `npx playwright test tests/branding.spec.js --workers=1` for the theme, navigation-clearance, image-request, favicon, and responsive checks. The desktop project runs the explicit 320/375/390/768/992/1024/1199/1440px matrix in both themes and writes review screenshots under ignored `tmp/brand-review/`. The exports retain minor softness and edge roughness inherited from the supplied raster extraction, especially in the dark variant at high pixel density; no vector artwork or print-quality reconstruction is claimed.

## Project evidence and snapshots

Public roles, dates, descriptions, and delivery technologies must cite entries in `data/project-audit.json`. Separately labeled public-site technology audits may publish reviewed signals from a live domain, with their audit date and confidence, without presenting those signals as Umair's delivery record.

Reviewed project images are generated separately from the production build:

```bash
npm run capture:projects
npm run capture:projects -- --slug=infinity-learning-academy --force
npm run capture:projects -- --slug=sagar-speciality-chemicals --include-manual --force
```

The opt-in capture command uses local Chrome and Sharp, records redirected URLs and SHA-256 checksums, saves raw PNGs under ignored `tmp/project-snapshots/`, and writes optimized AVIF/WebP variants under `assets/images/projects/`. Review every capture before publishing. If a site cannot be captured honestly, use an explicitly labeled archive treatment instead of reconstructing it.

The review-only technology audit writes a candidate report under `tmp/` and never edits public project data:

```bash
npm run audit:projects
```

## Archive tests

Run the responsive, filter, status, link, and accessibility regression suite against the root-level site with system Chrome:

```bash
npm run test:projects
```

## Before public launch

1. Review the public September 2026 resume PDF whenever experience or profile links change.
2. Change `scripts/site-config.js` if the production domain or per-page metadata changes.
3. Keep the verified GitHub, CodePen, and LinkedIn URLs in `assets/js/utilities.js` current.
4. Review the EmailJS service and template configuration if the enquiry workflow changes. The site itself does not store submissions in a database.
5. Re-run accessibility, responsive, and performance checks after any third-party analytics or form integration is added.

## Accessibility and motion

The site includes semantic landmarks, skip links, keyboard-visible focus states, ARIA labels, accessible form validation, contrast-aware light/dark themes, and a complete `prefers-reduced-motion` path. Decorative motion and custom cursor behavior are disabled for reduced-motion and coarse-pointer users.

## SEO

Every indexable page includes a unique title, description, canonical link, social metadata, heading hierarchy, internal navigation, and page-appropriate JSON-LD. The project archive uses `CreativeWork`/`ItemList`; the case studies use `Article`; the contact page uses `ContactPage`; breadcrumbs are included throughout.

The services page describes remote availability for UAE and international projects from Mumbai, India; it does not claim a Dubai office, UAE registration, or UAE client history.

## Analytics

GA4 is configured as an opt-in measurement path using the existing `G-6J1PG2GSNQ` property. The Google tag is not loaded until a visitor chooses “Allow analytics”; choosing “Not now” stores a local denial and keeps analytics unloaded. The router records one page-view event per initial load and client-side route change when `gtag` is present. `data-analytics-event` hooks cover resume downloads, WhatsApp clicks, and quote requests; each successful EmailJS submission emits one GA4 `generate_lead` event. Events use `send_page_view: false`, IP anonymization, and disabled Google signals/ad personalization. Review the privacy notice and measurement property before changing the consent behavior.
