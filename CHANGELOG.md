## 2026-07-15 - Shared footer phone placement
- Moved the public phone number into the canonical Contact footer beside the email, LinkedIn, and LINE links across English and Japanese pages.
- Kept the number clickable and localized as `+81 90-6366-7901` in English and `090-6366-7901` in Japanese.

## 2026-07-14 - Phase 3 canonical shared header and footer
- Added `scripts/sync-shared-layout.js` as the single source of truth for corporate navigation, header branding, and footer content across root, service, and blog pages.
- Generated consistent static EN/JP navigation and footer markup so the information architecture remains correct before JavaScript runs.
- Standardized the approved transparent Thinkers GK logo and relative asset paths throughout generated headers and footers.
- Added a CI drift guard that fails when any generated corporate header or footer diverges from the canonical layout.
- Removed runtime primary-navigation reconstruction while preserving the enhanced Services dropdown and active-section semantics.

## 2026-07-14 - Phase 2 navigation and contact-path standardization
- Standardized the rendered corporate navigation to Home, Services, ITAD Japan, Why Thinkers GK, How We Work, Insights, and Contact Us across normal sitemap pages.
- Added English/Japanese destination parity, active-section `aria-current` semantics, and a visible active navigation state.
- Kept the 30-minute consultation calendar as a secondary option on the contact page rather than replacing the inclusive Contact Us route.
- Preserved the standalone Gerald business-card page as an intentional navigation exception.

## 2026-07-14 - Public business-hours and response-language alignment
- Standardized published business hours and structured data to Monday-Friday, 09:00-17:00 JST.
- Removed unsupported public four-hour, four-to-eight-hour, 48-hour, and sub-hour response promises from marketing and confirmation copy.
- Clarified that enquiry handling depends on scope, location, urgency, and confirmed availability, while contract-specific service levels are agreed separately.


## 2026-07-14 - Search Console indexing cleanup
- Corrected `lang="ja"` to `lang="en"` on 15 English service and blog pages reported as crawled but not indexed.
- Repaired malformed meta-description tags on affected service and article pages so Google can parse the document head reliably.
- Fixed two Japanese field-engineering links that pointed to the nonexistent `blog/blog.ja.html` route.
- Added noindex/canonical redirect aliases for three genuine legacy blog URLs reported as 404s.
- Removed the Japanese privacy policy from the sitemap and marked it `noindex, follow`, while keeping the legal page publicly accessible.
- Blocked search crawling of the form API and Cloudflare email-protection utility paths in `robots.txt`.

## 2026-07-06 - SEO and AI Search Sprint
- Updated robots.txt, llms.txt, sitemap freshness, RSS feed, and IndexNow key file for search and AI crawler discovery.
- Added four high-intent authority articles for ITAD Japan, device lifecycle management, Windows 11 refresh, and Intune/device compliance.
- Updated blog index and homepage structured-data service labels to support SEO/AEO positioning.
# Changelog

## 2026-08-17 — Mobile layout QA follow-up

- Constrained the homepage decorative circuit layer on narrow viewports so its SVG artwork cannot expand the document beyond the phone viewport.
- Aligned the mobile back-to-top control with the shared floating-control spacing instead of placing it in the same bottom zone as the LINE/chat controls.
- Clipped narrow-screen horizontal overflow and kept the chat launcher in the lower floating-control slot to avoid covering the first CTA row.
- Local-only preparation; no publication or deployment performed.

## 2026-08-17 — Chat intake clarity

- Made the chat opening prompt action-oriented so visitors understand the three starting routes and can describe their need directly.
- Confirmed the footer LINE short link resolves to the same LINE destination as the floating badge; no link change was required.
- Local-only preparation; no publication or deployment performed.

## 2026-08-16 — Scoped legacy service claims

- Replaced legacy “zero downtime” VoIP cutover wording in English and Japanese with controlled-cutover language that references documented continuity and failover options.
- Replaced “guaranteed response times” on hardware maintenance pages with response timing agreed within scope and availability.
- Replaced “unlimited onsite” wording in the service hub with open-ended onsite wording and clarified the Japanese equivalent.
- Local-only preparation; no publication or deployment performed.

## [2026-07-17] - B2B privacy and contact alignment

