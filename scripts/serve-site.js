const http = require("http");
const fs = require("fs");
const path = require("path");
const { indexablePages } = require("./site-config");

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml" };
const pageRoutes = new Map(indexablePages
  .filter((file) => file !== "index.html")
  .map((file) => [file.replace(/\.html$/, ""), file]));

function createStaticServer(options) {
  const settings = options || {};
  const root = path.resolve(settings.root || process.cwd());
  const port = Number(settings.port || process.env.PORT || 4173);
  const server = http.createServer((request, response) => {
    function serveFile(file) {
      const target = path.isAbsolute(file) ? file : path.resolve(root, file);
      const relativeTarget = path.relative(root, target);
      if (relativeTarget === ".." || relativeTarget.startsWith(`..${path.sep}`) || path.isAbsolute(relativeTarget) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, { "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(target).pipe(response);
    }

    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === "/index.html") {
      response.writeHead(301, { Location: `/${requestUrl.search}` });
      response.end();
      return;
    }

    const route = pathname.replace(/^\/|\/$/g, "");
    if (pageRoutes.has(route)) {
      const relative = pageRoutes.get(route);
      return serveFile(relative);
    }
    const legacyRoute = route.match(/^(.+)\.html$/);
    if (legacyRoute && pageRoutes.has(legacyRoute[1])) {
      response.writeHead(301, { Location: `/${legacyRoute[1]}${requestUrl.search}` });
      response.end();
      return;
    }

    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "").replace(/\/$/, "");
    let target = path.resolve(root, relative);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      const indexTarget = path.join(target, "index.html");
      target = fs.existsSync(indexTarget) ? indexTarget : path.resolve(root, `${relative}.html`);
    } else if (!fs.existsSync(target) && !path.extname(relative)) {
      target = path.resolve(root, `${relative.replace(/\/$/, "")}.html`);
    }
    serveFile(target);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

if (require.main === module) {
  createStaticServer().then((server) => {
    console.log(`Serving site at http://127.0.0.1:${server.address().port}`);
    const stop = () => server.close(() => process.exit(0));
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { createStaticServer };
