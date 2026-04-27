#!/usr/bin/env python3
"""Remove orphaned cursor mouseleave code left by the previous script."""

import os, re

BASE = '/Users/christophermoore/prive-marketing'
FILES = [f for f in os.listdir(BASE) if f.endswith('.html')]

# The orphaned fragment always looks like this (with optional leading blank line):
ORPHAN = re.compile(
    r'\n?  el\.addEventListener\(\'mouseleave\', \(\) => \{\n'
    r'    cursor\.style\.width = \'8px\'; cursor\.style\.height = \'8px\';\n'
    r'    ring\.style\.width = \'36px\'; ring\.style\.height = \'36px\';\n'
    r'  \}\);\n'
    r'\}\);\n',
    re.MULTILINE
)

for fname in sorted(FILES):
    path = os.path.join(BASE, fname)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    new_html, n = ORPHAN.subn('', html)
    if n:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f'✓ fixed {fname} ({n} match)')
    else:
        print(f'- no orphan in {fname}')
