const fs = require("fs");
const path = require("path");
const projects = require(path.join(process.cwd(), "data", "projects.js"));

const patterns = {
  WordPress: /wp-content|wp-includes/i,
  Elementor: /elementor/i,
  WooCommerce: /woocommerce|wc-ajax/i,
  Shopify: /cdn\.shopify|shopify\.theme|myshopify/i,
  Wix: /wixstatic|x-wix-/i,
  NextJS: /__next_data__|\/_next\/static/i,
  Bootstrap: /bootstrap(?:\.min)?\.(?:css|js)/i,
  jQuery: /jquery(?:-|\.)/i,
  GSAP: /gsap(?:\.min)?\.js/i,
  Webflow: /webflow\.js|data-wf-page/i,
  LaravelSession: /laravel_session|xsrf-token/i
};

async function inspect(project) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(project.url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "Umair Builds evidence audit/1.0" } });
    const body = await response.text();
    const combined = `${Array.from(response.headers.entries()).map(([key, value]) => `${key}: ${value}`).join("\n")}\n${body}`;
    return {
      slug: project.slug,
      checkedOn: new Date().toISOString(),
      requestedUrl: project.url,
      finalUrl: response.url,
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      observedSignals: Object.entries(patterns).filter(([, pattern]) => pattern.test(combined)).map(([name]) => name),
      note: "Candidate observations require human review and never update public delivery technologies automatically."
    };
  } catch (error) {
    return { slug: project.slug, checkedOn: new Date().toISOString(), requestedUrl: project.url, error: error.message, observedSignals: [] };
  } finally {
    clearTimeout(timeout);
  }
}

async function run() {
  const live = projects.filter((project) => project.status.value === "LIVE");
  const results = [];
  for (const project of live) results.push(await inspect(project));
  const output = path.join(process.cwd(), "tmp", "project-audit-candidate.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify({ generatedOn: new Date().toISOString(), results }, null, 2) + "\n");
  console.log(`Wrote review-only audit candidate: ${output}`);
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
