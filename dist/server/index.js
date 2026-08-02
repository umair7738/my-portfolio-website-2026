const worker = {
  async fetch(request, env) {
    const original = new URL(request.url);
    const assetUrl = new URL(request.url);
    if (assetUrl.pathname === "/") assetUrl.pathname = "/index.html";

    let response = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (response.status === 404 && !assetUrl.pathname.split("/").pop().includes(".")) {
      assetUrl.pathname = assetUrl.pathname.replace(/\/$/, "") + ".html";
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
