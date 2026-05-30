#!/usr/bin/env python3
"""Batch upgrade service detail pages:
   - Bump redesign.css to v=6
   - Bump main.css to v=57
   - Bump main.js to v=33
   - Fix lang="en" to lang="ja" (Japan-first default)
"""

import os
import re
import glob

ROOT = '/Users/mac/agent-workspaces/thinkersgk-website'

# Target all service-*.html files
files = sorted(glob.glob(os.path.join(ROOT, 'service-*.html')))

count = 0
for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Bump redesign.css version
    content = re.sub(r'redesign\.css\?v=\d+', 'redesign.css?v=6', content)

    # Bump main.css version
    content = re.sub(r'main\.css\?v=\d+', 'main.css?v=57', content)

    # Bump main.js version
    content = re.sub(r'main\.js\?v=\d+', 'main.js?v=33', content)

    # Fix lang="en" to lang="ja"
    content = content.replace('lang="en"', 'lang="ja"', 1)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        rel = os.path.relpath(filepath, ROOT)
        print(f'  Updated: {rel}')
        count += 1

print(f'\nDone. Updated {count} files.')
