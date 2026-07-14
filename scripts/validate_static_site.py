#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
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
