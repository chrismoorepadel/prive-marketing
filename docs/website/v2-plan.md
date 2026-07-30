# Privé Padel — Site V2 Plan

*Drafted 2026-07-29. Supersedes the conversion-related portions of `overhaul-plan.md`.*

The premise of this document: `passport-offer-v2.html` proved the brand can carry a commercial argument without being diluted. The site should borrow its **positioning and design discipline** — not its funnel shape. The homepage stays a brand surface; the landing pages stay landing pages.

*Revised 2026-07-30 after a first attempt rebuilt the homepage as a landing-page clone. See §3.*

---

## 0. The product, stated once

Everything below assumes this. It is the single source of truth for tier copy — **do not reuse the tier copy in `membership.html` or `join.html`**; both are being retired and their wording is not current.

| | **Standard — $595/yr** | **Full Access — $995/yr** |
|---|---|---|
| 40+ destinations, member rates & benefits | ✓ | ✓ |
| Partner clubs | ✓ | ✓ |
| Experiences at member pricing | ✓ | ✓ |
| Privé Montauk & Miami | Member pricing, **4 visits per year** | Member pricing, **unlimited** |

**That's the whole difference.** One line separates the tiers: how often you can play at Montauk and Miami at member rates. Everything else is identical.

The founding offer — Full Access for $595, locked — is therefore a clean single-axis upgrade, which is why it converts. It's also why the homepage tier block can be small: there is exactly one row to compare.

> ⚠️ **Flag:** live copy currently says *four visits per **month*** (`join.html`, `passport-offer-copy.md`, `passport-offer.html`). Confirmed as **per year** — every surface needs correcting. This is a 12× difference in a stated benefit and appears on the page where people are actively buying.

---

## 1. What the landing pages proved

The important discovery in `passport-offer-v2` isn't the offer. It's that **the brand did not have to be diluted to convert.** Same Cormorant Garamond, same cream/navy, same gold hairlines, same italic-accent headlines, same editorial photography. Nothing about the visual language was sacrificed.

What changed was four things:

1. **Sequencing.** The offer is above the fold, not at section 7.
2. **Translation.** Internal taxonomy ("Padel Club Partners", "Privé Locations") became customer outcomes ("A court everywhere you travel", "Montauk & Miami, included").
3. **Proof density.** Numbers, recognizable property names, testimonials, press logos, strike-through retreat pricing — the page continuously earns the next scroll.
4. **Terminal action.** Checkout is on the page — the decision and the transaction happen together.

The first three transfer to the homepage. **The fourth does not.** A landing page earns the right to end in a form because the visitor arrived with intent from an ad; a homepage has not earned that, and ending in a form is what makes a brand site read as an ad. The transferable lesson is "the brand can hold a commercial argument if the argument is sequenced and evidenced" — not "put the checkout everywhere."

---

## 2. Diagnosis: why the current site doesn't convert

### The homepage never asks for the sale

Current section order: hero carousel → four pillars → featured destinations → experiences → price → Montauk → worldview → closing CTA. The user reaches a price at roughly 60% scroll depth, having been given no reason to believe the price is a good one.

There is **no social proof anywhere on the homepage** — no testimonial, no press, no member count, no stat row. `passport-offer-v2` has all four in the first two screens.

### The homepage never shows the product it's selling

The product is two tiers: **Standard $595/yr** and **Full Access $995/yr**. The founding offer is a temporary acquisition hook — Full Access at the Standard price — and it belongs to the ad layer, not the site.

Given that, "starting at $595" on the homepage is *accurate*. The problem is different: the homepage shows only the $595 number and never shows the tier structure at all. $995 appears nowhere on `/` except inside the founding-offer popup. A visitor cannot learn what Full Access is, what it adds, or why they might want it — the entire upper tier is invisible until a modal interrupts them with a discount on a thing they've never seen.

`/passport` is worse: it shows `$595` and nothing else. The page whose entire job is explaining the membership never presents the two things you actually sell.

Tier tables do exist on `join.html` and the orphaned `membership.html` — but both state the allowance incorrectly (see §0), so they're a liability rather than a shortcut. The V2 tier block gets written fresh.

### The funnel has a lateral step

`index.html` → `passport.html` presents the same "Four ways to play" block and the same pricing block, near-verbatim. The user clicks the primary nav item and receives no new information. Then `join.html` re-sells the entire proposition *again* before checkout. Three surfaces, one argument, two unnecessary page loads.

### Homepage real estate is allocated backwards

