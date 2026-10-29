# Privé Padel 2.0 — Website refresh brief

Handoff for building the Brand 2.0 version of prive-padel.com on its own branch.
Written 29 October 2026 after the Brand 2.0 direction, deck and logo vector set were approved.

This is a **refresh, not a rebrand**. The site's structure, photography, voice and most of its CSS stay. What changes is the mark, the dark colour, the role of gold, the type settings, the naming of the product, and the job the homepage does.

---

## 0. Start here

1. Create the branch from `brand/logo-2.0-vectors`, not from `main`, so the logo assets are present:
   ```bash
   git switch brand/logo-2.0-vectors && git switch -c site/brand-2.0
   ```
2. Read, in this order:
   - `docs/brand/phase-two.md` — voice, registers, taglines, forbidden words, the people. Still binding, except where this brief overrides it (listed in §2).
   - `docs/website/v2-plan.md` — the product (two tiers), the diagnosis of why the site does not convert, and the page inventory. Its conversion analysis still holds; its recommendation to show pricing on the homepage is **superseded** by §4.
   - `assets/brand-2.0/logo/README.md` — the logo files and their rules.
   - This file.
3. Run the site locally with the `static` configuration in `.claude/launch.json` (Python static server on port 4321). Tests: `npm test` (`node --test`, two suites). There is no build step: the site is hand-written static HTML deployed to Vercel with `cleanUrls: true`, so `/passport` serves `passport.html`.

Reference pages (private artifacts; ask Chris to share if they will not open):
- Brand 2.0 style guide: https://claude.ai/artifact/RrPJFm6nYecbXbqoXH3zeA
- Brand 2.0 deck: https://claude.ai/artifact/XcZx43FB6zAPLqSmDMi6g8

---

## 1. The repo, briefly

- Pages are root-level `.html` files sharing `styles/main.css` (3,400 lines, token-driven, sectioned with `═══` comment banners). Page-specific sheets: `join.css`, `experience.css`, `passport-sub.css`, `about.css`. `quatre.css` belongs to a separate brand (Quatre Padel Courts) and is out of scope.
- `data/destinations.js` sets `window.DESTINATIONS`, an array of 43 partner properties with `id`, `region`, `name`, `loc`, `image`, `heroImg`, `img2`, `filter`, `featured`, `collection`, `desc`, `about` and more. It drives `/passport/destinations.html` and the destination drawer (`js/destination-drawer.js`).
- Images are on Cloudinary (`res.cloudinary.com/dfjqa5f05`). The nav currently loads two 70 px PNG logos from there; those are the files being replaced.
- Live, linked pages: `/`, `/passport`, `/passport/destinations`, `/passport/experiences`, `/passport/club-partners`, `/locations`, `/montauk`, `/miami`, `/join`, `/about`, `/contact`, `/privacy`, `/terms`, plus three experience pages under `/experiences/`.
- Landing pages (`passport-offer-v2*.html`, `passport-travel-desk.html`, `passport-apply.html`) are ad destinations. **Leave them alone** in this pass except for the logo swap in §5.
- Legacy pages already redirect in `vercel.json` (`/membership`, `/collection`, `/destinations`, `/experiences`, `/clubs`). Keep those redirects; add new ones only as noted below.

---

## 2. The five Brand 2.0 shifts (these override Phase Two where they conflict)

| Shift | Rule |
|---|---|
| **Ink replaces navy** | `#0F1B22` is the public dark: text, buttons, dark bands, signage. Navy `#1B2A4A` stays only inside the Passport member platform (a separate app). On this site, every use of `--navy` for text or background becomes `--ink`. |
| **Gold goes physical** | Gold `#B8976A` is no longer a text or button colour. It survives as the one centered 60 px hairline rule (`.gold-rule`) and nothing else on screen. |
| **Caps serif as signature** | The wordmark's own setting (tracked capitals in the serif) becomes a second display voice for place and collection names. The italic sentence-case Cormorant headline stays for editorial copy. The two never appear in the same block. |
| **The oval as device** | The seal may crop a portrait (pros, people), be stamped on hero photography, and sit as a sign. It is never a button shape, card radius or background blob. Corners stay square. |
| **One capsule colour** | Brand pages keep the five colours. Capsule palettes never reach the website. |

