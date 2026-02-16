# CLAUDE.md — Thinkers GK Website

## Business Context
**Thinkers GK** (合同会社 Thinkers) is an IT services company headquartered in Tokyo, Japan. They serve both local Japanese businesses and foreign companies with branches in Japan. The website is bilingual (English/Japanese) and deployed to GitHub Pages at `https://jerrybecks.github.io/thinkersgk-website/`.

**Key business facts:**
- Bilingual IT services (English + Japanese)
- Based in Tokyo, covers all 47 prefectures
- 7 major city hubs: Tokyo (HQ), Osaka, Nagoya, Fukuoka, Sapporo, Sendai, Hiroshima
- Contact email: thinkerstars@gmail.com

---

## Tech Stack
- **Pure HTML/CSS/JS** — no frameworks, no build step, no Node.js
- **Hosting**: GitHub Pages (static site, `main` branch)
- **Font**: Inter (Google Fonts)
- **Form**: Formspree AJAX submission (form ID is still placeholder `your-form-id` — needs real ID)
- **Analytics**: GA4 placeholder (`G-XXXXXXXXXX` — needs real tracking ID)
- **No bundler** — edit files directly, push to deploy

---

## Project Structure

```
thinkersgk-website/
├── index.html                      # Homepage (hero, stats, services, Japan map, illustrations, CTA)
├── services.html                   # Services overview (9 core + 9 additional service cards)
├── about.html                      # About page
├── contact.html                    # Contact form (Formspree AJAX)
├── privacy-policy.html             # Privacy policy
├── blog-template.html              # Blog post template (unused)
│
├── service-it-support.html         # ─┐
├── service-field-engineering.html   #  │
├── service-cybersecurity.html       #  │  9 Core Service Pages
├── service-asset-lifecycle.html     #  │  (detailed deep-dive pages)
├── service-managed-services.html    #  │
├── service-cloud-consulting.html    #  │
├── service-onsite-dispatch.html     #  │
├── service-office-relocation.html   #  │
├── service-project-management.html  # ─┘
│
├── service-wireless-survey.html     # ─┐
├── service-av-solutions.html        #  │
├── service-voip.html                #  │  9 Additional Service Pages
├── service-networking.html          #  │  (same format as core pages)
├── service-access-control.html      #  │
├── service-data-backup.html         #  │
├── service-cybersecurity-training.html│
├── service-hardware-maintenance.html #  │
├── service-service-desk.html        # ─┘
│
├── scripts/
│   └── main.js                     # ALL JavaScript (theme, lang, particles, map, counters, animations)
│
├── styles/
│   └── main.css                    # ALL CSS (design system, components, responsive, animations)
│
├── assets/
│   ├── logo.svg                    # Brand logo (light mode) — THINKERS with thinker silhouette + sun rays
│   ├── logo-dark.svg               # Brand logo (dark mode) — same design, lighter colors
│   ├── illustration-engineer.svg   # SVG illustration: engineer + server rack
│   ├── illustration-support.svg    # SVG illustration: support agent at desk
│   └── illustration-network.svg    # SVG illustration: network hub diagram
│
└── favicon.svg                     # Site favicon
```

---

## Architecture & Patterns

### Theme System (Dark/Light)
- Toggle via `data-theme="dark"` attribute on `<html>`
- CSS variables define all colors in `:root` (light) and `[data-theme="dark"]` (dark)
- Stored in `localStorage` key: `thinkers-theme`
- `setTheme()` in main.js also swaps logo images between `logo.svg` / `logo-dark.svg`
- All canvas-based visuals (particles, Japan map) call `getColors()` which reads the current theme

### Language System (EN/JP)
- Toggle via `lang` attribute on `<html>`, stored in `localStorage` key: `thinkers-lang`
- All bilingual text uses `data-en` / `data-ja` attributes on elements
- Placeholders use `data-en-placeholder` / `data-ja-placeholder`
- `setLang()` iterates all `[data-en]` elements and swaps `textContent`
- The toggle button shows "JP" when in English, "EN" when in Japanese

