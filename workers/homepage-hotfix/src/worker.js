const RAW_BASE = "https://raw.githubusercontent.com/jerrybecks/thinkersgk-website/e267a97df8898c255ca64d39ced12384b14aad4c";

const ASSETS = new Map([
  ["/", { path: "/index.html", type: "text/html; charset=utf-8" }],
  ["/index.html", { path: "/index.html", type: "text/html; charset=utf-8" }],
  ["/case-studies.html", { path: "/case-studies.html", type: "text/html; charset=utf-8" }],
  ["/styles/main.css", { path: "/styles/main.css", type: "text/css; charset=utf-8" }],
  ["/styles/redesign.css", { path: "/styles/redesign.css", type: "text/css; charset=utf-8" }],
  ["/scripts/main.js", { path: "/scripts/main.js", type: "application/javascript; charset=utf-8" }],
  ["/js/chat-widget.js", { path: "/js/chat-widget.js", type: "application/javascript; charset=utf-8" }]
]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = ASSETS.get(url.pathname);

    if (!asset) {
      return fetch(request);
    }

    const upstream = await fetch(`${RAW_BASE}${asset.path}`, {
      headers: {
        "User-Agent": "thinkersgk-homepage-hotfix"
      },
      cf: {
        cacheTtl: 60,
        cacheEverything: true
      }
    });

    if (!upstream.ok) {
      return new Response("Homepage hotfix asset unavailable", { status: 502 });
    }

    const headers = new Headers(upstream.headers);
    headers.delete("Content-Security-Policy");
    headers.delete("Content-Security-Policy-Report-Only");
    headers.delete("X-Frame-Options");
    headers.set("Content-Type", asset.type);
    headers.set("Cache-Control", "public, max-age=60, must-revalidate");
    headers.set("X-ThinkersGK-Hotfix", "homepage-layout-2026-05-26");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers
    });
  }
};