Everything else in Phase Two stands: cream ground, Cormorant Garamond + Jost, the italic accent, photography first, the three registers and taglines, forbidden words.

### Tokens

Replace the `:root` block in `styles/main.css` with:

```css
:root{
  --ink:    #0F1B22;  /* primary dark, from the mark */
  --navy:   #1B2A4A;  /* kept only for legacy selectors; no new uses */
  --cream:  #F5F0E8;
  --sand:   #D9CDB8;
  --gold:   #B8976A;  /* .gold-rule only */
  --gold-ink: #0F1B22;/* was #7E6135; eyebrows go to ink */
  --dark:   #0F1B22;  /* was #0E1923; unify with ink */
  --white:  #FFFFFF;
  --mid:    #6B6358;  /* was #8A7F72; passes AA on cream */
  --light:  #EDE8E0;
  --nav-h:  72px;
}
```

Then, across `main.css` and the page sheets:
- `color:var(--navy)` → `var(--ink)` everywhere it colours text; `background:var(--navy)` → `var(--ink)` on bands and buttons.
- `.section-eyebrow`, `.hero-pretitle` and every `.pp-*`, `.plb-*` eyebrow: colour ink (or `rgba(245,240,232,.75)` on dark), `font-weight:500`, `letter-spacing:.32em`.
- Buttons (`.btn-primary`, `.nav-cta:hover`, `.pp-submit`, `.plb-lock-cta`, `.mobile-nav-cta`): background `var(--ink)`, colour `var(--cream)`, `font-size:10px`, `font-weight:500`, `letter-spacing:.28em`, `border-radius:0`. Ghost buttons: `border:1px solid currentColor`, no fill.
- Any gold text (`.plb-about-label`, `.plb-lock-label`, `.pp-fo-eyebrow`, `.pp-tab span`, `.nav-link:hover`) → ink on cream, cream on ink. The hover colour on nav links becomes `var(--ink)`.
- Hairlines: `rgba(184,151,106,…)` → `rgba(15,27,34,.16)` on cream, `rgba(245,240,232,.16)` on ink. Exception: `.gold-rule`.
- `.display em` / `.hero-hl em`: keep italic, drop any gold colour.
- Leave photographic scrims (`linear-gradient` over images) as they are; retune their rgb to ink (`15,27,34`).

### Type settings to add

```css
.caps-serif{font-family:'Cormorant Garamond',serif;font-weight:500;letter-spacing:.3em;text-transform:uppercase;line-height:1.1;}
.label-wide{font-family:'Jost',sans-serif;font-weight:300;letter-spacing:.45em;text-transform:uppercase;}
```
Use `.caps-serif` for place and collection names (hero of `/montauk`, `/miami`, collection titles on destinations). Never on body or editorial headlines. Keep the Google Fonts link exactly as it is; no third typeface.

---

## 3. Naming

