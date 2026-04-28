# Privé Padel — Public Website Overhaul

This document is the structural plan for rebuilding the public marketing website using Phase 2 brand standards and the Privé Passport platform as the visual reference.

It supersedes any partial migration work done previously. The goal is not to amend the existing site. The goal is to rebuild it from a clean foundation.

This document should be read in conjunction with:
- `docs/brand/phase-two.md` (the Phase 2 brand standards)
- The Privé Passport member platform (the visual and voice source of truth)

---

## Guiding Principles

Five rules that govern every decision in this rebuild.

**1. The platform is the brand.** Every visual pattern, voice register, and component decision should reference the Privé Passport member platform first. If the platform has solved a problem (destination card pattern, collection framing, hero treatment), the public site uses the same solution. Do not invent new patterns where the platform already has one.

**2. One register per surface.** No page should switch voice register mid-scroll. A page is either worldview, membership, or editorial. Choose at the page level, hold it from hero to footer.

**3. Place over product.** Lead with destination, atmosphere, and place. Product details (pricing, benefits, features) appear as quiet support beneath place-led content, never as the lead.

**4. Restraint scales.** When in doubt, remove. A blank section is better than a redundant one. A short paragraph is better than a long one. A single CTA is better than two competing CTAs. The brand earns its quiet by refusing to add noise.

**5. The architecture is implicit, not explicit.** The four-offering ecosystem (Padel Destinations, Padel Experiences, Padel Club Partners, Privé Locations under Privé Passport) is the truth, but the website does not need to constantly explain it. It can be shown once, clearly, in one place. Elsewhere it operates as the underlying structure.

---

## Sitemap

The site is six top-level surfaces plus utility pages. Each top-level surface has a clear job and a single primary audience.

```
/
├── index.html ............................. Homepage (worldview + product invitation)
├── passport.html .......................... Privé Passport (the membership)
│   ├── /passport/destinations.html ........ Padel Destinations (the 43-property network)
│   ├── /passport/experiences.html ......... Padel Experiences (curated retreats)
│   └── /passport/club-partners.html ....... Padel Club Partners (urban access)
├── montauk.html ........................... Privé Padel Montauk (venue)
├── miami.html ............................. Privé Padel at THesis Miami (venue)
├── about.html ............................. The brand (manifesto + story)
└── join.html .............................. Membership purchase flow

Utility:
├── contact.html
├── privacy.html
├── terms.html
└── 404.html
```

**Notes on slugs:**
- `miami.html` (not `coral-gables.html` or `club-coral-gables.html`) — Miami is the searchable name; THesis Coral Gables is the address detail
- `passport.html` (not `membership.html`) — the membership IS Passport; using the brand name as the slug is more confident
- Sub-routes for the three Passport offerings live nested under `/passport/`, signaling they are part of the membership rather than independent products
- `join.html` is the conversion endpoint — separate from `passport.html` so the marketing surface and the purchase flow can have different design discipline

**What's removed from the sitemap:**
- `clubs.html` (replaced by direct venue pages: montauk.html, miami.html)
- `collection.html` (folded into `/passport/destinations.html`)
- `experiences.html` (replaced by `/passport/experiences.html`)
- `club-partners.html` (replaced by `/passport/club-partners.html`)
- Anything containing "travel-collection" in the URL — that language is retired

---

## Top Navigation

Five items, no dropdowns, mobile collapses to a vertical drawer.

```
[Privé Padel Logo]    Privé Passport · Privé Montauk · Privé Miami · About Privé    [Get Your Passport]
```

Behavior:
- All four center items are direct links to their respective top-level pages
- "Get Your Passport" CTA is the only commercial action in the nav
- The "Privé" prefix on each nav item is intentional — it ladders every link back to the master brand and creates rhythmic typography across the nav
- For authenticated users (post-launch member portal integration), the right-side CTA becomes "Sign In" or member initials avatar
- No promotional banners above the nav
- No region/language selectors at this stage

The Passport sub-pages (Destinations, Experiences, Club Partners) are accessed only through the Passport page itself. They do not appear in the top nav. This is intentional — the architecture is implicit, the nav is for finding things.

