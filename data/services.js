(function (root) {
  "use strict";

  const services = [
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

  if (root) {
    const Portfolio = root.Portfolio = root.Portfolio || {};
    Portfolio.serviceData = services;
  }
  if (typeof module !== "undefined" && module.exports) module.exports = services;
})(typeof window !== "undefined" ? window : null);
