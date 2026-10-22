# Portfolio SEO + AI Search Discovery Audit

Date: 17 October 2026  
Site: https://umair-builds.in/  
Scope: source audit, local build, local browser regression, and read-only production HTTP checks. No production deployment or publishing was performed.

## Executive outcome

The portfolio already had a sound static-site foundation: crawlable HTML pages, canonical URLs, a sitemap, robots rules, page-level metadata, self-hosted assets, and mostly appropriate schema. The main discovery weakness was that the highest-value project and service content was assembled only after JavaScript ran, while the project page exposed an empty `ItemList` JSON-LD graph. Analytics also loaded unconditionally despite the README previously saying it was inactive.

The implementation closes those gaps without introducing a framework or changing the existing static HTML/CSS/JS, Bootstrap, jQuery, GSAP, Lenis, or Barba architecture.

## Baseline evidence

| Area | Before | Verification |
| --- | --- | --- |
| Source validation | Passed for 10 source pages | `node scripts/validate-site.js` |
| Project archive | 17 cards existed, but the main archive was JS-generated | `assets/js/projects.js`, `projects.html` |
| Project schema | Empty `@graph` on `projects.html` | Source inspection |
| Service/contact discoverability | Primary grids/form were JS/component-dependent | `services.html`, `contact.html`, component loader |
| Analytics | Unconditional GA4 tag in every page; README said it was not activated | HTML/README comparison |
| Production HTTP | Canonical HTTPS host, redirects, sitemap, robots, security headers, and missing-route 404 were checked read-only | `Invoke-WebRequest`/curl against production |
| Historical performance | 20 August 2026 Lighthouse artifacts: desktop performance 0.75, mobile 0.36–0.37; mobile LCP about 7.25–7.35s and TBT about 1.2–1.27s | `tmp/performance-audit` |

The Lighthouse numbers are dated historical artifacts, not a fresh like-for-like October measurement. The old audit also recorded one blocked Google Fonts console error; the current source uses the site's self-hosted/vendor asset approach.

## Issue register

### P0 — none found

No blocking crawl, canonical, redirect, security-header, sitemap, or broken-route issue was identified in the checked scope.

### P1 — addressed in this change

| Issue | Impact | Resolution |
| --- | --- | --- |
| Empty project `ItemList` JSON-LD | Search engines and answer systems received no project entities from the archive schema | Generated a truthful 17-item `ItemList` from `data/projects.js`, with titles, descriptions, creator, images, and live URLs only where present |
| Project archive depended on JavaScript for its primary records | Limited-JS crawlers and text extractors could miss the portfolio evidence | Added a text-first `<noscript>` archive fallback containing all 17 records and their documented delivery details |
| Service grid and contact form were component/JS-dependent | Core commercial intent and contact paths were less resilient to partial rendering | Added no-JS service-group and direct-contact fallbacks |
| GA4 loaded without a user choice | Privacy/implementation mismatch and unnecessary third-party loading | Replaced it with opt-in loading; `Not now` records denial, and GA4 is not requested until `Allow analytics` |
| Breadcrumb context was implicit rather than visible | Weaker user and machine page hierarchy on interior pages | Added one visible breadcrumb trail to each non-home indexable page |

### P2 — remaining opportunities or external dependencies

| Issue | Why it remains | Next action |
| --- | --- | --- |
| Search Console/Bing verification and indexing evidence | Requires account access and production ownership | Verify the domain, submit `/sitemap.xml`, inspect priority URLs, and record coverage/rich-result results |
| IndexNow key and submission | Requires a generated key and host-level file placement | Generate/store the key, publish the key file, then submit changed URLs if desired |
| AI citation/share-of-voice measurement | No reliable first-party metric was available in the repository | Run a repeatable query set monthly and log cited URLs, answer accuracy, and missing entities |
| Individual case-study URLs | Existing case-study content is consolidated rather than one URL per project | Add only when each page can be supported by real evidence, screenshots, constraints, and outcomes |
| Knowledge hub | No article library exists | Add a small, experience-backed set of technical explainers only if there is genuine material to publish |
| WebMCP/agent actions | Not required for discovery and not present in the static site | Consider only for a future structured contact/project lookup workflow |

## Content and keyword map

| Search intent/entity | Primary page(s) | Evidence boundary |
| --- | --- | --- |
| Umair Shaikh, full stack web developer, Mumbai | `/`, `/about.html`, `/experience.html` | Current portfolio positioning |
| PHP, Laravel, REST APIs, databases | `/skills.html`, `/services.html`, `/experience.html` | Skills and documented work only |
| JavaScript, responsive frontend, GSAP, Lenis | `/`, `/skills.html`, `/projects.html` | Technologies used in the site/project records |
| WordPress, custom websites, integrations | `/services.html`, `/projects.html`, `/case-studies.html` | Service descriptions and documented projects |
| Technical SEO, performance-minded implementation | `/services.html`, `/skills.html`, `/about.html` | Positioning and implementation evidence; no fabricated numeric claims |
| Remote collaboration, international/UAE-friendly delivery | `/services.html`, `/contact.html` | Remote availability from Mumbai; no Dubai office, registration, or client-history claim |
| Project evidence and portfolio proof | `/projects.html`, `/case-studies.html` | Project records and existing case-study content |

