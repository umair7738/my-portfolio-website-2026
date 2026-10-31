const baseUrl = "https://umair-builds.in";
const siteName = "Umair Builds";

const pages = {
  "index.html": {
    title: "Umair Shaikh | Full Stack Web Developer | PHP, Laravel, WordPress",
    description: "Umair Shaikh is a full stack web developer building responsive websites, Laravel/PHP applications, WordPress sites, APIs, and integrations. Available for remote collaboration worldwide.",
    ogType: "website"
  },
  "about.html": {
    title: "About Umair Shaikh | Full Stack Web Developer | PHP, Laravel, WordPress",
    description: "About Umair Shaikh — full stack web developer with experience at Nexgeno Technology Pvt. Ltd. (Jan 2023 – Aug 2026). PHP, Laravel, WordPress, APIs, integrations, and performance-focused development. Currently available in Dubai, UAE for remote work.",
    ogType: "profile"
  },
  "projects.html": {
    title: "Web Development Projects | Umair Shaikh",
    description: "Explore 17 documented web projects by Umair Shaikh, including WordPress websites, responsive frontends and business landing pages, with live and archived records.",
    ogType: "website"
  },
  "case-studies.html": {
    title: "Web Development Case Studies | Umair Shaikh",
    description: "Explore verified web development case studies: UTC India WordPress catalogue, Atyaf Al Majd frontend and Octa Networks landing pages by Umair Shaikh.",
    ogType: "article"
  },
  "services.html": {
    title: "Full Stack Web Development Services | PHP, Laravel, WordPress | Umair Shaikh",
    description: "Web development services by Umair Shaikh: WordPress, WooCommerce, PHP/Laravel CRM, payment gateways and API integrations. Remote UAE and India.",
    ogType: "website"
  },
  "wordpress-developer-mumbai.html": {
    title: "WordPress Developer in Mumbai | Umair Shaikh",
    description: "WordPress developer serving Mumbai businesses remotely. Explore WordPress websites, product catalogues, and content-managed pages by Umair Shaikh, currently in Dubai.",
    ogType: "website"
  },
  "laravel-crm-development.html": {
    title: "Remote Laravel & CRM Developer for UAE and India | Umair Shaikh",
    description: "Laravel and CRM development for teams in India and the UAE, delivered remotely from Dubai. Explore workflows, integrations, relevant experience, and project scope.",
    ogType: "website"
  },
  "skills.html": {
    title: "Full Stack Web Developer Skills | Umair Shaikh",
    description: "Umair Shaikh’s full stack web developer skills: Laravel, WordPress plugins, WooCommerce, MySQL, payment webhooks, hosting and JavaScript. Explore real implementation examples.",
    ogType: "website"
  },
  "experience.html": {
    title: "Full Stack Web Developer Experience | Umair Shaikh | Nexgeno Technology",
    description: "Umair Shaikh's full stack web development experience at Nexgeno Technology Pvt. Ltd. (Jan 2023 – Aug 2026). PHP, Laravel, WordPress, APIs, payments, RBAC, performance, and SEO. Currently available in Dubai, UAE.",
    ogType: "website"
  },
  "contact.html": {
    title: "Contact Umair Shaikh | Full Stack Web Developer | Hire for Remote Roles & Projects",
    description: "Contact Umair Shaikh about full-stack/frontend roles, Laravel/PHP, WordPress, APIs, and web projects. Available for remote work in Dubai, UAE and worldwide.",
    ogType: "website"
  },
  "privacy.html": {
    title: "Privacy Policy | Umair Shaikh",
    description: "Read how Umair Shaikh's portfolio handles contact form enquiries, local preferences, third-party services, and external links.",
    ogType: "website"
  }
};

// Legal/policy pages remain accessible to users and crawlers, but are not useful
// search landing pages. Keep them out of the index and XML sitemap.
const indexablePages = Object.keys(pages).filter((file) => file !== "privacy.html");
const sitemapPages = indexablePages;
// Update a date only after a significant change to that page's content or links.
// Dates reflect each page's verified most-recent substantive change (body content,
// structured data, or page title/description), excluding footer-only consent text,
// asset-hash bumps, and accessibility-attribute changes. Metadata-only rebuilds
// do not bump lastmod. Uncommitted SEO-pass content is treated as current.
const sitemapLastmod = {
  "index.html": "2026-10-31",
  "about.html": "2026-11-01",
  "projects.html": "2026-11-01",
  "case-studies.html": "2026-11-01",
  "services.html": "2026-11-01",
  "wordpress-developer-mumbai.html": "2026-10-29",
  "laravel-crm-development.html": "2026-11-01",
  "skills.html": "2026-11-01",
  "experience.html": "2026-11-01",
  "contact.html": "2026-11-01"
};

function pageUrl(file) {
  return file === "index.html" ? `${baseUrl}/` : `${baseUrl}/${file}`;
}

module.exports = { baseUrl, siteName, pages, indexablePages, sitemapPages, sitemapLastmod, pageUrl };
