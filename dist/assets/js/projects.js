(function (window) {
  "use strict";

  const Portfolio = window.Portfolio = window.Portfolio || {};

  Portfolio.serviceData = [
    { title: "Business Websites", icon: "building-2", description: "Clean, responsive websites that communicate value clearly and establish trust quickly.", items: ["Responsive frontend", "Clear information architecture", "Conversion-ready content"], group: "web" },
    { title: "Landing Pages", icon: "panel-top", description: "Focused campaign and lead-generation pages built around one clear action.", items: ["Campaign UI", "Responsive build", "CTA hierarchy"], group: "web" },
    { title: "WordPress Development", icon: "layout-template", description: "Content-manageable WordPress builds and page development for business teams.", items: ["Website builds", "Internal pages", "Content updates"], group: "cms" },
    { title: "Custom Theme Development", icon: "paintbrush", description: "Brand-aligned WordPress presentation with purposeful reusable sections.", items: ["Custom page layouts", "Responsive styling", "Editor-friendly structure"], group: "cms" },
    { title: "Custom Plugin Development", icon: "blocks", description: "Scoped WordPress functionality planned around a clear business requirement.", items: ["Feature planning", "PHP implementation", "Maintainable setup"], group: "cms" },
    { title: "Laravel Development", icon: "route", description: "Structured PHP applications using Laravel, ORM patterns, databases, permissions, and integrations.", items: ["Application workflows", "ORM architecture", "Database-backed features"], group: "application" },
    { title: "PHP Development", icon: "code-xml", description: "Application development across PHP, Laravel, CodeIgniter, and Yii Framework.", items: ["Dynamic applications", "Framework workflows", "SQL / MySQL integration"], group: "application" },
    { title: "CRM Systems", icon: "contact-round", description: "Laravel CRM systems shaped around business operations and role-aware workflows.", items: ["Workflow mapping", "Role-based access", "Operational interfaces"], group: "systems" },
    { title: "HRMS Interfaces", icon: "users-round", description: "Employee-management and permission systems with attendance and time-punching API integration.", items: ["Employee workflows", "RBAC", "Attendance integrations"], group: "systems" },
    { title: "Property Management", icon: "house", description: "Laravel property management systems and responsive operational interfaces.", items: ["Property records", "Business workflows", "Responsive application UI"], group: "systems" },
    { title: "API Integration", icon: "unplug", description: "REST APIs, webhooks, Shipway, attendance devices, and third-party location data services.", items: ["REST & webhooks", "Shipment tracking", "External data services"], group: "integration" },
    { title: "Payment Gateway Integration", icon: "credit-card", description: "Documented payment integration experience with Stripe, Razorpay, PayU, and webhook handling.", items: ["Stripe", "Razorpay & PayU", "Webhook workflows"], group: "integration" },
    { title: "Speed Optimization", icon: "gauge", description: "Performance improvements informed by PageSpeed diagnostics and frontend best practices.", items: ["Asset optimization", "Rendering improvements", "Core Web Vitals focus"], group: "growth" },
    { title: "SEO Optimization", icon: "search-check", description: "Technical and on-page foundations that make websites easier to discover and understand.", items: ["Semantic structure", "Metadata", "Performance alignment"], group: "growth" },
    { title: "GSAP Animated Websites", icon: "sparkles", description: "Interactive, animation-rich websites and scroll-based frontend experiences using GSAP.", items: ["Scroll experiences", "Micro-interactions", "Reduced-motion support"], group: "web" },
    { title: "Website Maintenance", icon: "shield-check", description: "Ongoing care for content, presentation, compatibility, and frontend quality.", items: ["Content changes", "UI upkeep", "Compatibility checks"], group: "support" },
    { title: "Bug Fixing", icon: "bug", description: "Focused troubleshooting for broken layouts, interactions, and website functionality.", items: ["Issue diagnosis", "Frontend fixes", "Regression checks"], group: "support" },
    { title: "Website Redesign", icon: "refresh-cw", description: "Modernize an existing site around stronger hierarchy, usability, and performance.", items: ["UX review", "Visual refresh", "Responsive rebuild"], group: "web" }
  ];

  function escape(value) {
    return Portfolio.utils.escapeHtml(value == null ? "" : String(value));
  }

  function hostFor(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch (_error) { return "Archived project"; }
  }

  function sortedProjects(container) {
    const projects = (Portfolio.projectData || []).slice();
    if (container.hasAttribute("data-projects-featured")) {
      return projects.filter(function (project) { return Number(project.featuredRank) > 0; })
        .sort(function (a, b) { return a.featuredRank - b.featuredRank; });
    }
    return projects.sort(function (a, b) {
      const aRank = Number(a.featuredRank) || Number.MAX_SAFE_INTEGER;
      const bRank = Number(b.featuredRank) || Number.MAX_SAFE_INTEGER;
      return aRank - bRank;
    });
  }

  function projectSearch(project) {
    return [project.title, project.description, project.categoryLabel, project.typeLabel, project.role,
      (project.tags || []).join(" "),
      (project.deliveryTechnologies || []).map(function (technology) { return technology.name; }).join(" ")]
      .filter(Boolean).join(" ").toLowerCase();
  }

  function primaryLink(project) {
    if (project.caseStudy) return { href: project.caseStudy.href, external: false, label: "Read " + project.title + " case study" };
    if (project.status.value === "LIVE" && project.url) return { href: project.url, external: true, label: "View " + project.title + " website" };
    return null;
  }

  function pictureMarkup(project, priority, featured) {
    const media = project.media;
    const desktop = media.desktop;
    const mobile = media.mobile;
    const loading = priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    const sizes = featured ? "(min-width: 1320px) 1280px, (min-width: 768px) calc(100vw - 4.5rem), 100vw" : "(min-width: 1320px) 632px, (min-width: 768px) 50vw, 100vw";
    if (!mobile || !desktop.avif960) {
      return '<img src="' + escape(desktop.webp960) + '" alt="' + escape(media.alt) + '" width="' + escape(desktop.width) + '" height="' + escape(desktop.height) + '" ' + loading + ' decoding="async">';
    }
    return '<picture>' +
      '<source media="(max-width: 767.98px)" type="image/avif" srcset="' + escape(mobile.avif) + '">' +
      '<source media="(max-width: 767.98px)" type="image/webp" srcset="' + escape(mobile.webp) + '">' +
      '<source type="image/avif" srcset="' + escape(desktop.avif960) + ' 960w, ' + escape(desktop.avif1440) + ' 1440w" sizes="' + sizes + '">' +
      '<img src="' + escape(desktop.webp960) + '" srcset="' + escape(desktop.webp960) + ' 960w, ' + escape(desktop.webp1440) + ' 1440w" sizes="' + sizes + '" alt="' + escape(media.alt) + '" width="' + escape(desktop.width) + '" height="' + escape(desktop.height) + '" ' + loading + ' decoding="async">' +
      '</picture>';
  }

  function renderProject(template, project, index, options) {
    const featured = Number(project.featuredRank) > 0;
    const primary = primaryLink(project);
    const externalAttributes = primary && primary.external ? ' target="_blank" rel="noopener"' : "";
    const visualOpen = primary
      ? '<a class="project-visual" href="' + escape(primary.href) + '" aria-label="' + escape(primary.label) + '"' + externalAttributes + '>'
      : '<div class="project-visual" aria-label="' + escape(project.title + " archived project visual") + '">';
    const titleOpen = primary ? '<a href="' + escape(primary.href) + '"' + externalAttributes + '>' : "";
    const statusLabel = project.status.value === "LIVE" ? "Live" : project.status.value === "ARCHIVED" ? "Archived" : "Unavailable";
    const deliveryTechnologies = (project.deliveryTechnologies || []).map(function (technology) { return "<li>" + escape(technology.name) + "</li>"; }).join("");
    const technologyList = deliveryTechnologies
      ? '<ul class="tag-list project-technologies" aria-label="Project technologies">' + deliveryTechnologies + "</ul>"
      : "";
    const detailItems = [project.typeLabel, project.role, project.year].filter(Boolean);
    const detailLine = detailItems.length ? '<p class="project-detail-line">' + detailItems.map(escape).join(" · ") + "</p>" : "";
    const links = [];
    if (project.status.value === "LIVE" && project.url) links.push('<a href="' + escape(project.url) + '" target="_blank" rel="noopener">Live site <i data-lucide="external-link" aria-hidden="true"></i></a>');
    else if (project.status.value === "UNAVAILABLE") links.push('<span class="project-link-muted">Currently unavailable</span>');
    if (project.caseStudy) links.push('<a href="' + escape(project.caseStudy.href) + '">Case study <i data-lucide="arrow-right" aria-hidden="true"></i></a>');
    const disclosure = project.media.kind === "ARCHIVE_TREATMENT" ? "Archive visual · live snapshot unavailable" : "Current site snapshot · " + project.media.capturedOn;
    const values = {
      "{{slug}}": escape(project.slug), "{{category}}": escape(project.category), "{{status}}": escape(project.status.value),
      "{{search}}": escape(projectSearch(project)), "{{featuredClass}}": featured ? " is-featured is-featured-" + escape(project.featuredRank) : "",
      "{{featuredRank}}": featured ? escape(project.featuredRank) : "", "{{visualOpen}}": visualOpen, "{{visualClose}}": primary ? "</a>" : "</div>",
      "{{titleOpen}}": titleOpen, "{{titleClose}}": primary ? "</a>" : "", "{{picture}}": pictureMarkup(project, options.priority, featured),
      "{{index}}": String(index + 1).padStart(2, "0"), "{{host}}": escape(hostFor(project.url)), "{{mediaDisclosure}}": escape(disclosure),
      "{{categoryLabel}}": escape(project.categoryLabel), "{{typeLabel}}": escape(project.typeLabel),
      "{{featuredBadge}}": featured ? '<span class="project-featured-badge"><i data-lucide="sparkles" aria-hidden="true"></i> Featured</span>' : "",
      "{{statusClass}}": project.status.value.toLowerCase(), "{{statusLabel}}": statusLabel, "{{title}}": escape(project.title),
      "{{description}}": escape(project.description), "{{detailLine}}": detailLine, "{{technologyList}}": technologyList, "{{links}}": links.join("")
    };
    return Object.keys(values).reduce(function (html, token) { return html.split(token).join(values[token]); }, template).replace(/[ \t]+$/gm, "");
  }

  Portfolio.Projects = {
    renderProjectCard(template, project, index, options) { return renderProject(template, project, index, options || {}); },
    selectProjects(container) {
      const limit = Number(container.dataset.projectLimit || Portfolio.projectData.length);
      return sortedProjects(container).slice(0, limit);
    },
    renderProjects(root) {
      const scope = root || document;
      const container = scope.querySelector("[data-projects-grid]");
      const template = scope.querySelector("#project-card-template");
      if (!container || !template) return;
      const isArchive = !container.hasAttribute("data-projects-featured");
      container.innerHTML = this.selectProjects(container).map(function (project, index) {
        return renderProject(template.innerHTML, project, index, { priority: isArchive && index === 0 });
      }).join("");
    },
    renderServices(root) {
      const scope = root || document;
      const container = scope.querySelector("[data-services-grid]");
      const template = scope.querySelector("#service-card-template");
      if (!container || !template) return;
      const limit = Number(container.dataset.serviceLimit || Portfolio.serviceData.length);
      container.innerHTML = Portfolio.serviceData.slice(0, limit).map(function (service, index) {
        const items = service.items.map(function (item) { return "<li>" + escape(item) + "</li>"; }).join("");
        const values = { "{{icon}}": escape(service.icon), "{{number}}": String(index + 1).padStart(2, "0"), "{{title}}": escape(service.title), "{{description}}": escape(service.description), "{{items}}": items, "{{slug}}": Portfolio.utils.slugify(service.title) };
        return Object.keys(values).reduce(function (html, token) { return html.split(token).join(values[token]); }, template.innerHTML);
      }).join("");
    },
    initFilters(root) {
      const scope = root || document;
      const grid = scope.querySelector("[data-projects-grid]");
      if (!grid || !scope.querySelector("[data-project-filter]")) return;
      let activeCategory = "all";
      let activeStatus = "all";
      let query = "";
      const resultCount = scope.querySelector("[data-project-result-count]");
      const empty = scope.querySelector("[data-project-empty]");
      const search = scope.querySelector("[data-project-search]");
      const clear = scope.querySelector("[data-project-search-clear]");
      const status = scope.querySelector("[data-project-status]");
      const apply = function () {
        const visibleCards = [];
        grid.querySelectorAll(".project-card").forEach(function (card) {
          const show = (activeCategory === "all" || card.dataset.category === activeCategory) &&
            (activeStatus === "all" || card.dataset.status === activeStatus) && (!query || card.dataset.search.includes(query));
          card.hidden = !show;
          if (show) visibleCards.push(card);
        });
        if (empty) empty.hidden = visibleCards.length > 0;
        if (resultCount) resultCount.textContent = visibleCards.length + (visibleCards.length === 1 ? " project" : " projects");
        if (clear) clear.hidden = !query;
        if (window.gsap && !Portfolio.utils.prefersReducedMotion()) window.gsap.fromTo(visibleCards, { y: 18, scale: .975, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .5, stagger: .045, ease: "power3.out", overwrite: true });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      };
      scope.querySelectorAll("[data-project-filter]").forEach(function (button) {
        Portfolio.Lifecycle.page.listen(button, "click", function () {
          scope.querySelectorAll("[data-project-filter]").forEach(function (item) { item.classList.remove("active"); item.setAttribute("aria-pressed", "false"); });
          button.classList.add("active");
          button.setAttribute("aria-pressed", "true");
          if (window.gsap && !Portfolio.utils.prefersReducedMotion()) window.gsap.fromTo(button, { scale: .92 }, { scale: 1, duration: .42, ease: "back.out(2)" });
          activeCategory = button.dataset.projectFilter;
          apply();
        });
      });
      if (status) Portfolio.Lifecycle.page.listen(status, "change", function () { activeStatus = status.value; apply(); });
      if (search) Portfolio.Lifecycle.page.listen(search, "input", function () { query = search.value.trim().toLowerCase(); apply(); });
      if (clear) Portfolio.Lifecycle.page.listen(clear, "click", function () { if (search) { search.value = ""; query = ""; search.focus(); apply(); } });
      apply();
    },
    init(root) {
      const scope = root || document;
      this.renderProjects(scope);
      this.renderServices(scope);
      this.initFilters(scope);
    }
  };
})(window);
