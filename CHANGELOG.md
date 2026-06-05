# Changelog

## [2026-06-05] - Lead Architect (Codex)

### Added
- Project memory: Added `STATUS.md`, `progress.md`, and `decisions.md` to capture the current website/business-ops posture, recent operational findings, durable decisions, and next priorities for Codex/Gemini/Claude handoff.
- Documentation: Added a project `README.md` describing the current bank-safe website direction, content rules, important memory files, and deployment caution around the broad dirty worktree.

### Updated
- Project memory: Recorded that Device Lifecycle & Deployment is now a core service lane, generated video assets remain local-review-only unless explicitly approved, public client-feedback/case-study claims should stay removed until supportable, and Command Center needs dedupe/acknowledgement logic for stale freee/bank-admin reminders.

## [2026-06-04] - Lead Architect (Codex)

### Added
- Website: Promoted the existing Device Lifecycle & Deployment service into the homepage, services grids, sitemap, and crawler configuration so Thinkers GK can clearly market procurement, endpoint rollout, asset tracking, retrieval, wiping, and ITAD documentation as a combined Japan/APAC service.

### Updated
- SEO: Added explicit OpenAI-related crawler allowances, including `OAI-SearchBot` and `OAI-AdsBot`, in `robots.txt` and registered the Device Lifecycle service URL in `sitemap.xml` for search submission workflows.
- SEO: Fixed malformed meta-description markup on the legacy IT Asset Lifecycle service page so crawlers and social previews can parse the page head cleanly.
- Website: Removed local English and Japanese homepage video treatments for review, replacing the intro, hero media, motion band, and Japan coverage loop with static visual assets.
- Website: Reconciled the homepage implementation with the static-review direction by removing the remaining English homepage autoplay globe videos and using the selected poster artwork as the hero/coverage visual instead.
- Website: Removed the public case-study claim surface for bank/new-company safety by converting `case-studies.html` into a noindex redirect to `how-we-work.html`, replacing homepage/why-us case-study links with delivery-approach links, and removing the old case-study URL from the sitemap.
- Website: Synced the Japanese homepage with the bank-safe posture by updating the logo, removing the old hero media panel, replacing SLA/24-7 phrasing with ownership/coordination language, and using the same static globe hero treatment as the English homepage.
- Website: Reworded the Japanese About page growth/timeline copy so it presents Thinkers GK as a new Japan-focused operator with clear service lanes instead of implying long historical expansion or mature nationwide track record.
- Website: Softened Japanese field-engineering coverage copy from all-prefecture/nationwide language to major-location and multi-site rollout language for a more credible new-company public posture.
- Website: Synced the new transparent Thinkers logo into the active Japanese page headers/footers checked during the bank-safe pass.
- Website: Extended the bank-safe cleanup across public non-blog pages by removing stale case-study links, all-prefecture/nationwide overclaims, `24/7` service claims, and the legacy `index.jp.html` homepage body that could leak old video/copy through the Japanese alias.
- Deployment: Updated the Cloudflare homepage hotfix Worker to read from the `main` branch and serve the new logo/static hero assets instead of staying pinned to an old commit.
- Website/SEO: Added Device Lifecycle & Deployment to homepage structured data, English/Japanese contact-form service options, and social preview metadata for the new service page.
- SEO: Added `llms.txt` as an AI-readable site summary covering Thinkers GK identity, service pages, coverage area, and contact details.
- SEO: Added an IndexNow verification key file and a post-deploy submission helper for Bing/IndexNow discovery of the homepage, services, contact, Device Lifecycle, `llms.txt`, and sitemap URLs.

## [2026-06-01] - Lead Architect (Codex)

### Added
- Business verification: Drafted a bilingual Thinkers LLC service proposal / IT solutions overview for Japanese corporate bank account application support, covering software development, cloud infrastructure, automation, consulting, and support operations.
- Website: Added local WebM/MP4/poster video assets for the Japan coverage globe, About-page coordination visual, and Managed Services operations visual so the Groq-generated media can be reviewed in context before any production push.

### Updated
- Website: Replaced the local header/footer/email/favicon logo assets with the approved new Thinkers mark from the Groq asset folder, keeping the video/loading experiments unchanged for further review.
- Website: Replaced the homepage static globe treatment with the selected animated Japan globe, added a motion visual to the About-page coordination block, and added a managed-operations video panel to the Managed Services page for local review only.

## [2026-05-16] - Lead Architect (Codex)

### Added
- Website: Published a clean May 16 operations post, `Zoho Email Operations for Japan-Based Teams: What to Control After Migration`, and prepended it to the live blog index.
- Website: Replaced the duplicate homepage blog block with a support matrix that explains user support, site work, security control, and asset lifecycle entry points.
- Website: Added local homepage test assets for a Tokyo city loop hero card, including optimized MP4/WebM video and poster frame.

