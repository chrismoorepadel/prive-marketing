#!/usr/bin/env python3
"""Remove custom cursor from all HTML pages."""

import os, re

BASE = '/Users/christophermoore/prive-marketing'
FILES = [f for f in os.listdir(BASE) if f.endswith('.html')]

for fname in sorted(FILES):
    path = os.path.join(BASE, fname)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html

    # 1. Remove cursor:none; from body rule
    html = html.replace('  cursor:none;\n', '')

    # 2. Remove cursor:none; when inline in body{} on one line
    html = re.sub(r';cursor:none', '', html)
    html = re.sub(r'cursor:none;', '', html)

    # 3. Remove the CUSTOM CURSOR CSS block (SPA pages style)
    html = re.sub(
        r'/\* ═+\n   CUSTOM CURSOR\n═+ \*/\n'
        r'\.cursor\{[^}]+\}\n'
        r'\.cursor-ring\{[^}]+\}\n'
        r'body:hover \.cursor\{opacity:1;\}\n',
        '',
        html
    )

    # 4. Remove standalone .cursor{...} CSS block (contact/terms/privacy style)
    html = re.sub(r'\.cursor\{[^}]+\}\n?', '', html)

    # 5. Remove standalone .cursor-ring{...} CSS block
    html = re.sub(r'\.cursor-ring\{[^}]+\}\n?', '', html)

    # 6. Remove body:hover .cursor rule if still present
    html = re.sub(r'body:hover \.cursor\{[^}]+\}\n?', '', html)

    # 7. Remove cursor HTML elements
    html = html.replace('<div class="cursor" id="cursor"></div>\n', '')
    html = html.replace('<div class="cursor-ring" id="cursorRing"></div>\n', '')
    html = html.replace('<div class="cursor" id="cursor"></div>', '')
    html = html.replace('<div class="cursor-ring" id="cursorRing"></div>', '')

    # 8. Remove cursor JS block
    html = re.sub(
        r'// ─+ CURSOR ─+\n'
        r'const cursor = .*?\n'
        r'const ring.*?\n'
        r'document\.addEventListener\(\'mousemove\'.*?'
        r'\}\);\n'
        r'document\.querySelectorAll\(\'a,button\'\)\.forEach.*?'
        r'\}\);\n',
        '',
        html,
        flags=re.DOTALL
    )

    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'✓ cleaned {fname}')
    else:
        print(f'- no changes: {fname}')
