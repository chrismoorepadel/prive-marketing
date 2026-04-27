#!/usr/bin/env python3
"""Fix mobile issues across all 10 SPA pages."""

import os, re

PAGES = [
    'index', 'clubs', 'membership', 'destinations', 'experiences',
    'collection', 'club-partners', 'club-montauk', 'club-coral-gables', 'join'
]
BASE = '/Users/christophermoore/prive-marketing'

MOBILE_MENU_HTML = '''<div id="mobileMenu" class="mobile-menu">
  <button class="mobile-menu-close" id="mobileMenuClose">✕</button>
  <nav class="mobile-nav">
    <div class="mobile-nav-group">
      <div class="mobile-nav-label">Travel Collection</div>
      <a href="#" onclick="showPage('destinations')">Destinations</a>
      <a href="#" onclick="showPage('club-partners')">Club Partners</a>
      <a href="#" onclick="showPage('experiences')">Experiences</a>
    </div>
    <div class="mobile-nav-group">
      <div class="mobile-nav-label">Privé Clubs</div>
      <a href="#" onclick="showPage('club-coral-gables')">Coral Gables</a>
    </div>
    <div class="mobile-nav-group">
      <div class="mobile-nav-label">Membership</div>
      <a href="#" onclick="showPage('membership')">Privé Passport</a>
      <a href="#" onclick="showPage('join')" class="mobile-nav-cta">Join Now</a>
    </div>
  </nav>
</div>
'''

MOBILE_CSS_ADDITIONS = '''
/* ── Additional mobile overrides ─────────────────────────────── */
@media (max-width: 768px) {
  .how-it-works { padding: 60px 24px; }
  .steps-grid { grid-template-columns: 1fr; gap: 32px; }
  .step-num { font-size: clamp(36px, 10vw, 56px); }
  .membership-section { padding: 60px 24px; }
  .membership-price { font-size: clamp(40px, 10vw, 64px); line-height: 1; }
  .map-section { padding: 48px 24px 60px; }
  .map-container { height: 320px; }
  .partner-benefits { padding: 60px 24px; }
  .benefits-showcase { grid-template-columns: 1fr; }
  .benefits-bar { padding: 32px 24px; }
  .exp-scroll-track { padding-right: 24px; }
}
'''

def fix_page(name):
    path = os.path.join(BASE, f'{name}.html')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    changed = False

    # 1. Add mobile menu HTML after </nav> if missing
    if 'id="mobileMenu"' not in html:
        # Insert after </nav> that is followed by the page div
        html = html.replace('</nav>\n<div class="page active"',
                            f'</nav>\n{MOBILE_MENU_HTML}<div class="page active"', 1)
        changed = True
        print(f'  + mobile menu HTML added to {name}.html')
    else:
        print(f'  . mobile menu already present in {name}.html')

    # 2. Fix wrong class: .steps-row -> .steps-grid in 768px media block
    if '.steps-row { grid-template-columns: 1fr;' in html:
        html = re.sub(
            r'\.steps-row \{ grid-template-columns: 1fr; gap: 32px; padding: 60px 24px; \}',
            '.steps-grid { grid-template-columns: 1fr; gap: 32px; }',
            html
        )
        changed = True
        print(f'  + fixed .steps-row → .steps-grid in {name}.html')

    # 3. Add extra mobile CSS before </style>
    if 'Additional mobile overrides' not in html:
        html = html.replace('</style>\n</head>', MOBILE_CSS_ADDITIONS + '</style>\n</head>', 1)
        changed = True
        print(f'  + added mobile CSS overrides to {name}.html')

    # 4. Fix inline padding-left:80px on exp-scroll-track in experiences.html
    if name == 'experiences':
        old = '<div class="exp-scroll-track" style="padding-left:80px;">'
        new = '<div class="exp-scroll-track">'
        if old in html:
            html = html.replace(old, new, 1)
            changed = True
            print(f'  + removed inline padding-left:80px from exp-scroll-track')

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'  ✓ saved {name}.html')
    else:
        print(f'  - no changes needed for {name}.html')

for name in PAGES:
    print(f'\n[{name}]')
    fix_page(name)

print('\nDone.')
