#!/usr/bin/env python3
"""Add GSAP ScrollTrigger CDN + scroll-reveal.js to all HTML pages.
   Handles relative paths for root, blog/, and blog/posts/ directories.
   Skips pages that already have gsap references."""

import os
import re

ROOT = '/Users/mac/agent-workspaces/thinkersgk-website'
SKIP_DIRS = {'agent-room', 'node_modules', '.git'}

# GSAP + ScrollTrigger CDN (before </head>)
GSAP_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>'

def get_prefix(filepath):
    """Return relative path prefix based on file location."""
    rel = os.path.relpath(filepath, ROOT)
    depth = rel.count(os.sep)
    if depth == 0:
        return ''
    return '../' * depth

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has gsap
    if 'gsap' in content.lower() and 'scroll-reveal' in content:
        return False

    modified = False
    prefix = get_prefix(filepath)

    # Add GSAP CDN before </head> if not present
    if 'gsap' not in content.lower():
        content = content.replace('</head>', f'  {GSAP_CDN}\n</head>')
        modified = True

    # Add scroll-reveal.js before </body> if not present
    scroll_reveal_tag = f'<script src="{prefix}scripts/scroll-reveal.js?v=1" defer></script>'
    if 'scroll-reveal' not in content:
        content = content.replace('</body>', f'  {scroll_reveal_tag}\n</body>')
        modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

count = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fname in filenames:
        if not fname.endswith('.html'):
            continue
        filepath = os.path.join(dirpath, fname)
        if process_file(filepath):
            rel = os.path.relpath(filepath, ROOT)
            print(f'  Updated: {rel}')
            count += 1

print(f'\nDone. Updated {count} files.')