### Updated
- Website: Updated both privacy policies to disclose permitted professional contact sourcing and B2B communications, explain limited automation and suppression controls, provide marketing opt-out rights, and add the corporate phone number `090-6366-7901` to the legal contact blocks.

## 2026-07-14 — Consent-aware GA4 lead measurement

- Created the Thinkers GK GA4 web stream (`G-LSD1CGSKBS`) and added consent-aware sitewide measurement without enabling advertising storage or personalisation.
- Added bilingual analytics consent controls plus appointment, email, phone, successful enquiry, and chat-escalation events.
- Updated the English and Japanese privacy notices to disclose Google Analytics usage, consent behaviour, and excluded enquiry data.

## [2026-07-06] - Lead Architect (Codex)

### Updated
- Website: Repositioned `index.html`, `index.ja.html`, `services.html`, and `services.ja.html` so the homepage and service-hub copy now lead with device lifecycle, bilingual IT operations, onsite execution, ITAD, and practical Microsoft 365 / Intune security cleanup instead of broader transformation-first language; refreshed EN/JP meta descriptions, hero framing, service hierarchy labels, and signature-offer / pillar copy accordingly.
- Website: Expanded `service-device-lifecycle.html` into a fuller Device Lifecycle & Asset Management offer page with asset-register cleanup, managed lifecycle, Windows 11 refresh, partner-backed Device-as-a-Service, and ITAD/buyback starting offers; added pricing-basis language and stronger buyer-fit / related-service positioning without introducing public prices, owned inventory claims, certifications, or partner names.
- Website: Repositioned `service-m365-saas.html`, `service-zero-trust.html`, and `service-cybersecurity.html` around practical device-security operations tied to the device lifecycle rollout, shifting the copy toward MFA, access review, Intune/device compliance, endpoint coordination, backup checks, and evidence-ready remediation while dialing back broad SOC/incident-response implications.
- Website: Tightened the July 6 lifecycle repositioning pass by toning down procurement-first and certification-heavy phrasing on `index.html`, `index.ja.html`, `services.html`, `services.ja.html`, and `service-device-lifecycle.html`; aligned the device-lifecycle page's SEO/hero language around deployment, records, retrieval, and closeout; and repaired `service-cybersecurity.ja.html` metadata/hero copy plus its broken process CTA link.
- Website: Added a LinkedIn contact chip to the footer contact blocks on the updated buyer-path pages, converted the LINE and AI launchers into stacked pill-style floating controls, and fixed the redesign/mobile overrides so the local preview no longer overlaps the two floating buttons or the chat panel.

## [2026-06-30] - Lead Architect (Codex)

### Added
- Website: Added `/gerald/` NFC-ready digital business card page for Gerald Anyanwu, including downloadable vCard, Thinkers GK logo asset, and sitemap entry for the public tap-to-share URL.

### Fixed
- Cloudflare: Disabled the temporary homepage hotfix Worker routes so the homepage is served directly from GitHub Pages again, and changed the Worker fallback behavior so raw GitHub asset fetch failures no longer show `Homepage hotfix asset unavailable`.
- Website: Restyled `/gerald/` as a mobile adaptation of the printed Thinkers GK business card while preserving the vCard save flow and quick contact actions.
- Website: Removed the redundant TEL/MAIL/PIN/WEB rail from the top of `/gerald/` and strengthened the card-style circuit/square background treatment to better match the printed business card.
- Website: Made the `/gerald/` address clickable with a Google Maps link for directions.
- Website: Reworked the `/gerald/` card background into a Data Matrix, binary, blueprint-grid, and circuit-board inspired visual system to better match the printed card design direction.

## [2026-06-28] - Lead Architect (Codex)

### Fixed
- Website: Centered the homepage cinematic hero for phone layouts in `styles/redesign.css` by resetting the negative headline-stack offset on mobile, centering the copy block/actions, and keeping the hero text/signals visually centered during narrow-width review.
- Website: Followed up on phone-preview QA by converting the mobile hero copy/headline wrapper into a centered grid at both stacked breakpoints, so the homepage headline block no longer visually leans left inside the mobile frame.
- Website: Centered the shared footer on phone widths in `styles/main.css`, then normalized every page and published article to `main.css?v=73` so the footer brand, columns, and copyright line align centrally across homepage, services, contact, service pages, legal pages, and blog pages without stale mobile caches.
- Website: Reworked the mobile navigation alignment in `styles/main.css` so hamburger-menu links use one left-aligned layout system, fixing the `Services` row/toggle misalignment and bumping the shared stylesheet to `main.css?v=74` across all pages.
- Website: Updated the mobile navigation again so the full hamburger menu is centered consistently, including the `Services` row while keeping its trigger aligned, and bumped the shared stylesheet to `main.css?v=75` across all pages.
- Website: Added a low-risk second-pass mobile polish layer in `styles/redesign.css` and normalized redesign asset references to `redesign.css?v=32`, tightening section rhythm, reducing mobile heading looseness, and making stacked CTAs/card padding feel more balanced across homepage, services, contact, and blog templates.