A full homepage section is given to **Montauk — "Coming Soon", returns Spring 2027**: a venue eight months away that cannot be booked. Meanwhile **Miami is open now**, has a live Playtomic booking link, and appears on the homepage only as a nav item. The one thing on the site a visitor can transact on today is invisible.

### Four carousel slides is four messages, which is no message

The hero rotates through Introducing / Destinations / Experiences / Miami. Auto-advancing at 6–7s means most visitors see slide 1 and part of slide 2. The campaign-canvas rationale in `overhaul-plan.md` is sound in principle, but a carousel is the wrong mechanism — it trades a committed statement for the illusion of covering everything.

### Legacy pages are still deployed

Fully orphaned but live and indexable: `membership.html`, `clubs.html`, `collection.html`, `club-coral-gables.html`, `club-montauk.html`, and root-level `destinations.html` / `experiences.html` / `club-partners.html` (only the `/passport/*` versions are linked). `membership.html` still serves the full $595/$95/$995 tier table. These compete for the brand's own search terms and can surface stale pricing.

---

## 3. The strategic call

The site serves three jobs. The instinct is to balance them. That's the trap — a homepage that balances three audiences serves none of them well, which is roughly where the current homepage sits.

Instead, separate them by **entry point**, and let each lane be single-minded:

| Lane | Job | Primary entry | Surface |
|---|---|---|---|
| **Sell** | Passport membership | `/` (paid + organic + direct) | Homepage, `/passport`, `/passport/*` |
| **Book** | Miami court time | Search, Maps, Instagram bio | `/miami` → Playtomic |
| **Believe** | Brand comprehension | Nav, footer, referral | `/about`, editorial |

The reasoning on Miami: local booking intent almost never arrives via the homepage. Someone searching "padel Coral Gables" lands on `/miami` directly. Someone who taps the Instagram bio wants to book. Serving that intent through a homepage section is serving it in the wrong place — it belongs in the **nav, permanently and visibly**, and in local SEO.

That frees the homepage from having to be a booking surface — but not from being a brand surface. It remains the one page that has to say what Privé Padel *is*.

### Where the offer lives

The founding offer is temporary and strategically scoped to acquisition. It should never appear as standing homepage content. That gives a clean two-layer split:

| Layer | Carries | Pricing shown |
|---|---|---|
| **Site** (`/`, `/passport`, `/join`) | The product | Both tiers at list: $595 Standard · $995 Full Access |
| **Acquisition** (ads → `/passport-offer-v2`; homepage popup → email nurture) | The offer | Full Access for $595, locked for life |

The popup email capture already on `index.html` is the bridge: the homepage sells the membership at list price, the popup trades the founding offer for an email, and the nurture sequence carries that email to the landing page. The offer is the *reason to give you an address*, not the reason to visit.

This also means the site doesn't rot when founding closes. Nothing on `/` has to be rewritten — the offer simply stops being served in the acquisition layer.

> **Recommendation: the homepage stays a brand surface. Keep its structure, palette, and editorial register — and fix the four specific things that stop it converting.**

An earlier draft of this plan said the opposite: rebuild the homepage on the landing page's spine. That was wrong, and building it proved why. The landing page's value is its **positioning and design discipline**, not its funnel shape. Ported wholesale, you get a homepage that reads as an ad — one that ends in a checkout form and says nothing about Privé Padel as a brand.

The homepage's job is the brand *holistically*: Privé Padel as the house, with Passport, Montauk, and Miami as parts of it. It should support conversion, not perform it. The transaction belongs on `/join`.

**What the landing page actually contributes** — four things, applied surgically:

1. **A committed hero.** One statement instead of four rotating ones.
2. **Proof.** Network scale and press — completely absent today.
3. **The full product.** Both tiers visible, not just the entry price.
4. **Concrete outcomes** in place of internal taxonomy, where the copy allows.

**Colour discipline.** Cream (`--cream #F5F0E8`) is the site's ground. Navy and dark navy are *punctuation* — the brand anchor, the pricing beat, the worldview moment, the closing CTA. That rhythm already exists on the homepage and is correct. The all-navy treatment belongs to landing pages, where a single dark canvas suits a single-purpose page. Do not carry it onto the site.

`/about` remains the pure manifesto surface with no CTAs, exactly as `overhaul-plan.md` specifies.

---

## 4. Homepage V2 — section by section

Base is the **current homepage**, not the landing page. Sections marked ✏️ change; ➕ are new; the rest stand as they are.