---

## Footer

Five columns mirroring the nav structure.

```
Privé Passport              Privé Montauk   Privé Miami     About Privé     Legal
- Padel Destinations        - Visit         - Visit         - About Privé   - Privacy
- Padel Experiences         - Membership    - Membership    - Press         - Terms
- Padel Club Partners                                       - Careers       - Contact
- Privé Locations
- Get Your Passport
```

**Notes:**
- The Montauk and Miami columns will be sparse for now (1-2 links each). That's correct — they're first-class architectural nodes even if their content depth is currently shallow. The columns will grow as venue programming matures.
- "Press" and "Careers" are placeholder links for post-launch. Either build placeholder pages or remove from this iteration.
- Legal column consolidates utility links rather than scattering them.

---

## Page-by-Page Structure

### `/` — Homepage

**Audience:** First-time visitor. Mixed intent — some are Passport prospects, some are local Montauk/Miami players, some are brand-curious.

**Voice register:** Editorial, with a single worldview moment.

**Goal:** Communicate what Privé Padel is, who it's for, and what the membership delivers — without leading with the membership pitch. Place first, brand second, product third.

**Section structure:**

1. **HERO** — Editorial carousel, campaign-driven
   - The hero is a four-slide carousel for the launch campaign window. The carousel rotates as a unit roughly every 6 weeks (or longer) based on what's true about the brand at that moment — new campaigns, venue openings, seasonal experiences, founding-member windows. The hero is not evergreen; it is a campaign canvas.
   - Carousel behavior:
     - Auto-advance slowly: 6-7 seconds per slide minimum. Faster reads as nervous.
     - Slow crossfade transitions only. No slide-from-side animations (those are e-commerce, not editorial).
     - Pause on hover (desktop) and on touch (mobile).
     - Pagination dots: hairline, gold, bottom-center. No aggressive arrows on the sides.
     - Mobile: headline scales down substantially to avoid awkward line breaks.
     - Each slide is a full-bleed cinematic image with text overlay in the lower-left third, never centered, never dominating.

   **LAUNCH CAMPAIGN — Four slides for the founding-member window**

   **Slide 1 — Introducing**
   - Eyebrow: WELCOME
   - Headline: "Introducing *Privé Passport.*" (italic accent on "Privé Passport")
   - Sub-line: "A global travel membership for padel players."
   - Primary CTA: "Get Your Passport"
   - Secondary CTA: "Explore the Network"
   - Photography: hero-tier brand introduction image, full-bleed cinematic

   **Slide 2 — Padel Destinations**
   - Eyebrow: PADEL DESTINATIONS
   - Headline: "Forty-three places to *play.*"
   - Sub-line: "Member access to leading destinations in Spain, the Maldives, the Yucatán, and beyond. Preferred rates, room upgrades, and partner benefits at every property."
   - Primary CTA: "Explore Destinations"
   - Secondary CTA: "Get Your Passport"
   - Photography: single destination hero (Don Carlos Marbella or NIHI Sumba)

   **Slide 3 — Padel Experiences**
   - Eyebrow: PADEL EXPERIENCES
   - Headline: "Curated padel *retreats.*"
   - Sub-line: "Itineraries built around the game and the place — from the vineyards of Bordeaux to the remote coast of Madagascar. Members receive first access."
   - Primary CTA: "View Experiences"
   - Secondary CTA: "Get Your Passport"
   - Photography: Bordeaux château or Madagascar coastline

   **Slide 4 — Privé Miami (Now Open)**
   - Eyebrow: PRIVÉ LOCATIONS · NOW OPEN IN MIAMI
   - Headline: "Privé Padel arrives in *Miami.*"
   - Sub-line: "Our second flagship venue at THesis Hotel Coral Gables. Now open."
   - Primary CTA: "Visit Privé Miami"
   - Secondary CTA: "Get Your Passport"
   - Photography: Miami venue — court, exterior, or atmospheric Coral Gables shot

   **Implementation note for Claude Code:** Build the carousel as a configurable component, not a hardcoded sequence. Each slide should be a data object (eyebrow, headline, sub-line, CTAs, image) so a new campaign cycle can be deployed by editing a single configuration file rather than touching component code. The four launch slides are the first campaign loaded into this config; future campaigns will replace them.