## [2026-06-18] - Lead Architect (Codex)

### Fixed
- Website: Ran a post-merge Japanese buyer-path QA sweep, confirmed core EN/JP entry pages returned HTTP 200, browser-verified `index.ja.html` stayed on the explicit JP route with `lang="ja"`, and opened the repaired local review URLs on the MacBook.
- Blog: Ran a local-only lead-routing growth pass on `blog/index.html` and representative article pages; made the blog index internally coherent as an English reading lane, strengthened the top "Start here" section with four business-need routes (operations, security, modernization, device lifecycle/ITAD), repaired weak/misalabeled blog-card summaries, removed editorial placeholder / fact-check residue from `blog/posts/top-ai-automation-trends-for-japan-2026-what-manufacturing-and-distribution-oper.html`, strengthened its conversion handoff, browser-verified the refreshed pages locally, and reopened the review URLs on the MacBook.
- Blog: Ran a second live-article quality sweep across `blog/posts/zoho-email-operations-key-considerations-for-japan-based-teams-after-migration.html`, `blog/posts/top-ai-automation-trends-in-japan-2026-insights-for-manufacturers-and-logistics.html`, and `blog/posts/navigating-top-ai-automation-trends-in-japan-2026-insights-for-japanese-business.html`; removed draft frontmatter / fact-check / placeholder residue, replaced unsupported company-specific examples with generalized Japan-relevant operational guidance, normalized broken/truncated metadata descriptions, upgraded the CTA handoffs, verified in browser that trust-damaging draft strings were gone, and reopened the refreshed review URLs on the MacBook.
- Blog: Turned the `blog/quarantine/` AI-draft review into a fresh local-only article addition by writing `blog/posts/ai-automation-japan-where-operational-pilots-fail-first.html` from scratch, adding a matching top-of-feed card on `blog/index.html`, repointing the blog's "Modernization planning" lane to the new article, browser-verifying that the new article rendered cleanly without draft residue, and opening the refreshed local review URLs on the MacBook.
- Website: Ran an English core-page conversion parity pass across `services.html`, `about.html`, and `contact.html`; synced simple English fallback labels to match the rendered EN lane where static HTML still defaulted to Japanese, strengthened the About page with a buyer-fit guidance band and a richer closing CTA/checklist, browser-verified the refreshed EN pages locally, and opened the updated review URLs on the MacBook.
- Website: Ran a release-readiness head/SEO cleanup across the Japanese service and trust pages; removed duplicated canonical tags and stray duplicate hreflang lines from 18 localized pages, repaired the malformed description-tag pattern left in the older minified Japanese service templates, browser-verified a representative repaired page with clean canonical/alternate extraction, and opened the refreshed local review URLs on the MacBook.
- Website: Added a lightweight GitHub Actions release guardrail with `.github/workflows/static-site-smoke.yml` and `scripts/validate_static_site.py`; the validator checks required root files, core buyer pages, and JP localized canonical/hreflang integrity, and it passed locally before commit.
- Website: Added lightweight conversion instrumentation across the shared site JS plus core buyer-path pages (`index.html`, `contact.html`, `blog/index.html`); introduced Umami event hooks for homepage CTA intent, blog lane routing, contact calendar/LINE clicks, and contact form submit attempt/success, then browser-verified the contact-path events locally and reopened the review URLs on the MacBook.
- Docs: Added `docs/conversion-measurement-spec.md` and `docs/weekly-conversion-review.md` to define the active Umami event model, business KPI interpretation, and a lightweight weekly operator review workflow; updated `CLAUDE.md` so project analytics guidance now reflects the live Umami-based measurement setup instead of the old GA4 placeholder note.
- Docs: Added `docs/weekly-conversion-review-template.md` and `docs/conversion-review-worksheet.md` so operators can turn Umami event counts into a reusable weekly report, a first-run worksheet, and one explicit next-action decision without inventing a reporting format each week.
- Website: Eliminated the highest-impact Japanese buyer-path 404 cluster by adding localized counterparts for missing linked routes including `service-ai-integration.ja.html`, `service-cloud-consulting.ja.html`, `service-cloud-migration.ja.html`, `service-cybersecurity.ja.html`, `service-data-backup.ja.html`, `service-device-lifecycle.ja.html`, `service-dx-consulting.ja.html`, `service-it-support.ja.html`, `service-m365-saas.ja.html`, `service-managed-services.ja.html`, `service-networking.ja.html`, `service-office-relocation.ja.html`, `service-onsite-dispatch.ja.html`, `service-project-management.ja.html`, `service-wireless-survey.ja.html`, and `service-zero-trust.ja.html`.
- Website: Added `service-asset-lifecycle.ja.html`, `why-us.ja.html`, and `get-started.ja.html`, then repointed the remaining high-value Japanese core/service links so the localized buyer path no longer drops users into missing English-only routes on homepage, services, legal, or related-service surfaces.
- Website: Repointed remaining Japanese cross-links on existing pages such as `privacy-policy.ja.html`, `terms-of-service.ja.html`, `service-field-engineering.ja.html`, `service-staff-augmentation.ja.html`, `service-ai-solutions.ja.html`, `index.ja.html`, and `services.ja.html` to their Japanese counterparts where those localized pages now exist.
- Website: Reduced the remaining non-Japanese internal links in `*.ja.html` to untranslated blog-post links on `index.ja.html`, leaving the core buyer path, service hub, and strategic conversion pages localized and returning HTTP 200 during local review.
- Website: Ran a follow-on quality pass across the newly created Japanese pages, localized the browser titles and description metadata to Japanese, normalized `description` / `og:description` / `twitter:description` consistency across the full 19-page audited batch, fixed the leftover `get-started.ja.html` and `service-device-lifecycle.ja.html` head/JSON-LD drift, synced simple visible fallback text to existing `data-ja` values, browser-verified representative pages, and reopened fresh local review URLs on the MacBook.
- Website: Ran a focused Japanese conversion-guidance pass on `index.ja.html`, `services.ja.html`, `contact.ja.html`, and `about.ja.html`; added explicit buyer self-selection copy near the homepage hero, added a practical "how to start" guidance block plus inquiry example on the services hub, added pre-form submission guidance and stronger consultation prompts on the contact page, added a buyer-fit conversation section on the about page, corrected the about-page placement bug so the new section renders before the footer, browser-verified all four pages locally, and reopened the refreshed review URLs on the MacBook.