## AI-search readiness

Completed:

- Clear canonical identity and consistent person/site links.
- Answer-first homepage section explaining who Umair is and what he builds.
- Stronger entity context on project, case-study, skills, and experience pages.
- Truthful project `ItemList` schema generated from the source data.
- `llms.txt` orientation file with canonical links and explicit evidence boundaries.
- Text-first fallbacks for projects, services, and contact paths.
- Visible breadcrumbs and preserved semantic headings.
- No fabricated metrics, testimonials, certifications, employers, Dubai office, UAE registration, or client results.

Not yet measurable or externally verifiable:

- Search Console/Bing indexing and rich-result status.
- AI answer citations and hallucination rate.
- Conversion lift from the new answer-first content.
- Real-user performance after deployment.

`llms.txt` is treated as a human-readable orientation aid, not a ranking guarantee.

## Analytics and measurement plan

The existing event vocabulary is retained for opted-in GA4: page views, project views, contact-form starts/submits, and outbound contact actions. Recommended reporting:

1. Search Console: impressions, clicks, CTR, average position, indexed pages, excluded pages, and queries grouped by the map above.
2. Bing Webmaster Tools: indexing, crawl issues, queries, and sitemap status.
3. GA4: landing page, engagement, project-detail interaction, contact start, contact submit, and outbound contact action. Compare only opted-in traffic and document the consent rate.
4. AI visibility: use a fixed monthly query set such as “Umair Shaikh full stack developer Mumbai”, “Laravel developer Mumbai Umair Shaikh”, “WordPress API integration developer Mumbai”, and “Umair Shaikh portfolio projects”; record whether the answer cites the correct canonical URL and whether any claim needs correction.
5. Lead quality: track qualified contact conversations separately from raw form submissions; do not infer business outcomes from page analytics alone.

## Manual production setup

1. Deploy the reviewed repository changes through the normal hosting workflow. This task deliberately did not deploy.
2. In Google Search Console, verify the `umair-builds.in` domain property, submit `https://umair-builds.in/sitemap.xml`, then inspect `/`, `/projects.html`, `/services.html`, `/case-studies.html`, and `/contact.html`.
3. In Bing Webmaster Tools, verify the same domain, submit the sitemap, and review crawl/indexing reports.
4. If using IndexNow, generate a key, place the key file at the site root, confirm it is publicly retrievable, and submit only the URLs changed after deployment.
5. In GA4, confirm that measurement ID `G-6J1PG2GSNQ` belongs to the intended property, review retention/data-sharing settings, and confirm the consent wording and regional policy before enabling the opt-in flow in production.
6. Run PageSpeed Insights and Rich Results Test against the deployed pages. Save the results as the October post-deployment baseline.
7. Re-check the canonical host, redirects, headers, sitemap, robots, 404 behavior, form delivery, and contact links after deployment.

## Implementation inventory

- `scripts/build-production.js`: generated project schema, no-JS fallbacks, breadcrumbs, conditional analytics, and privacy-copy build substitutions.
- `scripts/validate-site.js`: validates `llms.txt`, project schema cardinality, fallback records, and fallback markers.
- `assets/js/router.js`: consent state, opt-in GA4 injection, and preserved page/event tracking.
- `components/footer.html`, `assets/css/style.css`, `assets/css/responsive.css`: consent UI and fallback/breadcrumb styling.
- `index.html`, `projects.html`: answer-first homepage content and project fallback/schema hooks.
- `README.md`, `privacy.html`: analytics behavior and privacy wording aligned with the implementation.
- `llms.txt`: concise machine/reader orientation file.
- Generated `*.html`, `assets/css/portfolio.min.css`, and `assets/js/portfolio.min.js`: rebuilt production artifacts.

## Validation and before/after deltas

| Check | Before | After |
| --- | --- | --- |
| Repository validator | Pass | Pass |
| Playwright regression | 21 passed, 3 skipped | 21 passed, 3 skipped; 24 total tests |
| Project schema | Empty graph | 17-item `ItemList` |
| Project no-JS records | 0 text-first archive records | 17 fallback records |
| Interior breadcrumbs | Not present as visible page trails | Exactly one on each non-home indexable page |
| Analytics loading | Unconditional | Explicit opt-in only |
| Production changes | Not requested/performed | Still not deployed |

Final local commands run:

```text
node scripts/build-production.js
node scripts/validate-site.js
node --check scripts/build-production.js
node --check assets/js/router.js
Playwright regression: 24 tests, 21 passed, 3 skipped
```