### Fixed
- Website: Quarantined Yamamoto/Nakamura fake CRM-derived Orion drafts and removed two published blog cards/posts that referenced the fake record and exposed unsupported private CRM context.
- Website/Hub publishing: Stopped Orion/publisher CRM intelligence from reading the stale local hub database fallback that allowed fake CRM context to reappear in public blog workflows.
- Website: Cleaned homepage service-card markup so card text is no longer one giant anchor, improved visible header CTA, and made the language toggle more prominent.
- Website: Reworked the homepage platform marquee to keep one canonical source list, clone the loop at runtime, and reserve stable dimensions to reduce layout shift.
- Website: Stacked the floating LINE and AI chat controls with shared responsive offsets so they no longer collide in the bottom-right viewport area.
- Website: Bumped homepage asset versions and moved the chat widget offsets into the widget CSS itself so cached files cannot keep the old overlapping controls alive.
- Website: Switched floating contact controls to a clearly separated horizontal layout, strengthened language-toggle contrast, and added defensive hiding/removal for any stale duplicate team-insights block.
- Website: Removed redundant service-card hover arrows, aligned the footer contact link with the `Start a Project` CTA language, and slowed the platform marquee on mobile.
- Website: Added CSS hover/focus support for the Services dropdown and row hover highlighting for the homepage support matrix.
- Website: Increased homepage service-card description contrast in light and dark themes for better readability.
- Website: Fixed case-study cards in dark mode by aligning their inline card colors with the global theme variables, and added sticky-header scroll offset spacing for section anchors.
- Website: Expanded sticky-header scroll clearance to all section wrappers and bumped the homepage/case-study stylesheet cache key.
- Website: Added main-stylesheet fallback sizing for the LINE floating button on legacy blog posts, normalized footer contact labels, and made footer copyright years update from JavaScript.
- Website: Removed duplicate LINE floating-button sizing from the redesign stylesheet so `main.css` owns the global widget coordinates.
- Website: Updated the global logo/icon assets from the supplied Thinkers GK mark, cache-busted logo references, added richer favicon metadata to active layouts, and added a reusable `.invert-dark` image utility.
- Website: Replaced the homepage hero-side still image with the Tokyo city loop video treatment and tightened the hero headline/subcopy sizing for a calmer first viewport.
- Website: Added a local Tokyo-backdrop hero variant so the city loop can run behind the homepage headline without duplicating the video in the side card.
- Website: Brightened the local Tokyo hero backdrop and added a reusable video playback-rate hook so the homepage loop can run at a calmer pace.
- Website: Added a local motion-logo intro overlay and swapped the homepage header/footer to the new trimmed Thinkers logo assets for review.
- Website: Tuned the local logo review so the intro background matches the motion-logo source and the header logo blends into the nav surface instead of showing a mismatched white block.
- Website: Added a transparent nav/footer logo variant from the approved logo source so the mark sits directly on the surrounding header/footer surfaces.
- Website: Reworked the local motion-logo loading screen to share the homepage Tokyo video backdrop and dark hero atmosphere instead of using a separate beige page background.
- Website: Added a local comparison variant using the Thinkers motion-logo video as the homepage hero background.

## [2026-05-10] - Lead Architect (Codex)

### Changed
- Website: Removed the public SLA commitments dashboard from [`how-we-work.html`], removed the live ops snapshot JavaScript/CSS that exposed response/SLA metrics, and replaced the homepage `Response SLA` stat with internal-facing operational coverage copy.
- Website: Added hub-side publishing support for Orion drafts so approved Markdown in `blog/drafts/` can be converted into live `blog/posts/` HTML and prepended to the blog index.

## [2026-04-25] - Lead Architect (Codex)

### Fixed
- Website: Added the missing `stagger-grid` hook to the homepage services overview in [`index.html`] so the redesigned custom grid participates consistently in the shared scroll-reveal stagger behavior.

## [2026-04-16] - Lead Architect (Codex)

### Fixed
- Website: Normalized the blog index social metadata so both [`blog/index.html`] and [`blog/blog.html`] now advertise the canonical `/blog/` URL instead of conflicting `og:url` values.
- Website: Expanded [`sitemap.xml`] to include live indexable pages that already had canonicals and `index, follow`, including `itad-japan.html`, `how-we-work.html`, `why-us.html`, `service-cloud-printing.html`, `service-daas-vdi.html`, `service-field-engineering.ja.html`, and several missing 2026 blog posts.
- Website: Reclassified legacy and current blog post Open Graph metadata from `website` to `article`, and fixed malformed `twitter:description` markup in affected blog headers.
- Website: Marked legacy/sample blog posts `noindex, follow` in [`blog/first-post.html`], [`blog/sample-post-1.html`], [`blog/sample-post-2.html`], and [`blog/welcome-to-our-blog.html`] so they remain reachable but stop competing with production content in search.
- Website: Removed the fake `G-XXXXXXXXXX` analytics snippet from [`blog/posts/data-destruction-essentials.html`] and marked [`blog/blog.html`] `noindex, follow` as a duplicate alias of the canonical `/blog/` index.
- Website: Updated remaining blog-page links that still pointed at the duplicate `blog/blog.html` alias so they now resolve to the canonical blog index, and converted [`index.jp.html`] into a `noindex` alias that immediately redirects to [`index.ja.html`].