## [2026-06-16] - Lead Architect (Codex)

### Fixed
- Website: Stopped `scripts/main-language.js` from auto-redirecting users away from explicit Japanese page URLs, so direct visits to `index.ja.html`, `services.ja.html`, and the bilingual legal pages now stay on the Japanese versions during local review.
- Website: Stopped `scripts/main.js` from auto-redirecting explicit `.ja.html` service/content pages back to English, so pages such as `service-field-engineering.ja.html` now remain in the Japanese route when opened directly.
- Website: Repointed the main Japanese-page navigation and footer links (`index.ja.html`, `services.ja.html`, `about.ja.html`, `contact.ja.html`, `privacy-policy.ja.html`) to their Japanese counterparts where those pages exist, keeping local review inside the JP flow instead of bouncing back to English pages.
- Website: Repointed remaining Japanese cross-links that still leaked into English where localized counterparts exist, including `service-field-engineering.ja.html` references from homepage/services/legal/contact/about surfaces.
- Website: Polished `service-field-engineering.ja.html` so the visible default copy is consistently Japanese during local review, and restored the localized diagnostics section for on-site validation / packet troubleshooting coverage.
- Website: Added `service-it-support.ja.html` as a new Japanese-localized service page, aligned its metadata and internal routing for the JP flow, and repointed Japanese entry/footer/service-card links that previously went to the English IT Support page.
- Website: Added `service-cybersecurity.ja.html` as a new Japanese-localized service page, rebuilt it cleanly after a malformed first pass, aligned its metadata and routing for the JP flow, and repointed Japanese homepage/services/footer/related-service links that had still been leaking into the English cybersecurity page.
- Website: Added `service-managed-services.ja.html` as a new Japanese-localized service page and repointed key Japanese entry/footer/related-service links so higher-intent managed-operations traffic no longer falls back into the English service route.
- Website: Added `service-asset-lifecycle.ja.html` as a new Japanese-localized asset-lifecycle page, repaired the source page's malformed metadata during localization, repointed Japanese footer/service references away from the English route, and tightened related-service wording/link targets so the JP flow stays localized and uses safer public-facing security language.
- Website: Added `service-cloud-consulting.ja.html` as a new Japanese-localized consulting page, repaired malformed source metadata during localization, repointed Japanese footer/services/related-service references away from the English route, and preserved a cleaner Japanese modernization/strategy lane for higher-intent consulting traffic.
- Website: Added `service-project-management.ja.html` as a new Japanese-localized project-management page, repaired malformed source metadata during localization, repointed Japanese services/related-service references away from the English route, and strengthened the JP path for rollout, migration, and execution-focused buyer intent.
- Website: Added `service-device-lifecycle.ja.html` as a new Japanese-localized device-lifecycle page, repointed the Japanese homepage/services hub away from the English route, and aligned metadata plus JP navigation/footer routing for procurement, deployment, tracking, retrieval, and ITAD-related buyer flow.
- Website: Added `service-m365-saas.ja.html` as a new Japanese-localized Microsoft 365 / SaaS support page, aligned its metadata and JP routing, and repointed the remaining Japanese homepage/services/footer links that had still been leaking into the English M365 route.
- Website: Tightened the Japanese managed-services conversion path by repointing `service-managed-services.ja.html` related-service and CTA links to Japanese counterparts, and added `how-we-work.ja.html` as a localized process page so the "進め方を見る" CTA no longer drops higher-intent Japanese visitors back into the English route.
- Website: Tightened the Japanese cybersecurity conversion path by repointing `service-cybersecurity.ja.html` related-service, CTA, and process links to Japanese counterparts (`service-it-support.ja.html`, `service-managed-services.ja.html`, `contact.ja.html`, `services.ja.html`, `how-we-work.ja.html`) so the security buyer flow now stays inside the JP route set.
- Website: Added `service-office-relocation.ja.html` as a new Japanese-localized office-relocation page, repaired its inherited malformed meta description during the localization pass, repointed `service-asset-lifecycle.ja.html` CTA/related-service links to Japanese counterparts, and updated the remaining Japanese entry pages (`services.ja.html`, `service-field-engineering.ja.html`) so `href="service-office-relocation.html"` no longer appears anywhere in the `*.ja.html` route set.
- Website: Added `service-onsite-dispatch.ja.html` and `service-project-management.ja.html` as new Japanese-localized service pages, repaired the malformed inherited meta description pattern in both localized outputs, repointed `service-office-relocation.ja.html`, `services.ja.html`, `service-field-engineering.ja.html`, and `service-it-support.ja.html` to the new JP counterparts, and verified that `href="service-onsite-dispatch.html"` and `href="service-project-management.html"` now appear zero times across `*.ja.html`.
- Website: Added `service-dx-consulting.ja.html` as a new Japanese-localized DX consulting page, repointed the remaining Japanese homepage and services entry links (`index.ja.html`, `services.ja.html`) to the new counterpart, and verified that `href="service-dx-consulting.html"` now appears zero times across `*.ja.html`.
- Website: Added `service-ai-integration.ja.html` and `service-cloud-migration.ja.html` as new Japanese-localized strategic service pages, repointed the remaining Japanese homepage/services/DX entry links to the new counterparts, and verified that `href="service-ai-integration.html"` and `href="service-cloud-migration.html"` now appear zero times across `*.ja.html`.
- Website: Added `service-zero-trust.ja.html` and `service-networking.ja.html` as new Japanese-localized infrastructure/security pages, repointed the remaining Japanese homepage/services/cloud-migration entry links to the new counterparts, and verified that `href="service-zero-trust.html"` and `href="service-networking.html"` now appear zero times across `*.ja.html`.
- Website: Added `service-wireless-survey.ja.html` and `service-data-backup.ja.html` as new Japanese-localized infrastructure continuity pages, repaired the inherited malformed meta-description pattern in both localized outputs, repointed the remaining Japanese services/related-service links away from the English routes, verified that `href="service-wireless-survey.html"` and `href="service-data-backup.html"` now appear zero times across `*.ja.html`, and opened both local review URLs on the MacBook for visual QA.
- Website: Added `service-ai-solutions.ja.html` and `service-staff-augmentation.ja.html` as new Japanese-localized buyer-path pages, repointed the remaining Japanese homepage/services/footer links away from the English AI and staff-augmentation routes, rerouted the lingering Japanese ITAD cards to the existing `itad-japan.html` lane, cleaned residual internal service-link leaks inside the new JP pages, verified `service-ai-solutions.ja.html 200` and `service-staff-augmentation.ja.html 200`, browser-verified both JP routes, and opened both local review URLs on the MacBook for visual QA.
- Website: Added `service-access-control.ja.html`, `service-av-solutions.ja.html`, `service-cybersecurity-training.ja.html`, `service-hardware-maintenance.ja.html`, `service-service-desk.ja.html`, and follow-on `service-voip.ja.html` as new Japanese-localized service pages; repointed the remaining `services.ja.html` hub leaks to the new JP routes; cleaned the new AV/VoIP related-service and footer links to existing JP counterparts; verified all six JP pages return HTTP 200; browser-verified the AV and VoIP JP routes; opened local MacBook review URLs; and confirmed the repo-wide `*.ja.html` sweep now contains zero remaining English `service-*.html` leaks.
- Website: Ran a Japanese copy/metadata QA pass across `service-access-control.ja.html`, `service-av-solutions.ja.html`, `service-cybersecurity-training.ja.html`, `service-hardware-maintenance.ja.html`, `service-service-desk.ja.html`, `service-voip.ja.html`, `service-ai-solutions.ja.html`, and `service-staff-augmentation.ja.html`; synced visible fallback text to existing `data-ja` values so static/local rendering is Japanese by default; aligned meta description, OG, and Twitter description copy across the audited pages; browser-verified refreshed local review URLs for Service Desk and VoIP; and reopened those QA links on the MacBook.
- Website: Ran a Japanese entry-page conversion-readiness pass across `index.ja.html`, `services.ja.html`, `contact.ja.html`, and `about.ja.html`; synced visible fallback copy to existing `data-ja` values, normalized description metadata equality on all four pages, localized the homepage/services strategic offer labels for `レガシー橋渡し診断` and `AI運用統制パイロット`, tightened the public ITAD services-card wording to safer operational language, cleaned the mixed `改善 guidance` copy on the cybersecurity card, browser-verified refreshed local review URLs for the homepage and services page, and opened those review links on the MacBook.
- Website: Ran a local pre-publish Japanese punch-list review across `index.ja.html`, `services.ja.html`, `about.ja.html`, `contact.ja.html`, `service-ai-solutions.ja.html`, `service-staff-augmentation.ja.html`, `service-voip.ja.html`, and `service-service-desk.ja.html`; confirmed there were no critical blockers (all pages returned HTTP 200, retained `lang="ja"`, and kept description metadata aligned), removed a duplicate footer `ブログ` link from `service-ai-solutions.ja.html`, browser-verified refreshed review URLs for the homepage, services, contact, about, and AI Solutions pages, and reopened those local URLs on the MacBook.
- Blog: Corrected a malformed Japanese inline service link in `blog/posts/it-asset-lifecycle-management-2026.html` that had broken the `ITサポート` anchor in the article conclusion.

