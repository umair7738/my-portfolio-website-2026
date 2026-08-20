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
- `components/` — reusable fragments and card templates compiled into deployment HTML
- `assets/js/` — modular site, animation, project, navigation, loader, and form logic
- `assets/css/` — design system, animation helpers, and responsive rules
- `scripts/site-config.js` — production domain and page metadata source of truth
- `dist/` — fully composed Hostinger-ready output with crawlable navigation, content, and footer
- `.htaccess` — Hostinger/Apache redirects, custom 404 handling, security headers, and asset caching

## Production build

Run `npm run build`. It normalizes production metadata, builds the CSS and JavaScript bundles, composes reusable fragments and project/service data into complete HTML pages, copies the Hostinger configuration, and validates both source and `dist/`.

## Before public launch

1. Review the public June 2026 resume PDF whenever experience or profile links change.
2. Change `scripts/site-config.js` if the production domain or per-page metadata changes.
3. Keep the verified GitHub, CodePen, and LinkedIn URLs in `assets/js/utilities.js` current.
4. Review the EmailJS service and template configuration if the enquiry workflow changes. The site itself does not store submissions in a database.
5. Re-run accessibility, responsive, and performance checks after any third-party analytics or form integration is added.

## Accessibility and motion

The site includes semantic landmarks, skip links, keyboard-visible focus states, ARIA labels, accessible form validation, contrast-aware light/dark themes, and a complete `prefers-reduced-motion` path. Decorative motion and custom cursor behavior are disabled for reduced-motion and coarse-pointer users.

## SEO

Every indexable page includes a unique title, description, canonical link, social metadata, heading hierarchy, internal navigation, and page-appropriate JSON-LD. The project archive uses `CreativeWork`/`ItemList`; the case studies use `Article`; the contact page uses `ContactPage`; breadcrumbs are included throughout.