### Logo
- **Design**: "THINKERS" text with the letter K replaced by a sitting thinker silhouette (person in thinking pose, hand on chin). A half-sun dome with 13 radiating rays sits above the thinker figure. "GK" subtitle below.
- **Light mode** (`logo.svg`): Navy blue `#1e3a6e` text, warm gradient sun `#d4860a` → `#f0a820`
- **Dark mode** (`logo-dark.svg`): Light grey `#e5e7eb` text, blue gradient sun `#3b82f6` → `#60a5fa`
- **viewBox**: `0 0 280 56` (5:1 aspect ratio)
- **Nav height**: 38px, Footer height: 34px
- JS swaps `img.src` in `setTheme()` — do NOT use CSS filters for dark mode (colors get distorted)

### Dot-Matrix Globe
- Canvas-based 3D sphere made of dots, centered on Japan, slow oscillating rotation
- `initGlobe()` in main.js — uses lat/lon → 3D projection with `project(latR, lonR)`
- Japan dots: larger (2.2px) and brighter; other land: 1.2px; ocean: 0.7px
- Bounding-box region test (`isInJapan()`, `isLand()`) classifies each dot
- **Each city has a unique color**: Tokyo gold `#f59e0b`, Osaka cyan `#06b6d4`, Nagoya purple `#8b5cf6`, Fukuoka green `#10b981`, Sapporo red `#f43f5e`, Sendai blue `#3b82f6`, Hiroshima pink `#ec4899`
- Tokyo gets "★ HQ" badge; all cities have pulsing radial gradient glow
- Dashed connection arcs from Tokyo to each city with animated traveling dots
- Oscillates ±0.3 radians around Japan center (rotY = 2.42)
- `getColors()` returns full theme-aware palette; `window._globeInstance.updateColors()` for live theme switch

### Particle Network (Hero Background)
- Canvas element in hero section with floating particles + connection lines
- Mouse interaction: particles attract toward cursor
- 80 particles on desktop, 40 on mobile
- Separate color scheme for dark/light modes

### Color Pulse Animation
- CSS `@keyframes colorPulse` with `background-size: 400% 400%`
- Applied to `.color-pulse-bg` overlay div
- **Light mode**: opacity 0.12, **Dark mode**: opacity 0.18
- 6-color gradient with diagonal movement animation (10s cycle)
- `initColorPulse()` in JS also injects color pulse divs into `.page-header` and `.service-page-hero` sections dynamically

### Service Page Templates
**Core service pages** have:
- Back link to services.html
- Service page hero with color pulse bg
- Detail section with 2-column grid (text + feature list)
- 4 feature cards grid
- 4 process steps
- CTA section
- Full footer

**Additional service pages** have the same structure as core pages plus:
- Testimonial block
- 3 related service links
- All 18 service pages are treated equally (no "Specialized" distinction on services.html)

### Contact Form
- Formspree AJAX submission (currently placeholder ID `your-form-id`)
- Has `_autoresponse` hidden field for auto-reply
- JS handles submit with fetch, shows success/error messages
- Fields: name, email, company, phone, service (select), message

### Scroll Animations
- `IntersectionObserver` adds `.visible` class for fade-in effects
- Targets: `.card`, `.feature`, `.cta-box`, `.service-detail-inner`, `.fade-target`, `.stat-item`, `.logo-bar`, `.contact-info`, `.contact-form`, `.service-feature-card`, `.process-step`, `.testimonial-block`
- Staggered delays: `(i % 6) * 0.1s`

---

## CSS Design System

### Key Variables
| Variable | Light | Dark |
|---|---|---|
| `--color-bg` | `#ffffff` | `#0f1117` |
| `--color-text` | `#111827` | `#e5e7eb` |
| `--color-accent` | `#2563eb` | `#3b82f6` |
| `--color-card-bg` | `#ffffff` | `#161822` |
| `--color-nav-bg` | `rgba(255,255,255,0.85)` | `rgba(15,17,23,0.85)` |
| `--radius` | `12px` | `12px` |
| `--max-w` | `1120px` | `1120px` |

### Key CSS Classes
- `.section` — Standard section padding (80px vertical)
- `.section-alt` — Alternate background section
- `.cards-grid` — 3-column responsive grid
- `.card` — Elevated card with hover effect (rotateZ + scale)
- `.card-link` — Wraps cards in `<a>` tags (used on services.html)
- `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm` — Button variants
- `.hero` — Full-viewport hero with particle canvas
- `.globe-section` — Japan map section (2-column grid: text + canvas)
- `.globe-inner` — Grid layout: text left, map canvas right
- `.coverage-tag` — Small pill badges for city names
- `.stats-grid` — 4-column stats counter grid
- `.page-header` — Standard page header with gradient bg
- `.service-page-hero` — Service detail page hero
- `.illustration-banner` — 3-column SVG illustration showcase
- `.logo-bar` — Auto-scrolling tech partner logo carousel
- `.fade-in` / `.visible` — Scroll-triggered fade-in animation