## [2026-06-15] - Lead Architect (Codex)

### Updated
- Website: Applied a local-first cosmetic refresh across `index.html`, `services.html`, `why-us.html`, `about.html`, `contact.html`, and `how-we-work.html` by adding page-specific body hooks and extending the shared CSS system for tighter spacing, stronger card hierarchy, richer section framing, and more consistent CTA presentation.
- Website: Elevated the Services experience with stronger overview/offer card treatments, clearer pricing and engagement blocks, alternating section polish, and improved scanability for long-form service content.
- Website: Upgraded supporting pages (`why-us`, `about`, `contact`, `how-we-work`) with more premium section styling, improved trust/info card presentation, better process/timeline treatment, and a reveal fallback so About-page content remains visible during local review.
- Website: Integrated the homepage circuit-board motif directly around the hero badge/headline with animated trace paths and moving signal points so the motion now frames the opening message during local preview.
- Website: After local review, removed the circuit hero variants from the secondary pages and kept the homepage hero version as the preferred direction for now.
- Housekeeping: Archived local review screenshots, internal pattern-lab/template files, non-website bank-submission drafts, and temporary project-note files to `/Users/mac/Archives/thinkersgk-website-cleanup/2026-06-15/` to reduce clutter in the active website repo.
- Website: Added a new homepage buyer-trigger section plus a richer final CTA checklist, and inserted a services-page starting-lane section so business buyers can self-identify faster and reach a useful inquiry path more quickly during local review.
- Website: Ran a second local growth pass to reduce long-scroll fatigue, add compact proof strips near the top of the homepage and services page, and tighten section spacing on high-scroll areas before live review.
- Website: Consolidated lower-page flow by removing the redundant homepage motion-band section and the repetitive bottom services spotlight so both key pages end with a clearer path into the final CTA.
- Website: Reframed the services-category section with category summary chips and more compact service cards (tighter spacing plus clamped descriptions) so buyers can scan 24 service entries faster during local review.
- Website: Compressed the long offer-detail stack on the services page with shorter intros, quick-point chips, tighter meta cards, and denser detail panels so the mid-page offer section reads faster without removing proof or CTA paths.
- Website: Polished the offer-detail header CTAs to sit lighter against the compressed content by softening button treatment, aligning them to the top edge, and improving mobile stacking.
- Website: Completed another local-only whole-site growth pass by strengthening the About page with a proof strip, best-fit engagement cards, and a richer CTA checklist, while upgrading the Contact page with inquiry-lane guidance, expectation-setting proof chips, and a higher-clarity intake checklist before form submission.
- Website: Applied a final tiny local polish pass before go-live by tightening homepage closing-CTA spacing, slightly compacting services offer-detail stacks, refining About proof/checklist density, and reducing the visual bulk of the Contact consultation block.
- Blog: Rebuilt the malformed Zoho Mail post into a normal polished article, replaced the repeated thumbnail treatment, added stronger article/service CTAs, introduced a "Start here" lead-routing section on `blog/index.html`, and cleaned the top AI card excerpt so the blog feed reads more credibly during local review.

