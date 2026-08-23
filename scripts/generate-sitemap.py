#!/usr/bin/env python3
"""Generate a sitemap from canonical, indexable local HTML pages."""
from html.parser import HTMLParser
from pathlib import Path
import argparse
from urllib.parse import urlparse
from xml.etree import ElementTree
from xml.sax.saxutils import escape


class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = ""
        self.noindex = False
        self.redirect = False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "link" and (values.get("rel") or "").lower() == "canonical":
            self.canonical = values.get("href") or ""
        if tag == "meta":
            if (values.get("name") or "").lower() == "robots":
                self.noindex = "noindex" in (values.get("content") or "").lower()
            if (values.get("http-equiv") or "").lower() == "refresh":
                self.redirect = True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", type=Path)
    ap.add_argument("--output", type=Path, default=None)
    ap.add_argument(
        "--metadata-source",
        type=Path,
        default=None,
        help="Existing sitemap to use for metadata; defaults to --output.",
    )
    args = ap.parse_args()
    root = args.root.resolve()
    output = args.output or root / "sitemap.xml"
    metadata_source = args.metadata_source or output
    metadata = {}
    if metadata_source.exists():
        try:
            sitemap = ElementTree.parse(metadata_source)
            namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
            for entry in sitemap.getroot().findall(f"{namespace}url"):
                loc = entry.find(f"{namespace}loc")
                if loc is None or not loc.text:
                    continue
                metadata[loc.text] = {
                    name: (entry.findtext(f"{namespace}{name}") or "")
                    for name in ("lastmod", "changefreq", "priority")
                }
        except (ElementTree.ParseError, OSError):
            # A malformed or unreadable existing sitemap must not prevent a
            # fresh sitemap from being generated; no metadata is invented.
            metadata = {}
    urls = set()
    for path in root.rglob("*.html"):
        if any(part in {".git", "node_modules", "dist", "build", "agent-room", "gerald"} for part in path.parts):
            continue
        source = path.read_text(encoding="utf-8", errors="replace")
        if "window.location.replace" in source:
            continue
        parser = HeadParser()
        parser.feed(source)
        if parser.noindex or parser.redirect or not parser.canonical:
            continue
        parsed = urlparse(parser.canonical)
        if parsed.scheme == "https" and parsed.netloc == "www.thinkersgk.com":
            urls.add(parser.canonical)
    ordered = sorted(urls)
    body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in ordered:
        fields = [f"<loc>{escape(url)}</loc>"]
        for name in ("lastmod", "changefreq", "priority"):
            value = metadata.get(url, {}).get(name, "")
            if value:
                fields.append(f"<{name}>{escape(value)}</{name}>")
        body.append(f"  <url>{''.join(fields)}</url>")
    body.append("</urlset>")
    output.write_text("\n".join(body) + "\n", encoding="utf-8")
    print(f"generated {output} with {len(ordered)} URLs")


if __name__ == "__main__":
    main()
