const RAW_BASE = "https://raw.githubusercontent.com/jerrybecks/thinkersgk-website/main";

const ASSETS = new Map([
  ["/", { path: "/index.html", type: "text/html; charset=utf-8" }],
  ["/index.html", { path: "/index.html", type: "text/html; charset=utf-8" }],
  ["/case-studies.html", { path: "/case-studies.html", type: "text/html; charset=utf-8" }],
  ["/styles/main.css", { path: "/styles/main.css", type: "text/css; charset=utf-8" }],
  ["/styles/redesign.css", { path: "/styles/redesign.css", type: "text/css; charset=utf-8" }],
  ["/scripts/main.js", { path: "/scripts/main.js", type: "application/javascript; charset=utf-8" }],
  ["/js/chat-widget.js", { path: "/js/chat-widget.js", type: "application/javascript; charset=utf-8" }],
  ["/assets/logo.png", { path: "/assets/logo.png", type: "image/png" }],
  ["/assets/logo-dark.png", { path: "/assets/logo-dark.png", type: "image/png" }],
  ["/assets/logo-light.png", { path: "/assets/logo-light.png", type: "image/png" }],
  ["/assets/logo-thinkers-new-transparent.png", { path: "/assets/logo-thinkers-new-transparent.png", type: "image/png" }],
  ["/assets/logo-thinkers-new.png", { path: "/assets/logo-thinkers-new.png", type: "image/png" }],
  ["/assets/logo-thinkers-new-small.png", { path: "/assets/logo-thinkers-new-small.png", type: "image/png" }],
  ["/assets/videos/tgk-japan-globe-poster.jpg", { path: "/assets/videos/tgk-japan-globe-poster.jpg", type: "image/jpeg" }],
  ["/apple-touch-icon.png", { path: "/apple-touch-icon.png", type: "image/png" }],
  ["/favicon.png", { path: "/favicon.png", type: "image/png" }],
  ["/favicon-48.png", { path: "/favicon-48.png", type: "image/png" }],
  ["/favicon.ico", { path: "/favicon.ico", type: "image/x-icon" }],
  ["/favicon.svg", { path: "/favicon.svg", type: "image/svg+xml; charset=utf-8" }]
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
      cf: { cacheTtl: 0 }
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
    headers.set("X-ThinkersGK-Hotfix", "homepage-feedback-purge-2026-06-02");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers
    });
  }
};