## [2026-06-11] - Lead Architect (Codex)

### Added
- Website: Added an internal `pattern-lab.html` review page with halftone, pixel scatter, circuit board, node-network, website-section, and business-card mockups for Thinkers GK brand-pattern exploration.
- Website: Added a recommended hybrid pattern direction that combines a quiet node network, faint circuit traces, and restrained halftone accents for use across the website and future business-card artwork.
- Website: Applied the recommended hybrid node/circuit/halftone pattern to the live local homepage hero as a reviewable brand-system experiment.
- Website: Updated the pattern-lab business-card concepts to use the current Thinkers logo asset instead of typed placeholder branding.
- Website: Revised the live local homepage hero experiment to use a circuit-board-only pattern, removing the node-network and halftone layers from the website treatment.

## [2026-06-06] - Lead Architect (Codex)

### Fixed
- Website: Removed duplicate blog imagery by syncing every published blog post's visible hero image, `og:image`, `twitter:image`, JSON-LD image, and blog-index card image to one unique article-specific asset.
- Website: Replaced stale generic `about-hero-1400x600.jpg` fallbacks on published blog posts that were causing repeated social previews and repeated blog visuals.

### Added
- QA: Added `scripts/check-blog-images.js` to fail future checks if published blog posts reuse the same hero image, drift between hero/social/structured-data images, or if the blog index card grid shows duplicate images.

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
# 2026-07-13 — Google Calendar booking migration

