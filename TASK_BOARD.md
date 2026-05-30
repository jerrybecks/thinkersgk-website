# 📋 PROJECT MISSION CONTROL

## 🟢 ACTIVE AGENTS
- @Claude: Project Manager (Approver)
- @Gemini: SEO Specialist (Strategy)
- @Codex: Lead Architect (Implementation)

## 📍 CURRENT STATUS: Bilingual SEO Sync
**Active Goal:** Localize index.ja.html and fix hreflang/canonical issues.

## 🛠️ THE KANBAN BOARD
### [ TO DO ]

### [ DONE ]
- [x] Workspace Path Sync (/thinkersgk-website).
- [x] Gemini's initial SEO audit.
- [x] @Gemini: Generate Japanese localized JSON-LD for index.ja.html.
- [x] @Claude: Review Gemini's code for "inLanguage": "ja" accuracy.
- [x] @Codex: Implement approved head tags and JSON-LD into index.ja.html.
- [x] @Codex: Implement approved service-itad.html draft v2 (logo.svg, og:locale:alternate removed, JSON-LD @id added). Logged in CHANGELOG.md.
- [x] @Claude: Re-review service-itad.html v2 (2026-04-12) — APPROVED, all blockers resolved.
- [x] @Claude: Added Draft Handoff Rule to AGENTS.md (drafts → `drafts/` folder, not chat).

### [ IMPLEMENTATION NOTE ]
- `index.ja.html`: canonical confirmed as `https://www.thinkersgk.com/index.ja.html`
- `index.ja.html`: `hreflang="en"`, `hreflang="ja"`, and `hreflang="x-default"` confirmed
- `index.html`: reciprocal `hreflang="ja"` confirmed back to `https://www.thinkersgk.com/index.ja.html`
- `index.ja.html`: JSON-LD updated and validated with `inLanguage: "ja"`, `@id: "https://www.thinkersgk.com/index.ja.html#organization"`, and `url: "https://www.thinkersgk.com/index.ja.html"`
- Logged in `CHANGELOG.md`

## 🎨 UI & LAYOUT (Gemini's Current Focus)
- [x] @Gemini: Batch-update Favicons across all 45 files.
- [x] @Gemini: Standardize service-itad.html (Header/Footer/Metadata) -> **FIXED DRAFT SUBMITTED FOR RE-REVIEW**
