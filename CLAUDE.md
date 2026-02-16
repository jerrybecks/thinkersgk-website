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
├── services.html                   # Services overview (9 core + 9 specialized service cards)
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
├── service-voip.html                #  │  9 Specialized Service Pages
├── service-networking.html          #  │  (generated from template)
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

### Japan Map (replaced the old 3D globe)
- Canvas-based, stationary (no rotation/dragging)
- Uses normalized 0-1 coordinates mapped to canvas dimensions
- 4 main islands: Hokkaido, Honshu, Shikoku, Kyushu + Okinawa chain
- 7 cities with pulsing radial gradient glow effects
- Tokyo gets gold `#f59e0b` color and "★ HQ" badge; others get blue
- Dashed connection arcs from Tokyo to each city with animated traveling dots
- Subtle grid dot pattern in background
- Function is still named `initGlobe()` for backward compatibility

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

**Specialized service pages** (generated from template) have:
- Same nav/footer as core pages
- Hero section
- 4 feature cards
- 4 process steps
- Testimonial block
- 3 related services
- CTA section

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

### Modifying the Japan map
- Edit `initGlobe()` in `scripts/main.js`
- Island outlines are normalized `[x, y]` arrays (0-1 range)
- City positions: `{ name, nx, ny, isHQ }` where nx/ny are 0-1 normalized
- `toPixel(nx, ny)` converts normalized coords to canvas pixels with 20px padding
- `getColors()` returns theme-aware color palette

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

## Important Notes
- **No build step** — all files are served as-is
- **Single JS file** — all functionality is in `scripts/main.js` wrapped in an IIFE
- **Single CSS file** — all styles in `styles/main.css`
- **All SVG illustrations are hand-crafted** — not from a library
- **Hero char animation** uses `charPopIn` keyframe with cubic-bezier and rotation
- **Card hover** includes `rotateZ(1deg) scale(1.01)` for subtle 3D feel
- **Nav** gets `.scrolled` class on scroll (adds shadow + solid background)
- **Mobile nav** uses hamburger toggle with `.open` class