- **Privé Padel** is the house. **Passport** is the product. Write "Privé Padel Passport" once per page at most, then "the Passport". Never "Privé Passport" in new copy; replace it where it occurs.
- Nav labels drop the prefix: **Destinations · Passport · Clubs · About**. The seal carries the house name.
- "Clubs" is a page listing Montauk, Miami and Turks and Caicos (today's `/locations`). Keep `/locations` as the URL and redirect nothing.
- Every mention of the Passport on a page carries its definition line nearby, verbatim:
  > Passport is the Privé Padel membership: member rates and benefits at 40+ padel destinations, partner clubs, and our own courts in Montauk and Miami.
- No separate Passport wordmark or logo. Passport appears as type only.
- The one worldview line, "A life played well.", stays reserved for the about page and the closing moment.

---

## 4. The homepage's new job

The site stops selling the Passport and starts handing out the app. The membership sell moves inside the app (free tier first, native later), where a person has browsed, saved places and seen member rates.

- **One primary action everywhere**: "Get the app". It replaces "Get your Passport" in the nav CTA, the hero, and the closing CTA. Define one constant in `js/main.js`, `window.APP_URL`, and point every app CTA at it. Until the app exists it is `https://passport.prive-padel.com/signup` (confirm with Chris), so the free account is the destination.
- **Price leaves the homepage.** Remove the `.passport-pricing` section from `index.html`. The tiers live on `/passport` only.
- **Founding-offer popup** (`.pp-*` markup in `index.html`) is replaced by an app prompt using the same trigger logic, or removed. Do not ship a discount popup on a brand surface.
- **Hero**: keep the single photographic hero; stamp the seal top-right in cream at 90% opacity (`assets/brand-2.0/logo/svg/prive-padel_icon_cream.svg`, 56–72 px). Eyebrow becomes `40+ destinations · Montauk · Miami · Turks and Caicos`. Headline stays "The game travels *with you.*". Buttons: "Get the app" (cream fill), "Book Miami" (ghost, to the Playtomic listing).
- **Section order** stays as in `v2-plan.md` §3 minus pricing: hero → brand anchor (ink) → offerings → proof band → featured destinations → retreats → members band → portal band (now an app preview; reuse the device render) → locations → worldview → closing CTA (ink, "Get the app").
- **Apply-now funnel is dropped.** Do not add application language anywhere public. `/passport-apply` keeps working as a landing page but is unlinked.

---

## 5. Logo and favicon

Files are in `assets/brand-2.0/logo/` (SVG masters; PNG at 3000 px; PDF). Use the SVGs inline or as `<img>`; they are already colour-specific.

| Where | File |
|---|---|
| Nav at rest on photography | `svg/prive-padel_horizontal_cream.svg`, height 44 px |
| Nav scrolled (cream bar) | `svg/prive-padel_horizontal_ink.svg`, height 44 px |
| Nav on phones | `svg/prive-padel_icon_*.svg`, height 36 px |
| Footer | `svg/prive-padel_primary_cream.svg`, height 120 px |
| Hero stamp | `svg/prive-padel_icon_cream.svg` |
| Favicon / app icon | Export `prive-padel_icon_ink.svg` on cream at 16, 32, 180 and 512 px to `/favicon-*.png` and `/apple-touch-icon.png`; replace the current `favicon.png` |
| `og:image` | A 1200×630 cream card with `prive-padel_primary_ink` centred; save to `assets/brand-2.0/og-image.png` and point every page's `og:image` at it |

Replace the two Cloudinary logo `<img>` tags in every page's nav (`logo_light_nloide.png`, `logo_dark_drvkxb.png`) including the landing pages. Clear space is the height of the P stem on all sides; nothing touches the oval.

---

## 6. Page by page

### `/` index
As §4. Also: nav per §3; dark bands to ink; eyebrows and buttons per §2; remove `/passport/club-partners` from the footer list only if the page is retired (it is not, in this pass).

### `/passport` passport.html
Rewrite as the **upgrade page**, written for someone who already has the app:
1. Definition line at the top (§3).
2. The two tiers, exactly as `v2-plan.md` §0 (Standard $595/yr, Full Access $995/yr; the only difference is 4 visits a month vs unlimited at Montauk, Miami and Turks and Caicos). Present as the single-axis comparison, not a feature list.
3. One worked example: "A week at [destination]: public rate [$__], member rate [$__]. The Passport pays for itself in one trip." Chris supplies the figures; leave bracketed placeholders until then, never invent numbers.
4. CTA to `/join` (checkout stays there). Secondary CTA "Get the app".
Remove the "Four ways to play" duplication and the standalone `$595` block.

### `/passport/destinations` and new property pages
This is the acquisition engine. Build one public page per entry in `data/destinations.js`:
- URL `/destinations/<id>` (e.g. `/destinations/don-carlos-marbella`). Add a `vercel.json` rewrite from `/destinations/:id` to `/destinations/:id.html` if `cleanUrls` does not cover it, and change the existing `/destinations` redirect so only the bare path redirects.
- Generate the files with a small Node script, `scripts/build-destinations.js`, that reads `data/destinations.js` and writes `destinations/<id>.html` from a template. Commit the generated files (no build on Vercel). The script must be idempotent and run with `node scripts/build-destinations.js`.
- Page anatomy: nav; hero photo (`heroImg`, fallback `image`) with the seal stamp; eyebrow `region`; name in Cormorant 300 with the second clause italic where the name has one; `loc` in italic beneath; one editorial paragraph from `about`; the court count and two or three benefits as hairline pills; **one locked line, "Member rate in the app"**, as an ink button to `APP_URL`; related destinations (same `filter`); footer.
- `<title>` "Padel at {name} · Privé Padel"; meta description from `desc`; `og:image` = `heroImg`; JSON-LD `LodgingBusiness` with name, address locality from `loc`, image.
- Do **not** show member rates or rate deltas on public pages. Partner agreements usually restrict negotiated rates to logged-in members; the website says "member rate in the app". Public rates may be shown only where Chris confirms the partner allows it.
- Update `/passport/destinations.html` so every card links to its page, and add all property URLs to `sitemap.xml`.

### `/montauk`, `/miami`
Hero gets the place name in `.caps-serif` ("Privé Montauk", "Privé Miami") under a small seal. Miami keeps "Book a court" to Playtomic as the primary action for the public; member rate shown as the upsell line, not a gate. Montauk stays the anticipation page (Spring 2027, email capture).

### `/locations` → labelled "Clubs" in nav
Add a third card: **Privé Padel at Beach Enclave, Turks and Caicos**, "Opening [date]", with the co-brand lockup rule: our seal and wordmark, a 1 px ink hairline, the partner's logo in their own colour. Chris supplies the Beach Enclave logo file and the opening date; until then a bracketed placeholder, never a guessed date.

### `/join`
Checkout stays. Token and button changes only. Replace any "Privé Passport" with "Privé Padel Passport" once, then "the Passport".

### `/about`, `/contact`, `/privacy`, `/terms`, `/passport/experiences`, `/passport/club-partners`, `/experiences/*`
Token, logo, nav and naming changes only. No structural work.

### Playtomic
Wherever a court is bookable: one button, "Book on Playtomic", ink fill, Privé type, no Playtomic colour on our pages. Venue naming on Playtomic itself is "Privé Padel · Miami" (not in this repo; noted so links and copy agree).

---

## 7. Copy rules for anything new

- Forbidden outright: exclusive, lifestyle, wellness, elevated, members-only. Restricted: premium/luxury (partner category only), curated (only for the actual work of curation), experience (only as the proper noun "Padel Experiences").
- Lead with place and atmosphere; no feature lists as primary content; no hype, no urgency, no athletic-achievement framing.
- Registers: worldview (about page), membership (product pages, plain and warm), editorial (hero and campaign lines, place-led).
- Buttons state the action: "Get the app", "Book on Playtomic", "See the Passport", "Join".

---

## 8. Definition of done

- Every linked page passes: no navy text or backgrounds on public pages; no gold text or fills (`.gold-rule` excepted); nav reads Destinations · Passport · Clubs · About with "Get the app"; new logo in nav, footer, favicon and `og:image`; "Privé Passport" appears nowhere in new copy.
- Homepage has no price and no checkout; closing CTA is "Get the app".
- `/passport` presents both tiers and the definition line.
- 43 property pages exist, validate, are linked from the destinations grid, and are in `sitemap.xml`.
- Contrast: body text ≥ 4.5:1 on cream and on ink, measured with composited backgrounds (see `v2-plan.md` §"Contrast was measured" for the method).
- Works at 390 px wide with no horizontal scroll; the mobile nav shows the icon only.
- `npm test` passes; all internal links resolve on the local server; landing pages still load with the new logo and nothing else changed.
- Work lands as a sequence of commits in this order, each shippable on its own: (1) logo and favicon, (2) tokens and buttons, (3) nav and naming, (4) homepage, (5) `/passport`, (6) property pages and sitemap, (7) locations and flagship pages. Open a PR from `site/brand-2.0` against `main` with the deck link in the description.

---

## 9. Questions for Chris before starting (do not guess these)

1. `APP_URL` for "Get the app" until the native app exists. Assumed: the free-account signup on passport.prive-padel.com.
2. The worked pricing example on `/passport`: which destination, and its public and member rates.
3. Which partners allow a public rate on their property page (default: none).
4. Beach Enclave opening date and their logo file for the co-brand lockup.
5. Whether `/passport/club-partners` stays as a page or folds into the destinations grid.
