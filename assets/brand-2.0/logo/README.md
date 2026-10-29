# Privé Padel 2.0 — logo files

Vector masters for the Brand 2.0 mark (the rounded oval seal), built October 2026.
All files are tight to the artwork with no clear space. Clear space is the height of the P stem on every side.

## Variants

| File stem | What it is | Natural proportion |
|---|---|---|
| `prive-padel_icon` | Oval seal alone | 741 × 1000 |
| `prive-padel_primary` | Seal over PRIVÉ / PADEL (the primary lockup) | 1176 × 1568 |
| `prive-padel_horizontal` | Seal left, PRIVÉ / PADEL right | 2931 × 1000 |
| `prive-padel_wordmark` | PRIVÉ PADEL on one line, no seal | 7778 × 792 |
| `prive-padel_wordmark-stacked` | PRIVÉ over PADEL, no seal | 3403 × 1240 |

Each variant comes in four colours: `ink` (#0F1B22), `cream` (#F5F0E8), `black` (#000000), `white` (#FFFFFF).

- `svg/` — the vector masters. Use these for web, signage and embroidery digitising.
- `pdf/` — the same artwork as single-page PDF for print and for placing in Illustrator or InDesign.
- `png/` — 3000 px on the long side, transparent background. Convenience only; prefer the SVG.

Minimum sizes: seal alone from 16 px, 10 mm print, 14 mm embroidered. Stacked lockup from 48 px or 24 mm. Below that, the seal alone.

## How the artwork was built

- The oval ring is a mathematically exact ellipse pair (outer 741 × 1000, uniform stroke 29.2 units), not a trace.
- The P glyph was traced from the approved rounded monogram, then made exactly symmetrical: the left scroll is mirrored to form the right scroll about the stem's centre.
- The wordmark is live type converted to outlines, so no fonts are needed to open the files:
  - PRIVÉ: Cormorant Garamond, weight 500, capitals, tracking 0.18 em.
  - PADEL: Jost, weight 300, capitals, tracking 0.80 em.
  - Proportions were measured from the supplied stacked logo: PADEL cap height is one third of PRIVÉ's.
- `source/` holds the monogram master, the two static font instances (both SIL Open Font License) and the two Python scripts that rebuild everything. Rebuilding needs `fonttools`, `vtracer`, `pillow`, `resvg-py`, `svglib` and `reportlab`.

## What is not here yet

- Place lockups (Privé · Montauk, Privé · Miami, Privé · Turks and Caicos) and the residency seal. These compose from the icon and the wordmark; the scripts can generate them once the names are final.
- A favicon set. Export from `svg/prive-padel_icon_ink.svg` at 16, 32, 180 and 512 px.
