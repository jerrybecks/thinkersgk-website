#!/usr/bin/env python3
"""
Batch update ALL HTML files with futuristic CSS/JS stack.
Handles relative paths for root, blog/, and blog/posts/ directories.
"""

import os
import re
import glob

WEBSITE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_relative_prefix(filepath):
    """Get the correct relative path prefix based on file location."""
    rel = os.path.relpath(filepath, WEBSITE_DIR)
    depth = rel.count(os.sep)
    if depth == 0:
        return ""
    return "../" * depth

def update_html_file(filepath):
    """Update a single HTML file with the full futuristic stack."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    prefix = get_relative_prefix(filepath)
    modified = False

    # 1. Update Google Fonts to include Sora + Noto Sans JP
    old_fonts = re.search(
        r'<link href="https://fonts\.googleapis\.com/css2\?family=Inter[^"]*" rel="stylesheet">',
        content
    )
    new_fonts_tag = f'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">'

    if old_fonts and 'Sora' not in old_fonts.group(0):
        content = content.replace(old_fonts.group(0), new_fonts_tag)
        modified = True

    # 2. Update main.css version
    content_new = re.sub(
        r'(href="' + re.escape(prefix) + r'styles/main\.css)\?v=\d+"',
        r'\1?v=52"',
        content
    )
    if content_new != content:
        content = content_new
        modified = True

    # 3. Add redesign.css after main.css (if not present)
    redesign_css = f'{prefix}styles/redesign.css'
    if redesign_css not in content and 'redesign.css' not in content:
        main_css_pattern = re.search(
            r'(<link rel="stylesheet" href="' + re.escape(prefix) + r'styles/main\.css\?v=\d+">)',
            content
        )
        if main_css_pattern:
            replacement = main_css_pattern.group(1) + f'\n    <link rel="stylesheet" href="{prefix}styles/redesign.css?v=2">'
            content = content.replace(main_css_pattern.group(1), replacement)
            modified = True

    # 4. Add futuristic.css after redesign.css (if not present)
    futuristic_css = f'{prefix}styles/futuristic.css'
    if futuristic_css not in content and 'futuristic.css' not in content:
        redesign_pattern = re.search(
            r'(<link rel="stylesheet" href="' + re.escape(prefix) + r'styles/redesign\.css\?v=\d+">)',
            content
        )
        if redesign_pattern:
            replacement = redesign_pattern.group(1) + f'\n    <link rel="stylesheet" href="{prefix}styles/futuristic.css?v=1">'
            content = content.replace(redesign_pattern.group(1), replacement)
            modified = True

    # 5. Add GSAP + ScrollTrigger + Lenis + Typed.js + animations.js (if not present)
    if 'gsap.min.js' not in content:
        # Find the last script tag before </head> or the enhancements.js line
        enhancements_pattern = re.search(
            r'(<script src="' + re.escape(prefix) + r'scripts/enhancements\.js[^"]*" defer></script>)',
            content
        )
        if enhancements_pattern:
            cdn_block = enhancements_pattern.group(1) + """
    <!-- GSAP + ScrollTrigger -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
    <!-- Lenis smooth scroll -->
    <script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js" defer></script>
    <!-- Typed.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.1.0/typed.umd.js" defer></script>
    <!-- Futuristic animations -->
    <script src=\"""" + prefix + """scripts/animations.js?v=1" defer>"""  + "</script>"
            content = content.replace(enhancements_pattern.group(1), cdn_block)
            modified = True

    # 6. Add robots meta tag if missing
    if '<meta name="robots"' not in content:
        viewport_pattern = re.search(r'(<meta name="viewport"[^>]*>)', content)
        if viewport_pattern:
            content = content.replace(
                viewport_pattern.group(1),
                viewport_pattern.group(1) + '\n    <meta name="robots" content="index, follow">'
            )
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False


def main():
    # Find all HTML files
    patterns = [
        os.path.join(WEBSITE_DIR, '*.html'),
        os.path.join(WEBSITE_DIR, 'blog', '*.html'),
        os.path.join(WEBSITE_DIR, 'blog', 'posts', '*.html'),
        os.path.join(WEBSITE_DIR, 'blog-jp', '*.html'),
    ]

    all_files = []
    for pattern in patterns:
        all_files.extend(glob.glob(pattern))

    # Remove duplicates
    all_files = sorted(set(all_files))

    updated = 0
    skipped = 0
    errors = []

    for filepath in all_files:
        filename = os.path.relpath(filepath, WEBSITE_DIR)
        try:
            if update_html_file(filepath):
                print(f"  ✓ {filename}")
                updated += 1
            else:
                print(f"  · {filename} (already up to date)")
                skipped += 1
        except Exception as e:
            print(f"  ✗ {filename}: {e}")
            errors.append(filename)

    print(f"\nDone: {updated} updated, {skipped} skipped, {len(errors)} errors")
    if errors:
        print("Errors:", errors)


if __name__ == '__main__':
    main()
