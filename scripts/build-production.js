const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { minify_sync: minifySync } = require("terser");
const { baseUrl } = require("./site-config");
const { faviconMarkup, updateBrandComponents } = require("./brand-assets");
const projectData = require(path.join(process.cwd(), "data", "projects.js"));

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#039;"
  }[character]));
}

function projectFallbackMarkup() {
  const items = projectData.map((project) => {
    const technologies = (project.deliveryTechnologies || []).map((technology) => technology.name).join(" · ");
    const destination = project.status.value === "LIVE" && project.url
      ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener">View live site</a>`
      : project.caseStudy
        ? `<a href="${escapeHtml(project.caseStudy.href)}">Read the case study</a>`
        : "<span>Archived record · live site unavailable</span>";
    const detail = [project.typeLabel, project.role, project.year].filter(Boolean).join(" · ");
    return `<li class="project-archive-fallback-item"><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p><p class="project-detail-line">${escapeHtml(detail || (project.status.value === "ARCHIVED" ? "Archived project" : "Project record"))}</p><p><strong>Status:</strong> ${escapeHtml(project.status.value === "LIVE" ? "Live" : "Archived")}${technologies ? ` · <strong>Documented delivery technology:</strong> ${escapeHtml(technologies)}` : ""}</p>${destination}</li>`;
  }).join("");
  return `<!-- PROJECT_ARCHIVE_NOSCRIPT_START --><noscript><section class="project-archive-fallback" aria-labelledby="project-archive-fallback-title"><h2 id="project-archive-fallback-title">Project archive without interactive filters</h2><p>This text-first archive keeps all 17 project records available when JavaScript is unavailable.</p><ol class="project-archive-fallback-list">${items}</ol></section></noscript><!-- PROJECT_ARCHIVE_NOSCRIPT_END -->`;
}

function projectSchemaMarkup() {
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${baseUrl}/projects.html#webpage`,
      name: "Web Development Projects | Umair Shaikh",
      url: `${baseUrl}/projects.html`,
      inLanguage: "en-IN",
      isPartOf: { "@id": `${baseUrl}/#website` },
      about: { "@id": `${baseUrl}/#person` },
      mainEntity: { "@id": `${baseUrl}/projects.html#project-list` }
    },
    {
      "@type": "ItemList",
      "@id": `${baseUrl}/projects.html#project-list`,
      name: "Web development projects by Umair Shaikh",
      url: `${baseUrl}/projects.html`,
      numberOfItems: projectData.length,
      itemListElement: projectData.map((project, index) => {
        const item = {
          "@type": "CreativeWork",
          "@id": `${baseUrl}/projects.html#${project.slug}`,
          name: project.title,
          description: project.description,
          image: `${baseUrl}/${project.media.desktop.webp960}`,
          creator: { "@id": `${baseUrl}/#person` }
        };
        if (project.url && project.status.value === "LIVE") item.url = project.url;
        return { "@type": "ListItem", position: index + 1, item };
      })
    }
  ];
  return `<script type="application/ld+json" data-project-schema>${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}

function enrichEntitySchema(file, html) {
  const pageNames = { "case-studies.html": "Web Development Case Studies | Umair Shaikh", "skills.html": "Full Stack Developer Skills | Umair Shaikh", "experience.html": "Full Stack Web Development Experience | Umair Shaikh" };
  if (!pageNames[file]) return html;
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_match, opening, payload, closing) => {
    const data = JSON.parse(payload);
    const graph = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
    const id = `${baseUrl}/${file}#webpage`;
    if (!graph.some((item) => item["@id"] === id)) {
      graph.unshift({
        "@type": "WebPage",
        "@id": id,
        name: pageNames[file],
        url: `${baseUrl}/${file}`,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#person` }
      });
    }
    return opening + JSON.stringify({ "@context": data["@context"] || "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") + closing;
  });
}