2. **THE BRAND ARCHITECTURE** — Editorial diagram (NEW SECTION)
   - This is the section we discussed: brand architecture rendered as editorial visual, not org chart
   - Top of section: "PRIVÉ PADEL" eyebrow
   - Centered serif: "Privé Padel" (the master brand)
   - Hairline gold connector descending
   - Centered serif italic: "Privé Passport" (with eyebrow "THE MEMBERSHIP")
   - Four hairline gold connectors fanning gently to four columns:
     - Padel Destinations · 43 worldwide
     - Padel Experiences · curated retreats
     - Padel Club Partners · urban member access
     - Privé Locations · Montauk · Miami
   - Each column has a quiet "→" link to its page
   - Generous whitespace, no cards, no boxes, no shadows
   - Background: cream
   - The architecture diagram is shown ONCE on the entire site. This is where it lives. It is not repeated anywhere else.

3. **FEATURED DESTINATION** — Single place, full-bleed
   - Mirror the platform's "Featured Destination" pattern (Don Carlos Marbella treatment)
   - Eyebrow: FEATURED DESTINATION
   - Two-line serif headline: property name with italic accent on second clause
   - Region in italic
   - One short editorial paragraph
   - Small benefit pills as quiet support
   - Primary CTA: "Explore Property"
   - Rotates seasonally; for launch use Don Carlos Marbella or NIHI Sumba
   - Background: cream with image dominating

4. **CURATED PADEL RETREATS** — Editorial-list pattern (mirrors platform Experience Calendar treatment)
   - Eyebrow: EXPERIENCES
   - Headline: "Curated padel *retreats.*"
   - Three retreats listed as full-width editorial rows (NOT cards):
     - **Court & Cellar** · Bordeaux, France · Château de Lussac, Saint-Émilion
       - Description: "Four days of padel instruction and wine immersion among the vineyards of Saint-Émilion. A retreat built around the finest things Bordeaux does — play, cellars, and the unhurried art of the table."
       - Pills: 4 DAYS · PADEL INSTRUCTION · WINE IMMERSION · SAINT-ÉMILION
       - Status: SPACES AVAILABLE (green dot)
     - **Voaara Madagascar — Remote Island Escape** · Madagascar · Voaara Madagascar, Île Sainte-Marie
       - Description: "Seven days on the edge of the Indian Ocean — the world's most remote padel courts, pristine reefs, pirate cemeteries, and whale watching. A retreat defined entirely by the extraordinary nature of the place."
       - Pills: 7 DAYS · REMOTE ISLAND · INDIAN OCEAN · WORLD'S MOST REMOTE COURTS
       - Status: LIMITED — WAITLIST FORMING (gold dot)
     - **Nihi Sumba — Wild Indian Ocean** · Sumba, Indonesia · Nihi Sumba, Indonesia
       - Description: "Padel on the edge of one of the world's most extraordinary resorts. Nihi Sumba combines wild Indian Ocean surf, Sumbanese culture, and extraordinary hospitality — courts unlike anything else on the network."
       - Pills: TBD per platform
       - Status: COMING SOON (eyebrow color)
   - Each row layout: full-bleed image left (~40% width), content middle (~50% width), DETAILS / + button right (~10%)
   - Italic accent on second clause of each retreat headline (Court & *Cellar*, Voaara Madagascar — *Remote Island Escape*, Nihi Sumba — *Wild Indian Ocean*)
   - Eyebrow row above each retreat: location only (e.g., "BORDEAUX, FRANCE") in tracked caps gold; status framing handled by the colored-dot indicator at the bottom of the row, not in the eyebrow
   - Region descriptor beneath retreat headline in serif italic
   - Status indicator at bottom of content area: small colored dot + tracked caps text (SPACES AVAILABLE, LIMITED — WAITLIST FORMING, COMING SOON)
   - "DETAILS +" button at right opens drawer/modal with full retreat details (same drawer pattern as Padel Destinations)
   - Hairline cream-on-cream rule between rows
   - Background: cream
   - CTA at bottom of section: "View All Experiences" → /passport/experiences
   - **Note:** No date strings ("September 2026", "Winter 2026") — the eyebrow uses location and a "COMING SOON" / "OPEN NOW" / "WAITLIST" status framing instead. Dates can be presented inside the drawer/details view but not as the primary label, since dates age the design and require constant maintenance.

