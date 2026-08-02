const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dist = path.resolve(root, "dist");
if (dist !== path.join(root, "dist")) throw new Error("Unexpected dist target");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "server"), { recursive: true });
fs.mkdirSync(path.join(dist, "client"), { recursive: true });

const rootFiles = [
  "index.html", "about.html", "projects.html", "case-studies.html", "services.html",
  "skills.html", "experience.html", "contact.html", "privacy.html", "404.html",
  "robots.txt", "sitemap.xml"
];
rootFiles.forEach((file) => fs.copyFileSync(path.join(root, file), path.join(dist, "client", file)));
["assets", "components"].forEach((directory) => fs.cpSync(path.join(root, directory), path.join(dist, "client", directory), { recursive: true }));

const worker = `
const worker = {
  async fetch(request, env) {
    const original = new URL(request.url);
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname === "/") assetUrl.pathname = "/index.html";

    let response = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (response.status === 404 && !assetUrl.pathname.split("/").pop().includes(".")) {
      assetUrl.pathname = assetUrl.pathname.replace(/\\/$/, "") + ".html";
      response = await env.ASSETS.fetch(new Request(assetUrl, request));
    }
    if (response.status === 404 && request.headers.get("accept")?.includes("text/html")) {
      const notFoundUrl = new URL("/404.html", original);
      const notFound = await env.ASSETS.fetch(new Request(notFoundUrl, request));
      return new Response(notFound.body, { status: 404, headers: notFound.headers });
    }
    return response;
  }
};
export default worker;
`;
fs.writeFileSync(path.join(dist, "server", "index.js"), worker.trimStart());

console.log("Prepared static Sites output in dist/.");