const servicesFallback = `<noscript data-services-fallback><section class="service-fallback" aria-labelledby="service-fallback-title"><h2 id="service-fallback-title">Services available without interactive loading</h2><p>Umair's documented service fit includes:</p><ul><li>Responsive business websites and landing pages</li><li>WordPress website, theme, and plugin development</li><li>PHP and Laravel application development</li><li>CRM, HRMS, and property-management interfaces</li><li>REST API, webhook, Shipway, and attendance integrations</li><li>Stripe, Razorpay, and PayU payment integrations</li><li>Frontend speed optimization and Core Web Vitals work</li><li>Technical and on-page SEO foundations</li></ul></section></noscript>`;
const contactFallback = `<noscript data-contact-fallback><p class="contact-fallback">The interactive enquiry form needs JavaScript. You can contact Umair directly at <a href="mailto:umairshaikh7738@gmail.com">umairshaikh7738@gmail.com</a>, <a href="tel:+917738635355">+91 77386 35355</a>, or <a href="https://wa.me/917738635355">WhatsApp</a>.</p></noscript>`;

const conditionalAnalytics = `<!-- Optional analytics: only load after an explicit local opt-in. -->
  <script>
    (function (window, document) {
      var granted = false;
      try { granted = window.localStorage.getItem("portfolio-analytics-consent") === "granted"; } catch (_error) {}
      if (!granted) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500
      });
      window.gtag("consent", "update", { analytics_storage: "granted" });
      window.gtag("js", new Date());
      window.gtag("config", "G-6J1PG2GSNQ", { send_page_view: false, anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-6J1PG2GSNQ";
      document.head.appendChild(script);
    }(window, document));
  </script>`;

function collapseOutsideStrings(source) {
  let output = "";
  let quote = "";
  let escaped = false;
  let whitespace = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];
    if (lineComment) {
      if (character === "\n" || character === "\r") {
        lineComment = false;
        whitespace = true;
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        whitespace = true;
        index += 1;
      }
      continue;
    }
    if (quote) {
      output += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && nextCharacter === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && nextCharacter === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === "'" || character === '"' || character === "`") {
      if (whitespace && output && !/\s$/.test(output)) output += " ";
      whitespace = false;
      quote = character;
      output += character;
      continue;
    }
    if (/\s/.test(character)) {
      whitespace = true;
      continue;
    }
    if (whitespace && output && !/[{(:;,}\[]$/.test(output) && !/[}):;,\]]/.test(character)) output += " ";
    whitespace = false;
    output += character;
  }
  return output.trim();
}

const cssFiles = ["style.css", "animations.css", "responsive.css"].map((file) => path.join("assets", "css", file));
const css = cssFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,])\s*/g, "$1")
  .trim();
fs.writeFileSync(path.join("assets", "css", "portfolio.min.css"), css + "\n");

const jsFiles = [
  path.join("data", "projects.js"),
  ...["utilities.js", "lifecycle.js", "i18n.js", "navigation.js", "loader.js", "projects.js", "contact.js", "gsap.js", "router.js", "app.js"].map((file) => path.join("assets", "js", file))
];
const jsSource = jsFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n").trimEnd();
const minified = minifySync(jsSource, {
  compress: { passes: 2 },
  mangle: true,
  format: { comments: /^!/ }
});
if (!minified.code) throw new Error("Terser did not produce a JavaScript bundle.");
const js = minified.code;
fs.writeFileSync(path.join("assets", "js", "portfolio.min.js"), js + "\n");

