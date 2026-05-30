#!/usr/bin/env python3
"""Add Open Graph + Twitter Card meta tags to all HTML pages missing them.
   Extracts title and description from existing meta tags."""

import os
import re
import html

ROOT = '/Users/mac/agent-workspaces/thinkersgk-website'
SKIP_DIRS = {'agent-room', 'node_modules', '.git', 'openclaw-command-center', 'thinkersgk-api', 'blog-jp'}
BASE_URL = 'https://www.thinkersgk.com'

count = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fname in filenames:
        if not fname.endswith('.html'):
            continue
        # Skip .ja.html and .jp.html variants
        if fname.endswith('.ja.html') or fname.endswith('.jp.html'):
            continue

        filepath = os.path.join(dirpath, fname)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has OG tags
        if 'og:title' in content:
            continue

        # Extract title
        title_match = re.search(r'<title[^>]*>([^<]+)</title>', content)
        if not title_match:
            continue
        title = title_match.group(1).strip()
        # Clean data attributes from title
        title = re.sub(r'\s*data-\w+="[^"]*"', '', title)

        # Extract description
        desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', content)
        if not desc_match:
            continue
        description = desc_match.group(1).strip()

        # Build canonical URL
        rel = os.path.relpath(filepath, ROOT)
        if rel == 'index.html':
            url = BASE_URL + '/'
        else:
            url = BASE_URL + '/' + rel

        # Build OG + Twitter tags
        og_tags = f' <meta property="og:title" content="{html.escape(title)}">'
        og_tags += f' <meta property="og:description" content="{html.escape(description)}">'
        og_tags += f' <meta property="og:type" content="article">' if '/blog/' in rel else f' <meta property="og:type" content="website">'
        og_tags += f' <meta property="og:url" content="{url}">'
        og_tags += f' <meta property="og:site_name" content="Thinkers GK">'
        og_tags += f' <meta name="twitter:card" content="summary_large_image">'
        og_tags += f' <meta name="twitter:title" content="{html.escape(title)}">'
        og_tags += f' <meta name="twitter:description" content="{html.escape(description)}">'

        # Insert after the description meta tag
        desc_tag = desc_match.group(0)
        content = content.replace(desc_tag, desc_tag + og_tags, 1)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  Added OG: {rel}')
        count += 1

print(f'\nDone. Added OG tags to {count} files.')
