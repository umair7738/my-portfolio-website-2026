(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.projectData = [
    {
      title: "UTC India",
      category: "wordpress",
      categoryLabel: "WordPress",
      year: "Resume project",
      image: "assets/images/project-utc-india.webp",
      imageAlt: "Stylized browser preview for the UTC India WordPress project",
      description: "A product-led WordPress website for UTC India's insulated ware and kitchen product catalogue.",
      tags: ["WordPress", "Frontend", "Product catalogue"],
      role: "WordPress build",
      host: "utcindia.co",
      liveUrl: "https://utcindia.co/",
      caseStudyUrl: "case-studies.html#utc-india"
    },
    {
      title: "Atyaf Al Majd",
      category: "frontend",
      categoryLabel: "Custom frontend",
      year: "Resume project",
      image: "assets/images/project-atyaf.webp",
      imageAlt: "Stylized browser preview for the Atyaf Al Majd website project",
      description: "A custom business website developed from scratch with a responsive Bootstrap frontend.",
      tags: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      role: "Frontend development",
      host: "atyafalmajd.com",
      liveUrl: "https://www.atyafalmajd.com/",
      caseStudyUrl: "case-studies.html#atyaf-al-majd"
    },
    {
      title: "CCIE Security Training",
      category: "landing-page",
      categoryLabel: "Landing page",
      year: "Resume project",
      image: "assets/images/project-ccie.webp",
      imageAlt: "Stylized browser preview for the Octa Networks CCIE Security training landing page",
      description: "A focused training landing page created for Octa Networks' CCIE Security offering.",
      tags: ["Landing page", "Frontend", "Responsive UI"],
      role: "Landing page development",
      host: "octanetworks.com",
      liveUrl: "https://octanetworks.com/ccie-security_v6.1_training",
      caseStudyUrl: "case-studies.html#campaign-pages"
    },
    {
      title: "Diwali Sale 2023",
      category: "campaign",
      categoryLabel: "Campaign design",
      year: "2023",
      image: "assets/images/project-diwali.webp",
      imageAlt: "Stylized browser preview for the Octa Networks Diwali Sale 2023 campaign page",
      description: "A seasonal campaign landing page designed and developed for Octa Networks.",
      tags: ["UI design", "Frontend", "Campaign"],
      role: "Design & development",
      host: "octanetworks.com",
      liveUrl: "https://octanetworks.com/diwali-sale-2023",
      caseStudyUrl: "case-studies.html#campaign-pages"
    },
    {
      title: "Christmas Campaign",
      category: "campaign",
      categoryLabel: "Campaign design",
      year: "Resume project",
      image: "assets/images/project-christmas.webp",
      imageAlt: "Stylized browser preview for the Octa Networks Christmas campaign page",
      description: "A festive landing-page experience designed and developed for a seasonal campaign.",
      tags: ["UI design", "Landing page", "Frontend"],
      role: "Design & development",
      host: "octanetworks.com",
      liveUrl: "https://octanetworks.com/christmas-page",
      caseStudyUrl: "case-studies.html#campaign-pages"
    },
    {
      title: "Equity Exchange Academy",
      category: "frontend",
      categoryLabel: "Website design",
      year: "Resume project",
      image: "assets/images/project-equity.webp",
      imageAlt: "Stylized browser preview for the Equity Exchange Academy website project",
      description: "A financial education website designed and developed to present the academy online.",
      tags: ["Website design", "Frontend", "Responsive UI"],
      role: "Design & development",
      host: "equityexchangeacademy.in",
      liveUrl: "https://equityexchangeacademy.in/",
      caseStudyUrl: "case-studies.html#other-work"
    },
    {
      title: "Bride is Pride",
      category: "wordpress",
      categoryLabel: "WordPress",
      year: "Resume project",
      image: "assets/images/project-bride.webp",
      imageAlt: "Stylized browser preview for the Bride is Pride WordPress project",
      description: "Internal WordPress pages designed and developed as part of the wider website experience.",
      tags: ["WordPress", "Internal pages", "Frontend"],
      role: "Internal page development",
      host: "brideispride.com",
      liveUrl: "https://brideispride.com/",
      caseStudyUrl: "case-studies.html#other-work"
    }
  ];

  Portfolio.serviceData = [
    { title: "Business Websites", icon: "building-2", description: "Clean, responsive websites that communicate value clearly and establish trust quickly.", items: ["Responsive frontend", "Clear information architecture", "Conversion-ready content"], group: "web" },
    { title: "Landing Pages", icon: "panel-top", description: "Focused campaign and lead-generation pages built around one clear action.", items: ["Campaign UI", "Responsive build", "CTA hierarchy"], group: "web" },
    { title: "WordPress Development", icon: "layout-template", description: "Content-manageable WordPress builds and page development for business teams.", items: ["Website builds", "Internal pages", "Content updates"], group: "cms" },
    { title: "Custom Theme Development", icon: "paintbrush", description: "Brand-aligned WordPress presentation with purposeful reusable sections.", items: ["Custom page layouts", "Responsive styling", "Editor-friendly structure"], group: "cms" },
    { title: "Custom Plugin Development", icon: "blocks", description: "Scoped WordPress functionality planned around a clear business requirement.", items: ["Feature planning", "PHP implementation", "Maintainable setup"], group: "cms" },
    { title: "Laravel Development", icon: "route", description: "Structured Laravel interfaces and web application work backed by PHP skills.", items: ["Application UI", "PHP workflows", "Database-backed features"], group: "application" },
    { title: "PHP Development", icon: "code-xml", description: "Practical backend and website functionality using PHP and database foundations.", items: ["Dynamic pages", "Form workflows", "MySQL integration"], group: "application" },
    { title: "CRM Systems", icon: "contact-round", description: "Custom interface work for business operations, planned to the actual workflow.", items: ["Workflow mapping", "Role-aware interfaces", "Reporting views"], group: "systems" },
    { title: "HRMS Interfaces", icon: "users-round", description: "Clear operational interfaces for employee and HR workflows.", items: ["Employee records", "Process screens", "Responsive dashboards"], group: "systems" },
    { title: "Property Management", icon: "house", description: "Web interfaces for presenting and managing property information.", items: ["Property records", "Search experiences", "Responsive listings"], group: "systems" },
    { title: "API Integration", icon: "unplug", description: "Connect web experiences to external data and services through scoped integrations.", items: ["Data mapping", "Frontend integration", "Error handling"], group: "integration" },
    { title: "Payment Gateway Integration", icon: "credit-card", description: "Payment-flow implementation planned around provider requirements and secure handoff.", items: ["Checkout UI", "Gateway workflow", "Status handling"], group: "integration" },
    { title: "Speed Optimization", icon: "gauge", description: "Performance improvements informed by PageSpeed diagnostics and frontend best practices.", items: ["Asset optimization", "Rendering improvements", "Core Web Vitals focus"], group: "growth" },
    { title: "SEO Optimization", icon: "search-check", description: "Technical and on-page foundations that make websites easier to discover and understand.", items: ["Semantic structure", "Metadata", "Performance alignment"], group: "growth" },
    { title: "GSAP Animated Websites", icon: "sparkles", description: "Purposeful motion systems that add clarity, polish, and character without sacrificing usability.", items: ["ScrollTrigger", "Micro-interactions", "Reduced-motion support"], group: "web" },
    { title: "Website Maintenance", icon: "shield-check", description: "Ongoing care for content, presentation, compatibility, and frontend quality.", items: ["Content changes", "UI upkeep", "Compatibility checks"], group: "support" },
    { title: "Bug Fixing", icon: "bug", description: "Focused troubleshooting for broken layouts, interactions, and website functionality.", items: ["Issue diagnosis", "Frontend fixes", "Regression checks"], group: "support" },
    { title: "Website Redesign", icon: "refresh-cw", description: "Modernize an existing site around stronger hierarchy, usability, and performance.", items: ["UX review", "Visual refresh", "Responsive rebuild"], group: "web" }
  ];

  Portfolio.Projects = {
    renderProjects() {
      const container = document.querySelector("[data-projects-grid]");
      const template = document.querySelector("#project-card-template");
      if (!container || !template) return;
      const limit = Number(container.dataset.projectLimit || Portfolio.projectData.length);
      container.innerHTML = Portfolio.projectData.slice(0, limit).map(function (project, index) {
        const tags = project.tags.map(function (tag) { return "<li>" + Portfolio.utils.escapeHtml(tag) + "</li>"; }).join("");
        const links = '<a href="' + project.liveUrl + '" target="_blank" rel="noopener">Live site <i data-lucide="external-link" aria-hidden="true"></i></a>' +
          '<a href="' + project.caseStudyUrl + '">Case study <i data-lucide="arrow-right" aria-hidden="true"></i></a>';
        const values = {
          "{{category}}": project.category,
          "{{search}}": [project.title, project.description, project.tags.join(" "), project.categoryLabel].join(" ").toLowerCase(),
          "{{caseStudyUrl}}": project.caseStudyUrl,
          "{{title}}": project.title,
          "{{image}}": project.image,
          "{{imageAlt}}": project.imageAlt,
          "{{index}}": String(index + 1).padStart(2, "0"),
          "{{host}}": project.host,
          "{{categoryLabel}}": project.categoryLabel,
          "{{year}}": project.year,
          "{{description}}": project.description,
          "{{tags}}": tags,
          "{{links}}": links
        };
        return Object.keys(values).reduce(function (html, token) { return html.split(token).join(values[token]); }, template.innerHTML);
      }).join("");
    },

    renderServices() {
      const container = document.querySelector("[data-services-grid]");
      const template = document.querySelector("#service-card-template");
      if (!container || !template) return;
      const limit = Number(container.dataset.serviceLimit || Portfolio.serviceData.length);
      container.innerHTML = Portfolio.serviceData.slice(0, limit).map(function (service, index) {
        const items = service.items.map(function (item) { return "<li>" + Portfolio.utils.escapeHtml(item) + "</li>"; }).join("");
        const values = {
          "{{icon}}": service.icon,
          "{{number}}": String(index + 1).padStart(2, "0"),
          "{{title}}": service.title,
          "{{description}}": service.description,
          "{{items}}": items,
          "{{slug}}": Portfolio.utils.slugify(service.title)
        };
        return Object.keys(values).reduce(function (html, token) { return html.split(token).join(values[token]); }, template.innerHTML);
      }).join("");
    },

    initFilters() {
      const grid = document.querySelector("[data-projects-grid]");
      if (!grid || !document.querySelector("[data-project-filter]")) return;
      let activeCategory = "all";
      let query = "";

      const apply = function () {
        let visible = 0;
        grid.querySelectorAll(".project-card").forEach(function (card) {
          const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
          const searchMatch = !query || card.dataset.search.includes(query);
          const show = categoryMatch && searchMatch;
          card.hidden = !show;
          if (show) visible += 1;
        });
        const empty = document.querySelector("[data-project-empty]");
        if (empty) empty.style.display = visible ? "none" : "block";
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      };

      document.querySelectorAll("[data-project-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
          document.querySelectorAll("[data-project-filter]").forEach(function (item) { item.classList.remove("active"); item.setAttribute("aria-pressed", "false"); });
          button.classList.add("active");
          button.setAttribute("aria-pressed", "true");
          activeCategory = button.dataset.projectFilter;
          apply();
        });
      });

      const search = document.querySelector("[data-project-search]");
      if (search) search.addEventListener("input", function () { query = search.value.trim().toLowerCase(); apply(); });
    },

    init() {
      this.renderProjects();
      this.renderServices();
      this.initFilters();
    }
  };
})(window);