- Replaced the live Cal.com consultation links and embedded scheduler on the English and Japanese contact pages with the ThinkersGK Google Calendar appointment schedule.
- Updated delegated click classification and conversion-measurement documentation to recognize Google Calendar appointment-schedule URLs.
- Preserved the existing analytics event names so historical and future booking-intent reporting remains continuous.

# 2026-07-13 — Unified website intake and Atlas handoff

- Repaired the live `/api/intake` and `/api/contact` Cloudflare routes and made the API implementation part of this repository under `workers/intake-api/`.
- Removed Cloudflare/free-model qualification and automatic acknowledgement sending from website form ingestion. Cloudflare now validates and durably stores enquiries; Atlas performs reasoning inside Hermes Business OS.
- Rotated the legacy website-submission administration credential and changed submission retrieval to bearer authentication.
- Connected both English and Japanese contact forms to the same first-party intake endpoint instead of Formspree.
- Preserved the Smart Intake form while routing its structured fields into the guarded agent workflow.
- Standardised new-enquiry response language across the homepage, contact, and Smart Intake flows; existing contracted support-ticket wording remains distinct.
- Added origin enforcement, honeypot handling, email validation, durable KV storage, and safe success/error states.
- Added a Hermes website-intake worker that creates an idempotent contact, lead, pipeline record, shared Atlas event, and approval-protected acknowledgement draft. It never sends autonomously.
# 2026-07-14 — Phase 4 accessible navigation

