# Claude Handoff: SEO Cleanup

## What Landed
- Normalized `blog/index.html` and `blog/blog.html` social metadata so both advertise the canonical `/blog/` URL.
- Expanded `sitemap.xml` with missing live indexable pages:
  `itad-japan.html`, `how-we-work.html`, `why-us.html`, `service-cloud-printing.html`, `service-daas-vdi.html`, `service-field-engineering.ja.html`, and several missing 2026 blog posts.
- Reclassified actual blog post pages from `og:type="website"` to `og:type="article"`.
- Fixed malformed `twitter:description` markup in affected blog headers.
- Marked clear legacy/sample posts `noindex, follow`:
  `blog/first-post.html`, `blog/sample-post-1.html`, `blog/sample-post-2.html`, `blog/welcome-to-our-blog.html`.
- Removed the fake `G-XXXXXXXXXX` analytics snippet from `blog/posts/data-destruction-essentials.html`.
- Marked `blog/blog.html` `noindex, follow` as a duplicate alias of `/blog/`.
- Updated remaining blog-page links that still pointed to `blog/blog.html` so they now point to the canonical blog index instead.
- Converted `index.jp.html` into a `noindex` alias that meta-refreshes to `index.ja.html`, and removed the `robots.txt` block on `/index.jp.html` so crawlers can see the deindexing signal.

## Current Assumptions
- `blog/blog.html` remains on disk as an alias for compatibility, but should not be indexed.
- `index.jp.html` remains on disk as an alias for compatibility, but should not be indexed.
- Legacy/sample blog posts remain accessible by direct URL, but should not be indexed.

## Things Not Resolved In Code
- No real GA4 measurement ID was available, so no production analytics tag was added.
- No phone number was added because the live site content inspected in this pass did not contain the old phone placeholder anymore.
- No redirect infrastructure was added beyond HTML-level alias handling because this is a static GitHub Pages site.

## Recommended Final Review
- Decide whether `blog/blog.html` should be deleted outright in a later cleanup.
- Decide whether `index.jp.html` should be deleted once external references are no longer needed.
- Review whether any additional older blog posts should be marked `noindex`.
- If a real GA4 ID is available later, add it deliberately from one shared pattern rather than page-by-page drift.
