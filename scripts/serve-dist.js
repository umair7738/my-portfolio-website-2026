const http = require("http");
const fs = require("fs");
const path = require("path");

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml" };

function createStaticServer(options) {
  const settings = options || {};
  const root = settings.root || path.join(process.cwd(), "dist");
  const port = Number(settings.port || process.env.PORT || 4173);
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
    const target = path.resolve(root, relative);
    if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(target).pipe(response);
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
    console.log(`Serving dist at http://127.0.0.1:${server.address().port}`);
    const stop = () => server.close(() => process.exit(0));
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { createStaticServer };
