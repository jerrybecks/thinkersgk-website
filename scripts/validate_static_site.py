#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SITE_URL = "https://www.thinkersgk.com"
REQUIRED_ROOT_FILES = [
    "CNAME",
    "robots.txt",
    "sitemap.xml",
    "feed.xml",
    "404.html",
]
CORE_PAGES = [
    "index.html",
    "services.html",
    "about.html",
    "contact.html",
    "why-us.html",
    "index.ja.html",
    "services.ja.html",
    "about.ja.html",
    "contact.ja.html",
    "why-us.ja.html",
    "service-asset-lifecycle.ja.html",
]


def fail(msg: str) -> None:
    print(f"ERROR: {msg}")


def find_tag_count(text: str, pattern: str) -> int:
    return len(re.findall(pattern, text, flags=re.IGNORECASE))


def extract_attr(text: str, pattern: str) -> str | None:
    m = re.search(pattern, text, flags=re.IGNORECASE)
    return m.group(1) if m else None


def expected_en_counterpart(path: Path) -> str:
    if path.name == "index.ja.html":
        return f"{SITE_URL}/"
    return f"{SITE_URL}/{path.name.replace('.ja.html', '.html')}"


def expected_ja_url(path: Path) -> str:
    return f"{SITE_URL}/{path.name}"


def check_required_files(errors: list[str]) -> None:
    for rel in REQUIRED_ROOT_FILES:
        if not (ROOT / rel).exists():
            errors.append(f"missing required root file: {rel}")