5. **THE WORLDVIEW MOMENT** — Quiet editorial beat
   - Background: dark navy (#0E1923)
   - Single centered italic line: "A life played well."
   - Below: "Privé Padel is the brand. Privé Passport is the membership that lets it travel with you."
   - Single CTA: "Read the brand" → /about
   - This is the homepage's single worldview moment. Brief, atmospheric, sets up the about page without trying to convert.

6. **CLOSING CTA** — Conversion landing
   - Editorial closing tagline: "The world, *played.*"
   - Sub-line: "From the Hamptons to Madagascar, from Marbella to the Yucatán — Privé Passport is how the game travels with you."
   - Primary CTA: "Get Your Passport"
   - Secondary CTA: "Explore the Network"
   - Background: dark navy or hero-tier image

**What's removed from current homepage:**
- The "About Privé Padel" intro paragraph (folded into the architecture diagram section)
- The "Three ways to experience Privé Padel" section (replaced by the architecture diagram)
- The "Privé Clubs — Our flagship locations" parallel pillar section (architecture diagram covers this)
- The "Privé Passport — The membership that travels" features-list (lives only on /passport now)
- The 0+ stats counter (delete entirely; replace with the architecture diagram which conveys scale through structure)
- The "Privé Padel. Everywhere." closing tagline (replaced by "The world, played.")
- Any nav dropdowns or "Travel Collection" labeling

---

### `/passport` — Privé Passport

**Audience:** The Passport prospect. Someone considering the membership.

**Voice register:** Membership — direct, warm, plain-spoken. Less worldview, more practical.

**Goal:** Explain what Privé Passport is, what it includes, and what it costs. Convert interest into the join flow.

**Section structure:**

1. **HERO**
   - Eyebrow: THE MEMBERSHIP
   - Headline: "The game travels *with you.*"
   - Sub-headline: "One membership. Member access to forty-three partner destinations, two flagship venues, curated retreats, and a network of partner clubs."
   - Primary CTA: "Get Your Passport" — $595/year
   - Photography: hero-tier image, mirrored from the homepage style

2. **THE FOUR OFFERINGS** — Detailed
   - Eyebrow: WHAT YOUR PASSPORT INCLUDES
   - Headline: "Four ways to *play.*"
   - Four sections, each with a featured image, place-led headline, editorial paragraph, and small benefits list:
     - Padel Destinations (centerpiece — slightly more visual weight)
     - Padel Experiences
     - Padel Club Partners
     - Privé Locations
   - Each with a "Learn more" link to the respective sub-page

3. **HOW IT WORKS**
   - Eyebrow: HOW PRIVÉ PASSPORT WORKS
   - Headline: "Three steps to *anywhere.*"
   - Three steps (preserve from existing membership.html which does this well):
     - 01 Join Privé Passport
     - 02 Explore the Collection
     - 03 Arrive as a Privé Member

4. **MEMBERSHIP TIERS**
   - Eyebrow: MEMBERSHIP
   - Headline: "Choose your *Passport.*"
   - Three tier cards (preserve from existing membership.html):
     - Standard · $595/yr
     - Partner Member · +$95/yr
     - Full Access · $995/yr
   - Visual emphasis on Standard as the primary tier

5. **WHAT'S INCLUDED — DETAILED**
   - Eyebrow: WHAT YOUR PASSPORT INCLUDES
   - Headline: "The membership *that travels with you.*"
   - Editorial paragraph (preserved from existing membership.html)
   - Two-column benefits list:
     - At every Padel Destination
     - Across the rest of the network
   - This is the platform's Don Carlos pattern, scaled up to membership level

6. **CLOSING CTA**
   - Single CTA: "Get Your Passport" → /join

---

### `/passport/destinations` — Padel Destinations

**Audience:** Member or prospect browsing the property network.

**Voice register:** Editorial — place-led, atmospheric.

**Goal:** Showcase the 43-property network through featured destinations. Convert browsing into Passport interest.

**Section structure:**

1. **HERO** — Single featured destination, full-bleed
   - Same pattern as homepage Featured Destination but locked to destinations context
   - Eyebrow: PADEL DESTINATIONS
   - Headline: "Forty-three places to *land.*"
   - Sub-line: "Each destination chosen for the courts, the place, and the people who travel to be there."

2. **FEATURED DESTINATIONS** — Curated grid
   - Eyebrow: FEATURED DESTINATIONS
   - Six to nine destination cards in a curated grid
   - Mirror platform's destination card pattern exactly (region eyebrow + property name in serif + region descriptor in italic + benefit pills)
   - Each card opens the property modal/drawer on click
   - Curated rotation; not the full 43 — this is editorial, not exhaustive

3. **THE FULL NETWORK** — Searchable list
   - Eyebrow: THE FULL NETWORK
   - Headline: "Every destination on *one passport.*"
   - Region filter, country filter, "show all"
   - Card grid of all 43 properties using the same destination card pattern
   - Each card opens the property modal/drawer on click

4. **MEMBERSHIP CTA**
   - Single editorial line: "Member access begins at $595/year."
   - CTA: "Get Your Passport"

---

### `/passport/experiences` — Padel Experiences

**Audience:** Members or prospects looking at curated retreats.

**Voice register:** Editorial — most evocative register, cinematic.

**Goal:** Make retreats feel rare and desirable. Drive retreat-specific waitlist sign-ups and Passport conversions.

**Section structure:**

1. **HERO** — Featured retreat, full-bleed
   - Eyebrow: PADEL EXPERIENCES
   - Headline: "Curated padel *retreats.*"
   - Sub-line: "Itineraries built around the game and the place — invitation-only, for members first."

2. **THE EXPERIENCE CALENDAR** — Editorial-list pattern (mirrors platform Experience Calendar treatment)
   - Eyebrow: EXPERIENCE CALENDAR
   - Headline: "Curated Padel *Retreats.*"
   - Each retreat as a full-width editorial row with this layout:
     - Image left (~40% width)
     - Content middle (~50% width):
       - Eyebrow: location and status (e.g., "BORDEAUX, FRANCE" or "COMING SOON · SUMBA, INDONESIA") in tracked caps gold
       - Retreat headline in serif with italic accent on second clause
       - Sub-line in serif italic: location specific (e.g., "Château de Lussac, Saint-Émilion")
       - Editorial paragraph: 2-3 sentences in serif body
       - Benefit pills row: 4 small outlined pills (e.g., "4 DAYS", "PADEL INSTRUCTION", "WINE IMMERSION", "SAINT-ÉMILION")
       - Status indicator at bottom: small colored dot + tracked caps text
         - Green dot: SPACES AVAILABLE
         - Gold dot: LIMITED — WAITLIST FORMING
         - Eyebrow color dot: COMING SOON
     - "DETAILS +" button at right (~10% width) opens drawer/modal with full retreat detail
   - Hairline cream-on-cream rule between rows
   - Background: cream
   - Three retreats listed:
     1. **Court & Cellar** · Bordeaux, France
        - Sub: Château de Lussac, Saint-Émilion
        - Description: "Four days of padel instruction and wine immersion among the vineyards of Saint-Émilion. A retreat built around the finest things Bordeaux does — play, cellars, and the unhurried art of the table."
        - Pills: 4 DAYS · PADEL INSTRUCTION · WINE IMMERSION · SAINT-ÉMILION
        - Status: SPACES AVAILABLE
     2. **Voaara Madagascar — Remote Island Escape** · Madagascar
        - Sub: Voaara Madagascar, Île Sainte-Marie
        - Description: "Seven days on the edge of the Indian Ocean — the world's most remote padel courts, pristine reefs, pirate cemeteries, and whale watching. A retreat defined entirely by the extraordinary nature of the place."
        - Pills: 7 DAYS · REMOTE ISLAND · INDIAN OCEAN · WORLD'S MOST REMOTE COURTS
        - Status: LIMITED — WAITLIST FORMING
     3. **Nihi Sumba — Wild Indian Ocean** · Coming Soon · Sumba, Indonesia
        - Sub: Nihi Sumba, Indonesia
        - Description: "Padel on the edge of one of the world's most extraordinary resorts. Nihi Sumba combines wild Indian Ocean surf, Sumbanese culture, and extraordinary hospitality — courts unlike anything else on the network."
        - Pills: per platform
        - Status: COMING SOON
   - **No date strings.** Status framing replaces month/year. Specific dates appear inside the drawer/details view if needed, never as the primary label.

3. **MEMBERSHIP CTA**
   - "Members receive first access and early-bird pricing on every Padel Experience."
   - CTA: "Get Your Passport"

---

### `/passport/club-partners` — Padel Club Partners

**Audience:** Members or prospects who travel for business or want urban access.

**Voice register:** Editorial — practical-warm, place-led.

**Goal:** Communicate that the membership keeps the game close even when you're not at a destination resort.

**Section structure:**

1. **HERO**
   - Eyebrow: PADEL CLUB PARTNERS
   - Headline: "A court is *always close.*"
   - Sub-line: "Wherever your Privé Passport takes you — business travel, a city weekend, or time between resort stays — partner clubs in key cities ready your game."
   - Pull voice from platform's Padel Club Partners section

2. **THE NETWORK** — City grid
   - Mirror platform's partner club display
   - US: Padel Up (LA), Racketeer (London — wait, that's UK — restructure by region)
   - By region: United States, United Kingdom, Asia Pacific
   - "Coming Soon" tags for cities in development (NYC, West Palm Beach, Chicago)

3. **HOW IT WORKS**
   - Eyebrow: MEMBER ACCESS
   - Three steps: identify yourself as a Privé Passport member, book at preferred rate, play
   - Brief — this is the simplest of the four offerings

4. **MEMBERSHIP CTA**
   - "Privé Passport · From $595/year · Includes partner club access."
   - CTA: "Get Your Passport"

---

### `/montauk` — Privé Padel Montauk

**Audience:** Local Hamptons player. Someone in or visiting Montauk who wants to play padel.

**Voice register:** Editorial — place-led, warm. This is a destination page.

**Goal:** Communicate what Privé Padel Montauk is, when it's open, how to play. Convert the local player into a court booking. Convert the brand-curious into Passport interest.

**Section structure:**

1. **HERO** — Place-led
   - Eyebrow: PRIVÉ PADEL · MONTAUK
   - Headline: "Padel on the *East End.*"
   - Sub-line: brief evocative description of the venue
   - Photography: hero image of the venue or location
   - CTA: "Book a Court"

2. **THE VENUE** — Editorial story
   - Two paragraphs: what Privé Padel Montauk is, why it exists in Montauk, what playing there feels like
   - Quiet credentials list: courts, location, hours

3. **PLAY** — Practical
   - Eyebrow: VISIT
   - Court booking widget or "Book a Court" CTA
   - Pricing: pay-per-play rate, member rate
   - Hours, season

4. **MEMBERSHIP** — Soft Passport pitch
   - Eyebrow: MEMBER ACCESS
   - One paragraph: members of Privé Passport play at preferred rates here, and at every other Privé Padel destination
   - CTA: "Get Your Passport" (secondary, not primary)

5. **EVENTS & PROGRAMMING** — When applicable
   - Upcoming tournaments, social events, brand activations

---

### `/miami` — Privé Padel at THesis Miami

Same structure as Montauk page, scoped to Miami. Hero headline could be: "Padel in *Coral Gables.*" or similar.

---

### `/about` — The Brand

This page is already well-structured per the about-page work we did. Preserve the four-section editorial scroll:

1. THE BELIEF (worldview manifesto, dark navy)
2. WHERE WE COME IN (role and rhythm, cream)
3. THE PEOPLE (who it's for, cream)
4. THE LONG GAME (closing vision, dark navy)

No CTAs on this page. The about page's job is the manifesto. Conversion happens elsewhere.

---

### `/join` — Membership Purchase

**Audience:** Converting Passport prospect.

**Voice register:** Membership — direct, transactional.

**Goal:** Complete the purchase. No more selling — the user has decided. Make checkout clean.

**Section structure:**

1. **HERO** — Minimal
   - Eyebrow: PRIVÉ PASSPORT
   - Headline: "Welcome to *the network.*"
   - One-line confirmation: "$595/year. Cancel anytime."

2. **TIER SELECTION** (if multiple tiers retained)
   - Standard / Partner / Full Access
   - Selected tier highlighted

3. **CHECKOUT FORM**
   - Email, payment, billing — standard checkout fields
   - Stripe or whatever payment processor is wired

4. **POST-PURCHASE** — Confirmation page
   - Eyebrow: WELCOME, [FIRST NAME]
   - Headline: "Your Passport is *ready.*"
   - Next steps: link to platform login, link to help, link to first-time exploration

This page does not need worldview content. The user has converted; deliver the product.

---

## Component Library

For Claude Code to reference:

**Primitives (likely already exist or need to be extracted from platform):**
- `<Eyebrow />` — small Jost medium tracked caps in gold
- `<EditorialHeadline />` — Cormorant Garamond with italic-accent on second clause prop
- `<EditorialParagraph />` — Cormorant Garamond serif at 16-20px with line-height 1.6
- `<HairlineRule />` — 60px gold line, centered or left-aligned variants
- `<HeroCarousel />` — full-bleed cinematic image carousel, configurable slides via data object, 6-7s auto-advance, slow crossfade transitions only, hairline gold dots bottom-center, pause on hover/touch
- `<DestinationCard />` — region + property name + region descriptor + benefit pills
- `<RetreatRow />` — full-width editorial row for the retreats list pattern: image left, content middle (location eyebrow + serif headline with italic accent + region italic + paragraph + 4 outlined pills + colored-dot status), DETAILS button right
- `<StatusIndicator />` — colored dot + tracked caps text, three states: SPACES AVAILABLE (green), LIMITED — WAITLIST FORMING (gold), COMING SOON (eyebrow color)
- `<FeaturedDestination />` — full-width image left, content right pattern (Don Carlos style)
- `<PropertyDrawer />` — right-side drawer triggered by destination card click, with hero image + region eyebrow + serif headline + region italic + 2-paragraph description + member benefits list + "View on Platform" CTA + close button

**Page-level shells:**
- `<EditorialPageShell />` — cream/navy alternating sections with consistent spacing
- `<NavBar />` — five-item top nav (Privé Passport · Privé Montauk · Privé Miami · About Privé), no dropdowns, mobile drawer
- `<Footer />` — five-column architecture-mirroring footer

If any of these don't exist in the codebase, extract them from the platform code. The platform's components are the brand made operational. Don't rebuild them; share them.

---

## Photography Direction

The current public site uses a mix of stock-feeling shots and platform-quality imagery. The rebuild needs photographic discipline.

**Three categories of imagery:**

1. **Destination photography** — high-resolution, place-led, never showing identifiable people. Same standard as the platform's destination cards. Primary use: hero images, featured destination sections, collection cards.

2. **Atmospheric photography** — silhouettes, golden-hour scenes, place-without-product shots. Used for worldview moments, the about page, manifesto sections. The silhouette-walking-to-court image we built earlier as a campaign asset is the prototype for this category.

3. **Venue photography** — actual courts, actual venues at Montauk and Miami. These are the only places real venues should appear. Should be commissioned rather than sourced where possible.

Avoid: generic luxury hotel shots, lifestyle stock, anything with branded apparel or recognizable celebrities.

---

## Implementation Phases

This work proceeds in three phases. Each phase has a clear set of deliverables and gating criteria. Phase 2 does not begin until Phase 1 is approved; Phase 3 does not begin until Phase 2 is approved.

**Phase 1 — Foundation**
- Set up the new sitemap and routes
- Build the component primitives (Eyebrow, EditorialHeadline, DestinationCard, retreat-row component, etc.)
- Build the new homepage (with the architecture diagram section)
- Build the new /passport hub page
- Migrate Montauk and Miami pages to new structure
- Update nav and footer site-wide
- Decommission old templates: archive index_old.html, membership_old.html, etc. (preserve in archive)
- Gating: homepage, passport hub, montauk, miami, about, nav, footer all present and approved before Phase 2 begins

**Phase 2 — Passport sub-pages**
- Build /passport/destinations (with property modal/drawer pattern)
- Build /passport/experiences (with editorial-list retreat pattern)
- Build /passport/club-partners (with regional partner grid)
- Wire destination data and retreat status indicators
- Gating: all three sub-pages present, voice-register-checked, mobile-QA'd before Phase 3 begins

**Phase 3 — Polish and content**
- Photography integration (commissioned or curated where placeholders exist)
- Content copy review pass — single voice register check across every page
- Performance and SEO audit
- Mobile QA across all surfaces
- Launch the new site, decommission patched site
- Gating: site is launch-ready when this phase is approved

---

## What to Tell Claude Code

The Claude Code prompt for this work should reference this document directly and frame the rebuild as a structural project, not a series of tactical fixes. Specifically:

> Read `docs/website/overhaul-plan.md` in full before any code changes. This document defines the new sitemap, page structures, voice registers, and component patterns for the public website rebuild. The existing public site will be preserved in an `archived/` directory; the rebuild starts from a clean slate using platform components as the visual foundation. Do not amend the existing pages — replace them.
>
> Build in the sequencing described in the document (Foundation, Passport sub-pages, Polish). Within each phase, propose the order of pages and components to build, with file paths. I will approve before any code is written.
>
> Voice and copy: do not write final copy unilaterally. Propose copy in markdown for review before writing into the codebase. The brand voice is the most fragile element of this work.
>
> Photography: do not source new images unilaterally. If a section needs imagery and none is provided, leave a placeholder with a comment indicating what kind of image belongs there. Photography decisions go through me.
>
> If anything in this plan conflicts with the brand standards in `docs/brand/phase-two.md` or with patterns established in the Privé Passport platform, flag it before proceeding. Do not make brand or architectural decisions unilaterally.

---

## Decisions Locked In

These have been answered and should not be re-debated during implementation:

1. **Property detail pages:** Not in scope. Replaced by a side-drawer/modal pattern that opens when a destination card is clicked. The drawer shows hero image, region eyebrow, property name, two-paragraph description, member benefits, and a "View on Platform" link.
2. **/join checkout:** Self-contained Stripe checkout that creates a member record. No handoff to platform for payment.
3. **Venue booking:** Montauk and Miami pages use outbound buttons to Playtomic. Button copy: "Reserve at Playtomic" — sets expectation user is leaving the site. No embedded booking widgets at this stage.
4. **Brand architecture diagram:** Yes, on the homepage as section 2. Editorial visual treatment, not org chart. If implementation drifts toward Excel-chart aesthetic, revert to a four-card grid.
5. **Top nav labels:** Privé Passport · Privé Montauk · Privé Miami · About Privé · [Get Your Passport CTA]. The "Privé" prefix on each item is intentional — it ladders every link to the master brand.
6. **Collections preview:** NOT included on homepage or Passport hub. The homepage shows a single Featured Destination plus the editorial-list retreat pattern. The Passport Destinations sub-page shows a Featured Destinations grid plus the full network list. Collections framing is a platform feature, not a public-site feature.
7. **Date strings on retreats:** Not used. Status framing replaces dates ("SPACES AVAILABLE", "LIMITED — WAITLIST FORMING", "COMING SOON"). Specific dates appear inside the drawer/details view if needed, never as the primary label. This decision was made to keep the design from aging as retreats fill or move.
8. **Homepage hero is a campaign-driven carousel, not an evergreen statement.** Four slides for the launch window (Introducing Privé Passport · Padel Destinations · Padel Experiences · Privé Miami Now Open). The carousel rotates as a unit roughly every 6 weeks or longer based on what's true about the brand at that moment — new campaigns, venue openings, seasonal experiences, founding-member windows. Build the carousel as a configurable component fed by a data object so future campaigns can be deployed by editing one config file. The hero is treated as a campaign canvas, not a permanent asset.
