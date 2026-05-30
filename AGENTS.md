# Agent Workforce Rules

## Roles & Responsibilities
- **@Codex**: Lead Architect. Handles complex TypeScript/React logic, backend integration, and heavy code refactoring.
- **@Gemini**: Context & SEO Specialist. Handles large-scale file analysis, SEO keyword integration, documentation, and project-wide searches.
- **@Claude**: (Currently OOO/Usage Limit) Project Manager. Final code reviewer and UI/UX consultant.

## Current Project Context
- **Project Path**: /Users/mac/agent-workspaces/thinkersgk-website
- **Active Goal**: Finalizing SEO redesign and modernizing components.
- **Primary Agent**: Codex is currently leading implementation. Gemini is supporting with context and research.

## Collaboration Protocol
1. Agents must check `AGENTS.md` for current task status before starting work.
2. If Codex needs broad context on files it hasn't read, it should prompt the user to "Ask Gemini to analyze [folder] and summarize."
3. All code changes should be logged in a `CHANGELOG.md`.

## Completed Tasks
- `[DONE]` 2026-05-10 — Removed the public SLA commitments dashboard from `how-we-work.html`, removed the live ops snapshot JavaScript/CSS that exposed response/SLA metrics, and replaced the homepage `Response SLA` stat with operational coverage copy.
- `[DONE]` 2026-05-10 — Hub publishing body now converts approved Orion Markdown drafts from `blog/drafts/` into live `blog/posts/` HTML and updates `blog/index.html`.

## Draft Handoff Rule (Token Discipline)
**Do NOT paste full file drafts into chat.** Instead:
1. **Author agent** (Gemini or Codex): save the draft to `drafts/<filename>` (e.g. `drafts/service-itad.html`). Create the `drafts/` folder if it doesn't exist.
2. **Announce in chat**: post only the file path + 1–3 line summary of changes. Example: `Draft ready at drafts/service-itad.html — fixed logo.svg, removed og:locale:alternate, added JSON-LD @id.`
3. **Reviewer** (Claude): reads from disk directly via Read tool, reviews, posts verdict.
4. **On approval**: implementing agent moves/copies from `drafts/` to the real path and deletes the draft.

Rationale: pasting a 250-line HTML file consumes ~3–5k tokens per round trip. Reading from disk costs ~0 chat tokens and gives the reviewer line-number precision.
