#!/usr/bin/env python3
"""Add ITAD Japan link to nav menu and footer across all HTML pages.
Handles both formatted and minified HTML."""
import glob

files = glob.glob('*.html') + glob.glob('blog/*.html') + glob.glob('blog-jp/*.html')
files = [f for f in files if f != 'itad-japan.html']

nav_updated = 0
footer_updated = 0
skipped = []

for filepath in sorted(files):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'itad-japan' in content:
        skipped.append(filepath)
        continue

    original = content
    is_sub = filepath.startswith('blog/') or filepath.startswith('blog-jp/')
    prefix = '../' if is_sub else ''

    # Nav: insert ITAD Japan link after Services link (works for both formatted and minified)
    # Pattern: ...services.html" ...>Services</a> ... about.html"
    # We insert between the Services </a> and the About <a>
    import re

    # Match the services link closing tag followed by whitespace/newline then the about link
    nav_pattern = r'(data-en="Services"[^>]*>[^<]*</a>)(\s*)(<a href="' + re.escape(prefix) + r'about\.html")'
    nav_replacement = r'\1\2<a href="' + prefix + r'itad-japan.html" data-en="ITAD Japan" data-ja="ITAD 日本">ITAD Japan</a>\2\3'

    new_content = re.sub(nav_pattern, nav_replacement, content, count=1)
    if new_content != content:
        nav_updated += 1
        content = new_content

    # Footer: add ITAD Japan link after cybersecurity in the services footer column
    footer_pattern = r'(data-en="Cybersecurity"[^>]*>[^<]*</a>)(\s*)(<a href="' + re.escape(prefix) + r'service-(?:itad|asset-lifecycle)\.html")'
    footer_replacement = r'\1\2<a href="' + prefix + r'itad-japan.html" data-en="ITAD Japan" data-ja="ITAD 日本">ITAD Japan</a>\2\3'

    new_content2 = re.sub(footer_pattern, footer_replacement, content, count=1)
    if new_content2 != content:
        footer_updated += 1
        content = new_content2

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print(f"Nav updated: {nav_updated} pages")
print(f"Footer updated: {footer_updated} pages")
print(f"Skipped (already has link): {len(skipped)}")
if skipped:
    print(f"  {', '.join(skipped)}")