- Added a localized skip link and stable main-content focus target to every shared-layout page.
- Added synchronized mobile-menu state, localized accessible labels, first-link focus, Escape handling, outside-click closing, and desktop breakpoint cleanup.
- Connected the Services disclosure button to its panel and added localized open/close labels with focus restoration.
- Added consistent visible keyboard focus styling without changing the established visual layout.
# 2026-07-14 — Phase 5 contact conversion path

- Reorganized the English and Japanese contact journeys around two explicit starting choices: send project details or book a 30-minute consultation.
- Moved supporting intake guidance below the primary enquiry form and reduced LINE to a clearly available secondary channel.
- Preserved separate conversion measurement for form intent and success, consultation choice and calendar clicks, and LINE clicks.
- Standardized the Japanese contact-page hierarchy to match the English conversion path while retaining localized copy.
# 2026-07-14 — Phase 6 SEO and quality cleanup

- Completed the three flagged blog-title fixes by aligning visible titles, document language, and non-empty BlogPosting headlines.
- Added Gerald Anyanwu's missing canonical URL.
- Removed the LLM reference file and verification token from the search-engine sitemap while leaving both files available at their required URLs.
- Added a canonical EN/JA metadata synchronizer covering every paired page, including reciprocal `hreflang`, `x-default`, and correct document language.
- Integrated paired-page SEO drift detection into static-site CI validation.
- Completed desktop, tablet, and mobile browser QA across all published sitemap HTML routes.
# 2026-07-14 — Phase 7 security hardening

- Added authenticated five-minute edge caching to inbox list responses to keep Workers KV list operations below the free-tier daily limit without delaying individual message reads.
- Hardened the inbox Worker with fail-closed authentication, constant-time token comparison, strict origin handling, validated account/message keys, private response caching, and baseline API security headers.
- Enabled Worker observability for ongoing request and error investigation.
- Activated Cloudflare security response headers across the website: CSP, HSTS, clickjacking protection, MIME-sniff protection, referrer controls, and browser permissions restrictions.
- Enabled Cloudflare Bot Fight Mode and the free-tier rate-limiting rule for public contact, intake, chat, and escalation endpoints.
- Added managed Cloudflare Turnstile verification to the English and Japanese contact forms, including server-side hostname validation and request-size limits.
- Closed direct Worker endpoint bypasses by requiring bearer authentication for email sending, inbox access, email audits, and Resend administration; replaced unsafe substring origin checks with exact HTTPS hostname validation.
- Enabled GitHub branch protection, required static validation, pull-request-only changes, conversation resolution, Dependabot alerts/security updates, secret scanning, push protection, and automatic merged-branch cleanup.
- Added CI security-baseline drift checks for Turnstile, Worker authentication, strict origin validation, private email caching, and the KV list cache.

# 2026-07-15 — Public contact number

- Added the new Thinkers GK phone number to the English and Japanese contact pages.
- Added the matching international-format telephone value to contact-page structured data.

# 2026-07-15 — BIMI readiness asset

- Added a validated SVG Tiny P/S 1.2 Thinkers GK brand mark for future BIMI publication.
- Added the staged DMARC enforcement, CMC/VMC decision, BIMI DNS, verification, and rollback-safe deployment runbook.
## 2026-08-15 — Public claim wording review
- Softened unsupported outcome, certification, compliance, nationwide-coverage, and backup-recovery absolutes across public pages.
- Preserved the core positioning: bilingual delivery, coordinated regional execution, documented closeout, and scoped services.

