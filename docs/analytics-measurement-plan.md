# Analytics, search, and conversion measurement plan

Date: 30 October 2026
Scope: local Batch 2 implementation. This document does not represent a live GA4, Search Console, Bing, or Looker Studio connection.

## Measurement rules

- GA4 loads only when the visitor has granted `portfolio-analytics-consent`.
- Every custom event includes `page_path`; optional values are restricted to `audience`, `contact_method`, `failure_stage`, `link_location`, `project_slug`, and `service_slug`.
- Values must be short, alphanumeric labels. Names, email addresses, phone numbers, company names, and message text are never passed to GA4.
- `generate_lead` is reserved for a completed EmailJS submission. Clicks and submit attempts are interactions, not confirmed leads.
- `profile_download` is retained as the existing GA4 event name for the downloadable professional profile/resume, preserving historical continuity.

## Event matrix

| Event | Status | Trigger | Safe parameters |
| --- | --- | --- | --- |
| `page_view` | Existing, retained | Initial opted-in page and each Barba route change | `page_path`, `page_title` |
| `profile_download` | Existing, normalized | Hero professional-profile PDF download | `audience=recruiter`, `link_location=hero` |
| `whatsapp_click` | Existing, normalized | Contact-page or floating WhatsApp link | `audience=freelance`, `link_location` |
| `quote_request` | Existing, retained | High-intent service-page CTA | `audience=freelance`, `service_slug`, `link_location` where present |
| `generate_lead` | Existing, normalized | EmailJS resolves successfully | `service_slug` only |
| `email_click` | New | Footer or mobile-navigation email action | `contact_method=email`, `link_location` |
| `linkedin_click` | New | Footer LinkedIn action | `audience=recruiter`, `link_location=footer` |
| `service_cta_click` | New | A service-card “Discuss this service” action | `service_slug`, `link_location=service_card` |
| `project_view` | New | Intentional project-card visual, title, live-site, or case-study click | `project_slug`, `link_location=project_card` |
| `recruiter_contact_click` | New | Contact-page recruiter email action | `audience=recruiter`, `contact_method=email`, `link_location=contact_page` |
| `contact_navigation` | New | General internal navigation to the contact page not already classified above | `link_location=internal_navigation` |
| `contact_form_start` | New | First focus in a contact form instance | `page_path` |
| `contact_form_submit_attempt` | New | Every intercepted form submission attempt | `page_path` |
| `contact_form_submit_failed` | New | Validation, configuration, or EmailJS delivery failure | `failure_stage`, `page_path` |

`resume_download` is deliberately not emitted in addition to `profile_download`: both describe the same PDF interaction and dual tracking would inflate the count. `contact_form_submit` is not used; `generate_lead` is the outcome event after delivery succeeds.

## Conversion paths

| Audience | Interaction signals | Confirmed outcome |
| --- | --- | --- |
| Freelance | `service_cta_click`, `quote_request`, `whatsapp_click`, `contact_form_start` | `generate_lead` after successful EmailJS delivery |
| Recruiters | `profile_download`, `linkedin_click`, `recruiter_contact_click` | No lead is inferred from an interaction; assess qualified conversations in the lead sheet |
| General visitors | `project_view`, `contact_navigation` | None |

## Consent and withdrawal behavior

Before opt-in there is no GA4 request. On opt-in, GA4 is configured once with automatic page views disabled, and the current page view is sent once. A denied state leaves it unloaded. The footer's Manage analytics preferences control can revoke or re-enable consent in the current session: revocation sends GA4 Consent Mode denial updates, and custom event/page-view calls become no-ops. Already fetched scripts and data previously transmitted are not claimed to be removed.

## Search and dashboard specification

The October 2026 baseline of **20 impressions and 2 clicks** is user-supplied historical evidence, not a current performance claim.

Use free Looker Studio only after the following connections test successfully:

1. Google Search Console: verified `umair-builds.in` domain property, sitemap submitted, and Search Console connector authorized.
2. GA4: confirm measurement ID `G-6J1PG2GSNQ` belongs to the intended property and authorize the connector.
3. A manual Google Sheet with two tabs: `ai_visibility_log` (date, query group, query, engine, cited URL, result, observation) and `qualified_leads` (date, audience, source, qualified, outcome). Do not put contact-form PII in the sheet.

Build these dashboard pages after connection testing: executive overview; search performance; branded versus non-branded keywords; country and device performance; freelance conversions; recruiter conversions; landing-page performance; AI identity and citation observations; technical indexing health; and priority actions. Search pages should cover impressions, clicks, CTR, average position, country, device, query group, page indexing, and sitemap status. Use an AI-performance card only when an official Search Console dimension/report is available; otherwise label the manual log as observational.

## Manual external setup and checks

1. In Google Search Console, verify the domain using an approved ownership method, submit `https://umair-builds.in/sitemap.xml`, inspect the indexed pages and sitemap report, then save query/country/device exports.
2. In Bing Webmaster Tools, verify the same domain through an approved method, submit the sitemap, and review search performance and Index Explorer. Do not add unverified meta tags or tokens to this repository.
3. In GA4 DebugView, opt in on a non-production test session and verify one page view, one event per click, one successful `generate_lead`, and a separate safe failure event. This local implementation has not been verified in the remote DebugView.
4. Define GA4 key events only after reviewing the property: `generate_lead` is the appropriate form-success candidate; interaction events remain diagnostic unless the business deliberately promotes one.
