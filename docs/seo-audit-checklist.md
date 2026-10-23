# Site audit checklist

Audit reviewed: 23 October 2026. The audit crawled 10 pages and reported a score of 36/100.

Status meanings:

- [ ] To do
- [~] Present in the local source; deploy and verify on the live site
- [-] Optional or low priority

## 1. Launch and security - do first

- [x] Confirm that `http://umair-builds.in/*` returns a single `301` redirect to `https://umair-builds.in/*`.
  - Verified on the live site on 23 October 2026.
- [~] Add clickjacking protection at the hosting/server level.
  - `Content-Security-Policy: frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN` are now in `.htaccess`; deploy and verify the response headers.
- [x] Verify that every HTML page is served with `Content-Type: text/html`.
  - Verified for the live homepage on 23 October 2026.
- [x] Check the page whose canonical URL differs from its crawled URL.
  - The homepage canonical intentionally uses `/` rather than `/index.html`; the redirect prevents this duplicate URL from remaining accessible.

## 2. Indexing and discoverability

- [ ] Open the audit's **Orphan URLs** issue and identify the one affected page.
- [ ] Add at least one ordinary internal link to that page from a relevant page or the footer/navigation.
- [ ] In Google Search Console, submit `https://umair-builds.in/sitemap.xml` and inspect all submitted URLs.
- [ ] Request indexing for the important pages after deployment: Home, About, Projects, Case Studies, Services, Skills, Experience, and Contact.
- [ ] Investigate the six URLs with zero impressions in Search Console. This is a visibility signal, not a technical error by itself.
- [ ] Add natural contextual links between related pages, especially from Home, Projects, Case Studies, Services, and Experience.
- [-] Improve vague one-word link labels where it helps readers (for example, use “View case studies” rather than “More”).
- [-] Avoid adding links merely to reach the tool's “10 internal backlinks” target; a small portfolio does not need artificial link volume.

## 3. Metadata and social sharing

- [x] Confirm canonical URLs.
  - All nine crawlable HTML pages contain self-referencing canonical tags; the homepage was verified live.
- [x] Confirm Twitter/X card tags.
  - All nine crawlable HTML pages contain the required Twitter card tags; Home and About were verified live.
- [x] Shorten the two overlong meta descriptions.
  - Home and About descriptions are now within the typical snippet range.

## 4. Performance

- [ ] Identify the seven pages flagged for JavaScript above 25 KB.
- [ ] Measure real performance with PageSpeed Insights before changing code; retain only scripts that provide visible value.
- [ ] Load non-critical features only where needed; defer or remove unused vendor libraries per page.
- [x] Add `loading="lazy"` and explicit dimensions to below-the-fold images where missing.
  - The remaining two non-lazy case-study images now use lazy loading and asynchronous decoding.
- [ ] Re-test the homepage on mobile and desktop after changes. Baseline audit scores: 79 mobile, 77 desktop.

## 5. HTML and content cleanup

- [ ] Inspect H1/H2 markup on the pages listed by the audit.
  - Headings must not contain block elements such as `div` or `p`.
  - Inline elements such as `span`, `strong`, and `em` are normally acceptable; do not remove them only to satisfy the scanner.
- [-] Use `ul`, `ol`, and `li` only where the content is genuinely a list. Do not add lists just to remove the five “no list markup” notices.
- [-] Move inline `style` attributes to CSS when touching those components; this is maintainability cleanup, not a ranking priority.
- [-] Add Google Tag Manager only if you need it. Google Analytics is already present as an opt-in integration, so GTM is not required for SEO.

## 6. Validation and closeout

- [ ] Deploy the updated site and verify response headers, redirects, canonical URLs, and MIME types on the production domain.
- [ ] Validate the sitemap and robots file in Google Search Console.
- [ ] Re-run Sitechecker after Google and the host have had time to see the deployment.
- [ ] Record the new score and compare only meaningful changes: redirect/security headers, indexed pages, Core Web Vitals, and organic impressions.

## Not currently a problem

- Duplicate content: no issues reported.
- Mobile friendliness: no issues reported.
- XML sitemap: no issues reported.
- Localization: no issues reported.
- Redirect chains: no issues reported.