## [2026-04-15] - Lead Architect (Codex)

### Fixed
- Command Center: Fixed `generateQuoteHtml()` in `src/services/documents/pdf.js` to accept `scope` data as either an array, string, or object. Newly created quotes were crashing with `{"error":"scopeRaw.split is not a function"}` because the stored quote metadata unpacked `scope` as an array from JSON notes.
- Command Center: Updated new Rex Technologies coupler quotes `TGK-20260415-01` and `TGK-20260415-02` to use client `Rex Technologies` with attention `Padma Kadam`, and verified both quotes render successfully after the scope normalization fix.
- Command Center: Added an AI model policy layer in `src/services/ai/router.js` with named task roles (`classifier_model`, `draft_model`, `reasoning_model`, `cheap_model`, `vision_model`), `getModelForTask(taskType)`, and policy-aware fallback chain selection so task routing can stay stable even when providers change.
- Command Center: Added `src/services/agents/schemas.js` with strict output contracts for `triage`, `reply`, and `quote_extraction`, plus `safeParseOutput(text, schema)` to recover structured defaults when model JSON is malformed or incomplete.
- Command Center / Worker: Reworked the Cloudflare inbox Worker to stop using the shared `__index__` KV record. Inbox listings now come from sortable per-message envelope keys, which avoids lost messages under concurrent inbound email events and supports per-account inbox filtering.
- Command Center / Worker: Normalized Worker envelope metadata and expanded `/api/inbox/read` to return the stored `raw` payload alongside compatibility fields (`from`, `to`, `subject`, `date`, `body`, `bodyHtml`) so hub consumers can hydrate messages reliably.
- Command Center / Worker: Fixed the Cloudflare Email Routing handler to accept the actual `email(message, env, ctx)` runtime shape. Inbound mail had been reaching the Worker but crashing on `event.message.raw`; the handler now accepts either shape and processes inbound messages correctly.
- Command Center: Fixed the hub inbox poller to parse raw Worker payloads via `mailparser`, fall back through `envelope` metadata, stop silently caching empty message bodies when the Worker returns `{ envelope, raw }`, and default to the deployed `workers.dev` endpoint until a custom domain route is attached.

## [2026-04-12] - Lead Architect (Codex)

### Fixed
- Website: Implemented the approved `service-itad.html` v2 metadata cleanup by switching page logos to `logo.svg`, removing `og:locale:alternate`, and adding a top-level JSON-LD `@id` for the ITAD service schema.
- Website: Localized the homepage JSON-LD in [`index.ja.html`] with Japanese service descriptions and `inLanguage: "ja"` so the approved bilingual homepage head work now includes locale-specific structured data.
- Website: Updated the Japanese homepage structured-data URLs to use [`index.ja.html`] directly and re-verified the reciprocal `hreflang` link from [`index.html`] back to the Japanese homepage.

## [2026-04-10] - Lead Architect (Codex)

### Fixed
- Command Center: Fixed chat tab rendering against agent payloads where `model` is returned as an object instead of a string. The shared dashboard helper now safely reads `model.primary`, preventing the chat UI from breaking before send.
- Command Center: Fixed inbox message rendering for HTML-heavy emails. The email viewer now prefers an isolated HTML preview when the plain-text body is clearly flattened or unreadable, instead of forcing a degraded text dump.
- Command Center: Removed the admin-token prompt for routine read-only RPC calls like `agents.list`. The backend now allows safe dashboard reads without a token while keeping mutating or sensitive RPC methods behind admin auth.
- Command Center: Fixed reactive email detection to track newly seen inbox message IDs instead of only unread messages. This prevents inbound emails from being ignored when the inbox feed marks fresh mail as `isRead: true`.
- Command Center: Added an explicit `Auto / HTML / Text` switch in the inbox message view so specific emails can be opened in the readable body even when auto-detection is imperfect.
- Command Center: Added live activity details to the Agents tab so clicking an agent shows current status, last action, action counts, active deals, pending tasks, and recently used tools.
- Command Center: Added direct `create invoice` handling in chat plus a first-class `create_invoice` tool, so agents can turn a priced item list into a draft invoice without relying on the model to improvise the workflow.
- Website: Synced the Japanese homepage structure with the redesigned English homepage by restoring the `Signature offers` section in [`index.ja.html`].
- Website: Fixed the homepage final CTA on mobile by stacking `.cta-actions` buttons vertically so `Contact Thinkers GK` no longer overlaps the adjacent button on narrow screens.

## [2026-04-10] - Context & SEO Specialist (Gemini)

### Added
- SEO Optimization: Implementing `hreflang` tags across bilingual page pairs to improve search engine targeting for English and Japanese users.
- SEO Optimization: Translating metadata (Title, Description, Keywords, OG tags) for `.ja.html` files to improve Japanese search visibility.

### Fixed
- SEO: Correcting canonical tags on Japanese pages to point to their respective versions (preventing exclusion from indexing).