const htmlFiles = fs.readdirSync(process.cwd()).filter((file) => file.endsWith(".html"));
updateBrandComponents();
const brandIcons = faviconMarkup();
const earlyThemeScript = '<script>document.documentElement.classList.add("js");try{var savedTheme=localStorage.getItem("portfolio-theme");if(savedTheme==="light"||savedTheme==="dark")document.documentElement.dataset.theme=savedTheme;}catch(_error){}</script>';
const hash = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
const cssVersion = hash(css);
const jsVersion = hash(js);
const analyticsPattern = /(?:<!-- Google tag \(gtag\.js\) -->\s*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-6J1PG2GSNQ"><\/script>|<!-- Optional analytics: only load after an explicit local opt-in\. -->)\s*<script>[\s\S]*?<\/script>/g;
const projectSchemaPattern = /<script type="application\/ld\+json" data-project-schema>[\s\S]*?<\/script>/;
const projectFallbackPattern = /<!-- PROJECT_ARCHIVE_NOSCRIPT_START -->[\s\S]*?<!-- PROJECT_ARCHIVE_NOSCRIPT_END -->/;
const breadcrumbPattern = /<nav class="breadcrumb-trail" aria-label="Breadcrumb"><a href="\/">Home<\/a><span aria-hidden="true">\/<\/span><span aria-current="page">[^<]+<\/span><\/nav>/g;
const breadcrumbLabels = { "about.html": "About", "projects.html": "Projects", "case-studies.html": "Case studies", "services.html": "Services", "skills.html": "Skills", "experience.html": "Experience", "contact.html": "Contact", "privacy.html": "Privacy policy" };
const cssPattern = /<link rel="stylesheet" href="assets\/css\/style\.css">\s*<link rel="stylesheet" href="assets\/css\/animations\.css">\s*<link rel="stylesheet" href="assets\/css\/responsive\.css">/g;
const jsPattern = /<script defer src="assets\/js\/utilities\.js"><\/script>\s*<script defer src="assets\/js\/lifecycle\.js"><\/script>\s*<script defer src="assets\/js\/navigation\.js"><\/script>\s*<script defer src="assets\/js\/loader\.js"><\/script>\s*<script defer src="assets\/js\/projects\.js"><\/script>\s*<script defer src="assets\/js\/contact\.js"><\/script>\s*<script defer src="assets\/js\/gsap\.js"><\/script>\s*<script defer src="assets\/js\/router\.js"><\/script>\s*<script defer src="assets\/js\/app\.js"><\/script>/g;
const fontResourcePattern = /\s*<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com|assets\/fonts\/(?:manrope-latin-variable|space-grotesk-latin-variable)\.woff2)[^>]*>/g;
const bootstrapPattern = /<link href="assets\/vendor\/bootstrap-5\.3\.8\.min\.css"[^>]*>(?:\s*<noscript><link href="assets\/vendor\/bootstrap-5\.3\.8\.min\.css"[^>]*><\/noscript>)?/g;
const fontPreloads = '<link rel="preload" href="assets/fonts/manrope-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n  <link rel="preload" href="assets/fonts/space-grotesk-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n  ';
const deferredBootstrap = '<link href="assets/vendor/bootstrap-5.3.8.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous" media="print" onload="this.media=\'all\'">\n  <noscript><link href="assets/vendor/bootstrap-5.3.8.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous"></noscript>';
htmlFiles.forEach((file) => {
  const source = fs.readFileSync(file, "utf8");
  const breadcrumb = breadcrumbLabels[file] ? `<nav class="breadcrumb-trail" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(breadcrumbLabels[file])}</span></nav>` : "";
  const production = source
    .replace(/<script>document\.documentElement\.classList\.add\("js"\);(?:try\{var savedTheme=[\s\S]*?catch\(_error\)\{\})?<\/script>/, earlyThemeScript)
    .replace(/<!-- BRAND_ICONS_START -->[\s\S]*?<!-- BRAND_ICONS_END -->|<link rel="icon" href="assets\/icons\/favicon\.png" type="image\/png">/, brandIcons)
    .replace(fontResourcePattern, "")
    .replace(bootstrapPattern, fontPreloads + deferredBootstrap)
    .replace(analyticsPattern, conditionalAnalytics)
    .replace(projectSchemaPattern, projectSchemaMarkup())
    .replace(projectFallbackPattern, projectFallbackMarkup())
    .replace(breadcrumbPattern, "")
    .replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_match, opening, payload, closing) => {
      try { return enrichEntitySchema(file, opening + payload + closing).match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/)[0]; }
      catch (_error) { return opening + payload + closing; }
    })
    .replace(/(<div data-component="service-card"><\/div>)(?!<noscript data-services-fallback)/, "$1" + servicesFallback)
    .replace(/(<div data-component="contact-form"><\/div>)(?!<noscript data-contact-fallback)/, "$1" + contactFallback)
    .replace(/(<section class="page-hero"[^>]*>(?:(?!<\/section>)[\s\S])*?<div class="container-xxl page-hero-grid"><div>)(?!<nav class="breadcrumb-trail")/, "$1" + breadcrumb)
    .replace(/(<section class="page-hero"[^>]*>(?:(?!<\/section>)[\s\S])*?<div class="container-xxl">)(?!<nav class="breadcrumb-trail")/, "$1" + breadcrumb)
    .replace(cssPattern, '<link rel="stylesheet" href="assets/css/portfolio.min.css?v=' + cssVersion + '">')
    .replace(jsPattern, '<script defer src="assets/js/portfolio.min.js?v=' + jsVersion + '"></script>')
    .replace(/assets\/css\/portfolio\.min\.css(?:\?v=[^"']*)?/g, "assets/css/portfolio.min.css?v=" + cssVersion)
    .replace(/assets\/js\/portfolio\.min\.js(?:\?v=[^"']*)?/g, "assets/js/portfolio.min.js?v=" + jsVersion)
    .replace(/(?:<script(?: async| defer)? src="https:\/\/cdn\.jsdelivr\.net\/npm\/@emailjs\/browser@4\/dist\/email\.min\.js"><\/script>)+/g, "")
    .replace(/https:\/\/code\.jquery\.com\/jquery-3\.7\.1\.min\.js/g, "assets/vendor/jquery-3.7.1.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.8\/dist\/css\/bootstrap\.min\.css/g, "assets/vendor/bootstrap-5.3.8.min.css")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.8\/dist\/js\/bootstrap\.bundle\.min\.js/g, "assets/vendor/bootstrap-5.3.8.bundle.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.13\.0\/dist\/gsap\.min\.js/g, "assets/vendor/gsap-3.13.0.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/gsap@3\.13\.0\/dist\/ScrollTrigger\.min\.js/g, "assets/vendor/ScrollTrigger-3.13.0.min.js")
    .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/lenis@1\.3\.11\/dist\/lenis\.min\.js/g, "assets/vendor/lenis-1.3.11.min.js")
    .replace(/https:\/\/unpkg\.com\/lucide@0\.468\.0\/dist\/umd\/lucide\.min\.js/g, "assets/vendor/lucide-0.468.0.min.js")
    .replace("Last updated: 20 August 2026.", "Last updated: 22 August 2026.")
    .replace("The website uses Google Fonts and loads EmailJS from jsDelivr only when the contact form is submitted. Those providers may receive standard technical request information such as IP address, browser type, and requested file; EmailJS also processes the form details needed to deliver your enquiry. Their own privacy terms apply.", "The website self-hosts its interface fonts and loads EmailJS from jsDelivr only when the contact form is submitted. EmailJS may receive standard technical request information and processes the form details needed to deliver your enquiry. Its own privacy terms apply.")
    .replace("The website uses Google Analytics 4 to measure site usage and EmailJS from jsDelivr only when the contact form is submitted. Google Analytics may use cookies and process usage and device information; Google's privacy terms and controls apply. EmailJS processes contact-form details needed to deliver your enquiry.", "The website offers optional Google Analytics 4 measurement and loads it only after you choose Allow analytics. EmailJS is loaded from jsDelivr only when the contact form is submitted. Google Analytics and EmailJS may process standard technical information; their privacy terms apply.")
    .replace("Google Analytics 4 is enabled to measure page views and selected interactions. Analytics data may include page paths, titles, interaction details, and standard browser and device information. You can manage or block cookies through your browser settings; Google's privacy policy describes additional controls. Analytics is not used to identify you directly.", "Google Analytics 4 is opt-in. If you allow analytics, the site measures page views and selected interactions such as resume downloads, WhatsApp clicks, quote requests, and successful form submissions. Analytics data may include page paths, titles, interaction details, and standard browser and device information. If you choose Not now, analytics is not loaded; you can also clear the local preference or block cookies through your browser settings. Analytics is not used to identify you directly.");

  if (production !== source) fs.writeFileSync(file, production);
});

console.log(`Built ${path.join("assets", "css", "portfolio.min.css")} (${Buffer.byteLength(css)} bytes)`);
console.log(`Built ${path.join("assets", "js", "portfolio.min.js")} (${Buffer.byteLength(js)} bytes)`);
console.log(`Updated production asset references in ${htmlFiles.length} HTML files.`);