| # | Section | Bg | Change |
|---|---|---|---|
| 0 | Nav | — | ✏️ Venue status labels: **Montauk — Spring 2027**, **Miami — Open now** (green). Carries venue state site-wide without spending a section on it, and gives Miami booking-intent weight. Same five items. |
| 1 | Hero | image | ✏️ Four-slide carousel → **one committed statement**. Most visitors only ever saw slide 1. Still campaign-swappable — `data/hero-slides.js` is unchanged in shape, it just holds one object now. Dots auto-hide at a single slide. |
| 2 | Brand anchor | navy | — Unchanged. The first dark beat. |
| 3 | Four ways to play | cream | — Unchanged. The best section on the site: place-led, four-column, editorial. |
| 4 | **Proof** | cream | ➕ **New.** Network scale (40+ / 18 / 5) in serif italic navy, then a greyscale press row. The single biggest gap — there was no proof anywhere on the homepage. |
| 5 | Featured destinations | cream | — Unchanged. |
| 6 | Featured experience | cream | — Unchanged. |
| 7 | **Members** | sand | ➕ **New.** Three testimonials on `--light`, a half-step off cream so five consecutive warm sections don't flatten. Placed immediately before pricing to warm the ask. |
| 8 | Membership | dark | ✏️ **"starting at $595" → both tiers.** Standard $595 and Full Access $995, with the one differing line stated under each. Keeps the dark beat and the serif italic numerals. The benefits columns stay — they apply to both tiers. |
| 9 | Privé Locations | cream | ✏️ **Montauk-only → both venues.** Miami first, *Open Now*, with a live Playtomic **Book a Court** CTA. Montauk second, *Returning Spring 2027*, reversed layout, telling the origin story. Fixes the backwards allocation where the unbookable venue had the section and the open one was invisible. |
| 10 | Worldview | dark | — Unchanged. |
| 11 | Closing CTA | navy | ✏️ "$595 a year" → "From $595 a year" to match two tiers. |

**No checkout on the homepage.** It presents the tiers and sends people to `/join`. That costs a click, but an inline two-step form is the single most landing-page-like element there is and it doesn't belong on a brand surface.

## 5. What happens to everything else

### Full page inventory

**Nothing that a visitor can currently reach from the site is being deleted.** Every page proposed for removal is already unreachable — no link anywhere on the live site points to it. Verified by crawling `href`s across all linked pages.

#### Keep and rebuild

| Page | Change |
|---|---|
| `/` | The V2 rebuild (§4). |
| `/passport` | Repositioned from homepage clone to **depth page** — inherits the "Full Breakdown" tabbed treatment from `passport-offer.html` (v1): every benefit explained, full tier comparison, per-property specifics. Satisfies the researcher who won't buy without reading everything. No overlap with the homepage's spine. |
| `/join` | Strip to pure checkout. The user has decided — stop selling. Currently it re-presents the entire proposition before the form. |
| `/miami` | Real investment as the booking lane's landing page: booking CTA above the fold, hours, pricing, `LocalBusiness` schema for local SEO, secondary Passport pitch. It's the only page on the site with a transactable action and it's under-built relative to that. |
| `/montauk` | Currently a single "Coming Soon" line. Build into a proper anticipation page: the origin story (2024, two courts, where the brand started), the new Lake Montauk location, Spring 2027, and an email capture. |
| `/locations` | **Keep — I was wrong about this one.** I called it orphaned; it's linked from the footer on every page. With Montauk pre-opening it earns its place as the Privé Clubs hub, giving Montauk a home beyond a nav item. |
| `/about` | Unchanged. Four-section editorial scroll, no CTAs. |
| `/contact`, `/privacy`, `/terms` | Unchanged. |
| `/passport/destinations`, `/passport/experiences`, `/passport/club-partners` | Keep. Align to the new spine in Phase 3. |
| `/experiences/*` (3 retreat pages) | Keep. |

#### Keep, intentionally unlinked

These are campaign destinations. They *look* orphaned because they should be — traffic arrives from ads and email, not navigation. Add `noindex`.

| Page | Role |
|---|---|
| `/passport-offer`, `/passport-offer-v2` | Paid-ad destinations. Once `/` adopts the spine, these become the testing ground for offer variants. |
| `/founding-checkout` | Abandoned-checkout email destination. |

#### Redirect (all confirmed unreachable)