### Responsive Breakpoints
- `768px` — Mobile breakpoint (1-column layouts, smaller fonts)
- Cards grid: 3 cols → 1 col
- Globe section: 2-col → 1-col stack
- Stats: 4-col → 2-col

---

## Common Operations

### Adding a new service page
1. Copy `service-wireless-survey.html` as template
2. Replace title, meta description, hero content, feature cards, process steps, testimonial, related services
3. All text elements must have `data-en` and `data-ja` attributes for bilingual support
4. Add link to the new page in `services.html` (wrap card in `<a class="card-link">`)
5. Add link in footer's Services column if it's a core service

### Updating footer tagline across all pages
- All 24+ HTML files share the same footer structure
- The tagline is in `.footer-brand p` with `data-en` / `data-ja` attributes
- Use a batch script (Python recommended) to update across all files at once
- Current EN: "Trusted IT partner for local and international businesses across Japan."
- Current JA: "日本国内企業と在日外資系企業の信頼できるITパートナー。"

### Modifying the dot-matrix globe
- Edit `initGlobe()` in `scripts/main.js`
- City data: `{ name, lat, lon, isHQ, color, glow }` — real lat/lon degrees, auto-converted to radians
- Add Japan regions to `japanRegions[]` array (bounding boxes) to classify dots
- `project(latR, lonR)` does 3D→2D projection; `p.z > 0` = front of globe
- To add a city: add to `cities[]` array with unique `color` and `glow` rgba

### Changing the logo
- Edit `assets/logo.svg` (light) and `assets/logo-dark.svg` (dark)
- Both must have the same `viewBox` dimensions
- JS in `setTheme()` swaps the `src` on all `.nav-logo` img elements
- Do NOT use `currentColor` — it doesn't work in `<img>` tags
- Do NOT use CSS filters — they distort the specific brand colors

---

## Placeholders Needing Real Values
1. **Formspree form ID**: `contact.html` line 83 — replace `your-form-id` with actual Formspree form ID
2. **GA4 Tracking ID**: `index.html` lines 37-43 — replace `G-XXXXXXXXXX` with real GA4 measurement ID
3. **Phone number**: `index.html` structured data — replace `+81-X-XXXX-XXXX` with real phone

---

## Deployment
```bash
git add <files>
git commit -m "Description of changes"
git push origin main
```
GitHub Pages auto-deploys from `main` branch. Changes appear at `https://jerrybecks.github.io/thinkersgk-website/` within 1-2 minutes.

---

## Gotchas & Session Learnings
- **Always `cd /Users/mac/Documents/thinkersgk-website` before git commands** — cwd may drift
- **Read files before editing** — Edit tool will error with "File has not been read yet" if you skip this
- **Linter may modify files between reads** — always re-read if an Edit fails with "String not found"
- **Batch updates across 24+ HTML files** — use Python script, not manual sed (complex HTML breaks sed)
- **Logo in `<img>` tags** — cannot use `currentColor` or CSS `filter` for theming; must use separate SVG/PNG files
- **The globe function is named `initGlobe()`** even though it's evolved from globe → flat map → dot-matrix globe
- **services.html has NO "Specialized" distinction** — all 18 services are equal; don't re-add that label
- **Color pulse opacity** was originally 0.04/0.06 (invisible); now 0.12/0.18 — user wants it visible

---

## Important Notes
- **No build step** — all files are served as-is
- **Single JS file** — all functionality is in `scripts/main.js` wrapped in an IIFE
- **Single CSS file** — all styles in `styles/main.css`
- **All SVG illustrations are hand-crafted** — not from a library
- **Hero char animation** uses `charPopIn` keyframe with cubic-bezier and rotation
- **Card hover** includes `rotateZ(1deg) scale(1.01)` for subtle 3D feel
- **Nav** gets `.scrolled` class on scroll (adds shadow + solid background)
- **Mobile nav** uses hamburger toggle with `.open` class
