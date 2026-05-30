#!/usr/bin/env python3
"""Batch version bump ALL HTML files to latest asset versions:
   - redesign.css → v=6
   - main.css → v=57
   - main.js → v=33
   - Fix lang="en" → lang="ja" on first occurrence
"""

import os
import re

ROOT = '/Users/mac/agent-workspaces/thinkersgk-website'
SKIP_DIRS = {'agent-room', 'node_modules', '.git', 'openclaw-command-center', 'thinkersgk-api'}

count = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fname in filenames:
        if not fname.endswith('.html'):
            continue
        filepath = os.path.join(dirpath, fname)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Bump versions (handle both relative and root paths)
        content = re.sub(r'redesign\.css\?v=\d+', 'redesign.css?v=6', content)
        content = re.sub(r'main\.css\?v=\d+', 'main.css?v=57', content)
        content = re.sub(r'main\.js\?v=\d+', 'main.js?v=33', content)

        # Fix lang="en" → lang="ja" (only first occurrence = the html tag)
        content = content.replace('<html lang="en">', '<html lang="ja">', 1)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            rel = os.path.relpath(filepath, ROOT)
            print(f'  Updated: {rel}')
            count += 1

print(f'\nDone. Updated {count} files.')