def check_shared_layout(errors: list[str]) -> None:
    result = subprocess.run(
        ["node", str(ROOT / "scripts" / "sync-shared-layout.js"), "--check"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        errors.append(f"shared header/footer drift detected: {detail}")


def check_seo_metadata(errors: list[str]) -> None:
    result = subprocess.run(
        ["node", str(ROOT / "scripts" / "sync-seo-metadata.js"), "--check"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        errors.append(f"paired-page SEO metadata drift detected: {detail}")


def check_security_baseline(errors: list[str]) -> None:
    for rel in ("contact.html", "contact.ja.html"):
        text = (ROOT / rel).read_text(encoding="utf-8", errors="ignore")
        for marker in (
            "https://challenges.cloudflare.com/turnstile/v0/api.js",
            'name="cf-turnstile-response"',
            "cf-turnstile-response",
        ):
            if marker not in text:
                errors.append(f"{rel}: missing Turnstile integration marker: {marker}")

    worker_files = {
        "workers/intake-api/src/chat.js": ["function isAllowedOrigin(origin)"],
        "workers/intake-api/src/email.js": ["function readBearerToken(request)", "token !== env.AGENT_API_KEY"],
        "workers/intake-api/src/email-worker.js": ["function isAuthorized(request, env)", "private, no-store"],
        "workers/email-inbox/index.js": ["LIST_CACHE_TTL", "timingSafeEqual", "X-KV-Cache"],
    }
    for rel, markers in worker_files.items():
        text = (ROOT / rel).read_text(encoding="utf-8", errors="ignore")
        for marker in markers:
            if marker not in text:
                errors.append(f"{rel}: missing security baseline marker: {marker}")
        if ".includes('thinkersgk.com')" in text or '.includes("thinkersgk.com")' in text:
            errors.append(f"{rel}: unsafe substring origin validation detected")


def check_analytics_disclosure(errors: list[str]) -> None:
    analytics = (ROOT / "js" / "analytics.js").read_text(encoding="utf-8", errors="ignore")
    for marker in ("G-LSD1CGSKBS", "analytics_storage", "denied", "consent", "googletagmanager.com/gtag/js"):
        if marker not in analytics:
            errors.append(f"js/analytics.js: missing expected GA4 consent marker: {marker}")

    umami_count = 0
    for path in ROOT.rglob("*.html"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        umami_count += len(re.findall(r'https://cloud\.umami\.is/script\.js', text, flags=re.IGNORECASE))
    if umami_count == 0:
        errors.append("HTML pages: existing Umami Cloud script reference is missing")

    disclosures = {
        "privacy-policy.html": ("Google Analytics 4", "GA4", "Umami Cloud", "denied by default", "Umami's data collection"),
        "privacy-policy.ja.html": ("Google Analytics 4", "GA4", "Umami Cloud", "初期状態で拒否", "Umamiのデータ収集"),
    }
    for rel, markers in disclosures.items():
        text = (ROOT / rel).read_text(encoding="utf-8", errors="ignore")
        for marker in markers:
            if marker not in text:
                errors.append(f"{rel}: missing analytics disclosure marker: {marker}")


def check_blog_breadcrumbs(errors: list[str]) -> None:
    breadcrumb_pattern = re.compile(
        r'<script\s+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        flags=re.IGNORECASE | re.DOTALL,
    )
    for path in sorted((ROOT / "blog" / "posts").glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        found = None
        for block in breadcrumb_pattern.findall(text):
            try:
                payload = json.loads(block)
            except json.JSONDecodeError:
                continue
            candidates = payload if isinstance(payload, list) else [payload]
            found = next(
                (item for item in candidates if isinstance(item, dict) and item.get("@type") == "BreadcrumbList"),
                None,
            )
            if found:
                break
        items = found.get("itemListElement") if found else None
        names = [item.get("name") for item in items] if isinstance(items, list) else []
        if len(names) != 3 or names[:2] != ["Home", "Insights"] or not names[2]:
            errors.append(f"{path.relative_to(ROOT)}: missing valid Home → Insights → article BreadcrumbList")


def _tag_attr(tag: str, name: str) -> str | None:
    return extract_attr(tag, rf'\b{name}=["\']([^"\']*)')


def _check_image_tag(tag: str, rel: str, eager: bool, errors: list[str]) -> None:
    width = _tag_attr(tag, "width")
    height = _tag_attr(tag, "height")
    loading = (_tag_attr(tag, "loading") or "").lower()
    priority = (_tag_attr(tag, "fetchpriority") or "").lower()
    if not width or not width.isdigit() or int(width) <= 0 or not height or not height.isdigit() or int(height) <= 0:
        errors.append(f"{rel}: blog image must reserve positive width and height")
    if eager:
        if loading != "eager" or priority != "high":
            errors.append(f"{rel}: first visible blog image must be eager with fetchpriority=high")
    elif loading != "lazy":
        errors.append(f"{rel}: below-fold blog image must use loading=lazy")


def _content_image_tags(text: str) -> list[str]:
    tags = []
    for tag in re.findall(r'<img\b[^>]*>', text, flags=re.IGNORECASE):
        src = _tag_attr(tag, "src") or ""
        clean = src.split("?", 1)[0].lower()
        if not clean or clean.endswith(".svg") or any(marker in clean for marker in ("logo", "favicon", "testimonial")):
            continue
        tags.append(tag)
    return tags


def check_blog_image_dimensions(errors: list[str]) -> None:
    for path in sorted((ROOT / "blog" / "posts").glob("*.html")):
        tags = _content_image_tags(path.read_text(encoding="utf-8", errors="ignore"))
        if not tags:
            errors.append(f"{path.relative_to(ROOT)}: missing content image for performance validation")
            continue
        for index, tag in enumerate(tags):
            _check_image_tag(tag, str(path.relative_to(ROOT)), index == 0, errors)

    listing = ROOT / "blog" / "index.html"
    listing_text = listing.read_text(encoding="utf-8", errors="ignore")
    cards = re.findall(r'<article\b[^>]*\bblog-card\b[\s\S]*?</article>', listing_text, flags=re.IGNORECASE)
    if not cards:
        errors.append("blog/index.html: no blog cards found for image performance validation")
    for index, card in enumerate(cards):
        tags = _content_image_tags(card)
        if len(tags) != 1:
            errors.append(f"blog/index.html: card {index + 1} must contain exactly one content image")
        elif tags:
            _check_image_tag(tags[0], "blog/index.html", index == 0, errors)

    homepage = ROOT / "index.html"
    homepage_text = homepage.read_text(encoding="utf-8", errors="ignore")
    insight_grid = re.search(r'<div\b[^>]*\bhome-insights__grid\b[\s\S]*?</section>', homepage_text, flags=re.IGNORECASE)
    insight_tags = _content_image_tags(insight_grid.group(0) if insight_grid else "")
    if len(insight_tags) != 4:
        errors.append(f"index.html: expected 4 homepage insight images, found {len(insight_tags)}")
    for index, tag in enumerate(insight_tags):
        _check_image_tag(tag, "index.html", index == 0, errors)


def check_contact_fallbacks(errors: list[str]) -> None:
    required = ("info@thinkersgk.com", "+81 90-6366-7901")
    for rel in ("contact.html", "contact.ja.html", "get-started.html", "get-started.ja.html"):
        text = (ROOT / rel).read_text(encoding="utf-8", errors="ignore")
        if "もう一度お試しください" not in text and "Please try again" not in text:
            errors.append(f"{rel}: missing explicit retry guidance in failure fallback")
        for marker in required:
            if marker not in text:
                errors.append(f"{rel}: missing fallback contact marker: {marker}")


def check_search_console_cleanup(errors: list[str]) -> None:
    homepage = (ROOT / "index.html").read_text(encoding="utf-8", errors="ignore")
    important_pages = (
        "service-managed-services.html",
        "service-networking.html",
        "service-cloud-consulting.html",
        "service-cybersecurity.html",
    )
    for page in important_pages:
        if f'href="{page}"' not in homepage:
            errors.append(f"index.html: missing important commercial pathway: {page}")

    services = (ROOT / "services.html").read_text(encoding="utf-8", errors="ignore")
    focused_pages = (
        "service-access-control.html",
        "service-ai-integration.html",
        "service-ai-solutions.html",
        "service-cloud-printing.html",
        "service-cybersecurity-training.html",
        "service-daas-vdi.html",
        "service-hardware-maintenance.html",
        "service-service-desk.html",
        "service-staff-augmentation.html",
    )
    for page in focused_pages:
        if f'href="{page}"' not in services:
            errors.append(f"services.html: missing focused commercial pathway: {page}")

    fallback = (ROOT / "404.html").read_text(encoding="utf-8", errors="ignore")
    trailing_slash_redirects = {
        "/contact.html/": "/contact.html",
        "/service-managed-services.html/": "/service-managed-services.html",
        "/service-networking.html/": "/service-networking.html",
        "/service-cloud-consulting.html/": "/service-cloud-consulting.html",
        "/service-cybersecurity.html/": "/service-cybersecurity.html",
    }
    for source, target in trailing_slash_redirects.items():
        if f"'{source}': '{target}'" not in fallback:
            errors.append(f"404.html: missing static redirect mapping {source} -> {target}")

    aliases = {
        "blog/blog.ja.html": "https://www.thinkersgk.com/blog/",
        "blog/managed-services.html": "https://www.thinkersgk.com/blog/posts/understanding-managed-services.html",
        "blog/ai-threats-2026-japan.html": "https://www.thinkersgk.com/blog/posts/ai-security-threats-2026-japan.html",
    }
    for rel, target in aliases.items():
        text = (ROOT / rel).read_text(encoding="utf-8", errors="ignore")
        target_path = target.removeprefix(SITE_URL)
        if 'name="robots" content="noindex, follow"' not in text:
            errors.append(f"{rel}: legacy alias must remain noindex, follow")
        if f'<link rel="canonical" href="{target}">' not in text:
            errors.append(f"{rel}: canonical target mismatch ({target})")
        if f'url={target_path}' not in text and f"replace('{target_path}')" not in text:
            errors.append(f"{rel}: redirect target missing ({target})")


def check_html_head_and_landmarks(errors: list[str]) -> None:
    malformed_description = re.compile(
        r'<meta\s+name=["\']description["\'][^>]*?content=["\'][^"\']*["\']\s*<meta',
        flags=re.IGNORECASE | re.DOTALL,
    )
    for path in sorted(ROOT.rglob("*.html")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = path.relative_to(ROOT)
        if malformed_description.search(text):
            errors.append(f"{rel}: malformed meta description tag")
        if "main-content" in text.lower() and not re.search(
            r'<main\b[^>]*\bid=["\']main-content["\']', text, flags=re.IGNORECASE
        ):
            errors.append(f"{rel}: #main-content skip target lacks a semantic main landmark")

        canonical = extract_attr(
            text,
            r'<link\b(?=[^>]*\brel=["\']canonical["\'])[^>]*\bhref=["\']([^"\']+)',
        )
        robots = extract_attr(text, r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)')
        if not canonical or (robots and "noindex" in robots.lower()):
            continue
        required_social = (
            r'<meta\b[^>]*\bproperty=["\']og:image["\']',
            r'<meta\b[^>]*\bname=["\']twitter:card["\']',
            r'<meta\b[^>]*\bname=["\']twitter:site["\']',
            r'<meta\b[^>]*\bname=["\']twitter:image["\']',
        )
        for pattern in required_social:
            if not re.search(pattern, text, flags=re.IGNORECASE):
                errors.append(f"{rel}: missing required social metadata ({pattern})")


def check_core_page(path: Path, errors: list[str]) -> None:
    rel = path.relative_to(ROOT)
    text = path.read_text(encoding="utf-8", errors="ignore")

    if "<title>" not in text.lower():
        errors.append(f"{rel}: missing <title>")
    if not re.search(r'<meta\s+name="description"\s+content="[^"]+"\s*/?>', text, flags=re.IGNORECASE):
        errors.append(f"{rel}: missing or malformed meta description")
    if find_tag_count(text, r'<link\s+rel="canonical"') != 1:
        errors.append(f"{rel}: expected exactly 1 canonical tag")

    canonical = extract_attr(text, r'<link\s+rel="canonical"\s+href="([^"]+)"')
    if canonical is None:
        errors.append(f"{rel}: canonical href missing")

    if path.name.endswith('.ja.html'):
        counts = {
            'en': find_tag_count(text, r'hreflang="en"'),
            'ja': find_tag_count(text, r'hreflang="ja"'),
            'x-default': find_tag_count(text, r'hreflang="x-default"'),
        }
        for key, count in counts.items():
            if count != 1:
                errors.append(f"{rel}: expected exactly 1 hreflang=\"{key}\" tag, found {count}")

        expected_canonical = expected_ja_url(path)
        if canonical and canonical != expected_canonical:
            errors.append(f"{rel}: canonical mismatch ({canonical} != {expected_canonical})")

        en_href = extract_attr(text, r'<link\s+rel="alternate"\s+hreflang="en"\s+href="([^"]+)"')
        ja_href = extract_attr(text, r'<link\s+rel="alternate"\s+hreflang="ja"\s+href="([^"]+)"')
        x_href = extract_attr(text, r'<link\s+rel="alternate"\s+hreflang="x-default"\s+href="([^"]+)"')
        expected_en = expected_en_counterpart(path)

        if en_href and en_href != expected_en:
            errors.append(f"{rel}: hreflang en mismatch ({en_href} != {expected_en})")
        if ja_href and ja_href != expected_canonical:
            errors.append(f"{rel}: hreflang ja mismatch ({ja_href} != {expected_canonical})")
        if x_href and x_href != expected_en:
            errors.append(f"{rel}: hreflang x-default mismatch ({x_href} != {expected_en})")


def main() -> int:
    errors: list[str] = []
    check_required_files(errors)
    check_shared_layout(errors)
    check_seo_metadata(errors)
    check_security_baseline(errors)
    check_analytics_disclosure(errors)
    check_blog_breadcrumbs(errors)
    check_blog_image_dimensions(errors)
    check_contact_fallbacks(errors)
    check_search_console_cleanup(errors)
    check_html_head_and_landmarks(errors)

    for rel in CORE_PAGES:
        path = ROOT / rel
        if not path.exists():
            errors.append(f"missing expected core page: {rel}")
            continue
        check_core_page(path, errors)

    localized_pages = sorted(ROOT.glob('*.ja.html'))
    for path in localized_pages:
        text = path.read_text(encoding="utf-8", errors="ignore")
        counts = {
            'canonical': find_tag_count(text, r'<link\s+rel="canonical"'),
            'en': find_tag_count(text, r'hreflang="en"'),
            'ja': find_tag_count(text, r'hreflang="ja"'),
            'x-default': find_tag_count(text, r'hreflang="x-default"'),
        }
        if counts['canonical'] != 1 or counts['en'] != 1 or counts['ja'] != 1 or counts['x-default'] != 1:
            errors.append(
                f"{path.name}: localized head-tag count mismatch "
                f"(canonical={counts['canonical']}, en={counts['en']}, ja={counts['ja']}, x-default={counts['x-default']})"
            )

    if errors:
        print("Static site validation failed:\n")
        for error in errors:
            fail(error)
        return 1

    print(f"Static site validation passed for {len(CORE_PAGES)} core pages and {len(localized_pages)} localized pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