| Page | → | Why it's dead |
|---|---|---|
| `/membership` | `/passport` | Superseded by `/passport`. Still serves a live $595/$95/$995 tier table with **out-of-date terms** — do not reuse its copy. Write the V2 tier block fresh from §0. |
| `/clubs` | `/locations` | Superseded by `/locations`. |
| `/collection` | `/passport/destinations` | Retired "Travel Collection" language. |
| `/destinations` | `/passport/destinations` | Root-level duplicate — only `/passport/destinations` is linked. |
| `/experiences` | `/passport/experiences` | Root-level duplicate. |
| `/club-partners` | `/passport/club-partners` | Root-level duplicate. |
| `/club-coral-gables` | `/miami` | Superseded by `/miami`. |
| `/club-montauk` | `/montauk` | Superseded by `/montauk`. |
| `/coming-soon` | `/` | Pre-launch holding page, titled "Coming Monday". |
| `/welcome` | `/` | Dead duplicate — checkout success actually redirects to `passport.prive-padel.com/welcome`, not this file. |
| `/password` | *(leave or delete)* | Pre-launch gate. Harmless either way. |

The reason to redirect rather than ignore: these are live and indexable, they compete with your own pages for brand search terms, and several carry retired language or stale pricing.

---

## 6. Fix before V2 (this week, ~a day of work)

These don't need the rebuild and are currently costing money:

1. **Correct the visit allowance everywhere** — it currently reads "four visits per month" on `join.html` and both offer pages; it is four per *year*. This is live on the checkout page.
2. **Put both tiers on `/` and `/passport`**, written fresh from §0. Right now $995 appears on the homepage only inside a popup, so the upper tier is effectively unsellable.
3. **301 the dead pages** (table above) — removes stale pricing and retired language from the index.
4. **Add venue status labels to the nav** — Montauk *Spring 2027*, Miami *Open now*. Cheap, and it fixes the biggest single gap: that Miami is bookable today and nobody browsing can tell.
5. **Build out `/montauk`** past the one-line placeholder, with email capture.
6. **`noindex` the campaign pages** so the ad landing pages don't compete with `/` on brand search — and so the offer isn't discoverable outside the acquisition layer.

---

## 7. Measurement

`gtag`, `fbq`, and `clarity` are already on every page, but the landing pages fire a richer event set (7 `gtag` calls vs. 5 on the homepage). Before shipping V2:

- **Event parity** across `/`, `/passport-offer-v2`, and `/join` — same names, same params — so `/` can be compared head-to-head against the landing page it's modeled on.
- **Instrument the funnel steps:** `view_offer`, `begin_checkout_step1`, `begin_checkout_step2`, `purchase`. Right now there's no way to tell whether the homepage loses people at the argument or at the form.
- **Baseline before the swap.** Capture 2–3 weeks of current homepage → `/join` conversion so V2 has something to be measured against. If ad spend allows, run V2 as a 50/50 split on `/` rather than a hard cutover.
- **Scroll-depth on the current homepage** (Clarity already supports this) will confirm or refute the §2 claim that the price block sits below where most visitors stop. Worth checking before committing to the reorder.

---

## 8. Phasing

**Phase 0 — Stop the leaks** (~1 day)
Section 6 in full. Independent of everything below.

**Phase 1 — Homepage V2** (the main body of work)
Extract the v2 sections into shared partials/styles rather than copying markup — the site is static HTML and the value stack, offer block, testimonials, FAQ, and checkout all need to exist on `/`, `/passport`, and `/join` without triple maintenance. Build, then split-test against current.

**Phase 2 — Supporting surfaces**
`/passport` as the depth page, `/join` stripped to checkout, `/miami` built out for booking + local SEO, `/montauk` email capture.

**Phase 3 — Depth pages and polish**
`/passport/destinations`, `/passport/experiences`, `/passport/club-partners` aligned to the new spine. Mobile QA. Performance pass — `index.html` is 60KB of HTML and `passport-offer-v2.html` is 111KB, most of it inlined CSS; if the sections become shared, that's the moment to extract stylesheets.

---

## 9. Open questions

1. **Does "first 200" still hold?** `passport-offer.html` says first 200; `passport-offer-v2.html` says only "limited time." If a real count exists, showing remaining spots is stronger than either. Ad layer only.
2. **How aggressive should the homepage popup be?** It's the sole bridge between the site and the offer, which raises its importance — but exit-intent vs. scroll-trigger vs. timed changes both conversion and how the brand reads. Worth deciding deliberately rather than inheriting the current behavior.
3. **Which tier is the homepage's default recommendation?** Full Access is the better product and the one the offer converts people to. If `/` visually favors Full Access at $995, the popup's $595 offer lands harder. If it favors Standard, the popup is a smaller jump. This is the main open call in §4 row 5.
4. **Miami booking** — stay with outbound Playtomic, or embed? Outbound is the current locked decision; V2 doesn't change it unless booking volume justifies it.
