# Privé Padel 2.0 — logo files

Vector masters for the Brand 2.0 mark (the rounded oval seal), built October 2026.
All files are tight to the artwork with no clear space. Clear space is the height of the P stem on every side.

## Variants

| File stem | What it is | Natural proportion |
|---|---|---|
| `prive-padel_icon` | Oval seal alone | 741 × 1000 |
| `prive-padel_primary` | Seal over PRIVÉ / PADEL (the primary lockup) | 1178 × 1568 |
| `prive-padel_horizontal` | Seal left, PRIVÉ / PADEL right | 2935 × 1000 |
| `prive-padel_wordmark` | PRIVÉ PADEL on one line in the serif, no seal | 12816 × 1328 |
| `prive-padel_wordmark-stacked` | PRIVÉ over PADEL, no seal | 5448 × 2050 |

Each variant comes in four colours: `ink` (#0F1B22), `cream` (#F5F0E8), `black` (#000000), `white` (#FFFFFF).

- `svg/` — the vector masters. Use these for web, signage and embroidery digitising.
- `pdf/` — the same artwork as single-page PDF for print and for placing in Illustrator or InDesign.
- `png/` — 3000 px on the long side, transparent background. Convenience only; prefer the SVG.

Minimum sizes: seal alone from 16 px, 10 mm print, 14 mm embroidered. Stacked lockup from 48 px or 24 mm. Below that, the seal alone.

## How the artwork was built

- The oval ring is a mathematically exact ellipse pair (outer 741 × 1000, uniform stroke 29.2 units), not a trace.
- The P glyph was traced from the approved rounded monogram, then made exactly symmetrical: the left scroll is mirrored to form the right scroll about the stem's centre.
- PRIVÉ is traced from the supplied stacked logo, not set in a font. No available typeface matched the letterforms (a Bodoni Moda cut came closest and was rejected against the reference), so the word was vectorised at 4× with smoothing from the 253 px cap-height source. `source/wordmark-prive-master.svg` is the result, normalised to a 1000-unit cap height.
- PADEL under the seal is live type converted to outlines: Jost, weight 300, capitals, tracking 0.80 em, cap height one third of PRIVÉ's, as in the supplied logo.
- The one-line serif wordmark is traced too. P, R, I, V, É and E reuse the high-resolution traces; A, D and L are traced from the supplied one-line mark (634 px wide, 47 px cap height) at 16× with the threshold tuned so their stems match the other letters. Letter positions and the word space come from that mark. `source/wordmark-oneline-master.svg` is the result. Because of the small source, those three letters are smoothed more heavily than the rest; a larger export of the one-line mark would let them be retraced at the same quality as PRIVÉ.
- `source/` holds the monogram master, the traced PRIVÉ master, the Jost static instance (SIL Open Font License) and the two Python scripts that rebuild everything. Rebuilding needs `fonttools`, `vtracer`, `pillow`, `resvg-py`, `svglib` and `reportlab`.

## Outline smoothing

Every traced outline (the P glyph, PRIVÉ, and the one-line wordmark) is passed through `source/smooth.py` after tracing: the contour is resampled, true corners (serif ends, stroke joins) are detected and kept sharp, everything between corners is smoothed, straight edges are refitted as straight lines, and the rest is refitted as a minimal set of Bézier curves. This removes the pixel wobble from the source images and cuts the SVG files to a fraction of their size (the icon is under 3 KB). `source/smooth_all.py` applies it with settings matched to each source resolution.

## What is not here yet


- Place lockups (Privé · Montauk, Privé · Miami, Privé · Turks and Caicos) and the residency seal. These compose from the icon and the wordmark; the scripts can generate them once the names are final.
- A favicon set. Export from `svg/prive-padel_icon_ink.svg` at 16, 32, 180 and 512 px.
