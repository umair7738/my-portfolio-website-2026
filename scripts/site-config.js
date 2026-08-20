const baseUrl = "https://umair-builds.in";

const pages = {
  "index.html": {
    title: "Umair Shaikh | Full Stack Web Developer in Mumbai",
    description: "Portfolio of Umair Shaikh, a full stack web developer in Mumbai building responsive websites, CMS applications, Laravel systems, API integrations, and animation-rich frontend experiences.",
    ogType: "website"
  },
  "about.html": {
    title: "About Umair Shaikh | Full Stack Web Developer in Mumbai",
    description: "Learn about Umair Shaikh's full stack web development background, frontend craft, CMS and application experience, integrations, and performance-focused approach.",
    ogType: "profile"
  },
  "projects.html": {
    title: "Web Development Projects | Umair Shaikh",
    description: "Explore 17 real-world web projects by Umair Shaikh across education, commerce, creative, corporate, industrial, and campaign work.",
    ogType: "website"
  },
  "case-studies.html": {
    title: "Web Development Case Studies | Umair Shaikh",
    description: "Read transparent case-study notes on Umair Shaikh's WordPress, custom frontend, landing page, and campaign work, with verified scope and honest outcomes.",
    ogType: "article"
  },
  "services.html": {
    title: "Web Development Services | Umair Shaikh",
    description: "Explore web development services by Umair Shaikh, including responsive websites, WordPress, Laravel, APIs, payment integrations, performance, and maintenance.",
    ogType: "website"
  },
  "skills.html": {
    title: "Full Stack Developer Skills | Umair Shaikh",
    description: "Explore Umair Shaikh's verified frontend, PHP framework, WordPress, database, API, payments, GSAP, performance, SEO, and application toolkit.",
    ogType: "website"
  },
  "experience.html": {
    title: "Full Stack Web Development Experience | Umair Shaikh",
    description: "Review Umair Shaikh's resume-backed full stack experience across Laravel, WordPress, operational systems, APIs, payments, performance, SEO, and deployment.",
    ogType: "website"
  },
  "contact.html": {
    title: "Contact Umair Shaikh | Full Stack Web Developer",
    description: "Contact Mumbai-based full stack web developer Umair Shaikh about frontend roles, responsive websites, WordPress, Laravel systems, APIs, and web projects.",
    ogType: "website"
  },
  "privacy.html": {
    title: "Privacy Policy | Umair Shaikh",
    description: "Read how Umair Shaikh's portfolio handles contact form enquiries, local preferences, third-party services, and external links.",
    ogType: "website"
  }
};

const indexablePages = Object.keys(pages);
const sitemapPages = indexablePages.filter((file) => file !== "privacy.html");

function pageUrl(file) {
  return file === "index.html" ? `${baseUrl}/` : `${baseUrl}/${file}`;
}

module.exports = { baseUrl, pages, indexablePages, sitemapPages, pageUrl };
