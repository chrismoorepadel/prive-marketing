# Quatre landing page

## Purpose and scope

`/quatre` positions Quatre Padel Courts as a full-service court design, manufacturing and installation company for luxury hospitality, private estates, clubs, developments and the professionals representing them. It leads with the official builder relationship to Privé Padel and selected Quatre projects: Montauk Yacht Club, THēsis Hotel Miami and Safe Harbor St. Kitts.

Four service groups cover project planning and specification, court design and manufacturing, site preparation and installation, and operational consulting. The inquiry form accepts a complete court project, any of those four services, or help defining the project. Early-stage paid consulting has a scope and upfront fee agreed before work begins. Buyers may request a complete project or court proposal directly; submitting the form is not a paid engagement.

The customer-facing copy uses a company/team identity. The delivery and mailto destination is `chris@quatrepadelcourts.com`, a verified alias delivering into the existing business Gmail inbox, with a generic visible contact label. The header and footer use the supplied Quatre Padel Courts logo.

## Design and acquisition journey

Quatre has a separate visual identity from the Privé marketing site, guided by its supplied logo: forest green (`#132924`), gold (`#D4A72A`) and warm ivory. Upright Newsreader serif headings and Manrope body/UI text give the page a restrained hospitality presentation. Second lines use a color accent without italics. The hero uses sentence case, lighter type and a small manufacturing/building positioning line; buttons remain clear and do not jump on hover. The original transparent Quatre logo appears on light header and footer surfaces with its complete lockup and aspect ratio preserved. Thin gold corner details on the inquiry and project photography echo the logo's frame. Primary buttons use white text on forest green; light gold highlights are reserved for the dark hero, and small gold-toned text on light backgrounds uses a darker shade for legibility. Its stylesheet and script are scoped to this page and do not import the Privé site styles. No new software service or package dependency is introduced.

Logo source supplied by the business owner:

- `https://res.cloudinary.com/dfjqa5f05/image/upload/v1792454639/Quatre_Padel_Courts_logo_in_forest_green_dlzphv.png`

The logo is a 1922 × 818 transparent PNG. The page uses a Cloudinary format/quality variant at 480px width for both placements. It is not cropped, recolored or recreated; explicit dimensions reserve its space. Logo widths adapt to the existing desktop and mobile header sizes.

The page order is an image-led hero with a two-step inquiry, an early Privé relationship and social-proof section, selected Quatre project photographs, the complete service offering, property-specific entry points, practical project FAQs, and a final proposal CTA. The Privé section appears directly after the hero and is linked from the main navigation. It replaces the later dark credential section and the redundant capability strip. The copy describes the services and project process directly, replacing generic slogans. The hero leads with “Padel courts for exceptional properties,” welcoming private-home, hotel and club projects. The supporting copy names each audience explicitly. Form IDs, field names and values, validation attributes, endpoint and prefill data attributes remain unchanged. The core action is to discuss a project and request a proposal. Property/service links prefill the same inquiry; architect/builder links select client representation. A mobile proposal CTA appears while the inquiry is offscreen and hides when the inquiry is visible or has succeeded. It leaves bottom space at the footer and respects the device safe area.

The user supplied these three project image sources for this redesign:

- Miami: `https://res.cloudinary.com/dfjqa5f05/image/upload/v1792452686/miami_court_ftbrn9.png`
- Montauk: `https://res.cloudinary.com/dfjqa5f05/image/upload/v1792452687/montuak_ci50lv.png`
- St. Kitts: `https://res.cloudinary.com/dfjqa5f05/image/upload/v1792452254/St_Kitts_3_fduyzh.png`

The page references those assets through Cloudinary format/quality/width variants with responsive source sets. The Miami hero has loading priority; the three project images load lazily. Source artwork is not altered. Image dimensions reserve layout space. Manrope and Newsreader come from Google Fonts, with system sans-serif and serif fallbacks. Newsreader is used at weight 400 in its normal style with optical sizing; the italic face is no longer requested.

## Social-proof assets

The early Privé section uses its actual dark logo and the exact seven press assets already referenced by the site's root `index.html`: WWD, Condé Nast Traveler, Travel + Leisure, goop, Haute Living, Observer and Modern Luxury Hamptons. The press row is explicitly headed **Privé Padel, as seen in**. The homepage provides no coverage links for these logo images, so the row retains its existing non-linked presentation.

- Privé logo: `https://res.cloudinary.com/dfjqa5f05/image/upload/q_auto,f_auto/v1773187743/logo_dark_drvkxb.png`
- The Leading Hotels of the World: `https://www.lhw.com/Assets/d/images/global/logo-print.svg`, the standalone original vector referenced by its official homepage.
- The World's 50 Best Hotels: `https://www.the50.com/stories/filestore/W50BH-launch-incopy-2.png`, the original year-free black/gold artwork in the organizer's [brand-launch article](https://www.the50.com/stories/News/the-worlds-50-best-hotels-launching-2023.html).

The Privé section has one main heading beside a compact Privé logo. A plain statement explains the shared parent company and attributes the Astria endorsement to Privé Padel. Beneath it, one network statement gives the 45+ hotel figure and visibly qualifies the LHW membership and 50 Best recognition before the two marks. The large statistic, separate logo captions and internal dividing rules have been removed. A single rule introduces the press strip. On mobile, the logo, narrative and hotel marks stack in that reading order. The supplied Privé asset has large transparent margins, and the 50 Best asset has white margins. CSS accounts for that whitespace while keeping the complete artwork and original aspect ratios visible. The 50 Best image uses multiply blending on ivory to integrate its white background. All social-proof images have descriptive alt text, explicit intrinsic dimensions and lazy loading. No logo was recreated or AI-generated.

## Brand relationships and claim scope

Privé Hospitality Corp owns Quatre Padel Courts and Privé Padel. Quatre is the official court builder for Privé Padel locations. Company ownership, project attribution, manufacturing capability and the 45+ hotel partnership figure were supplied by the business owner for this revision.

The 45+ figure is explicitly labeled as Privé Padel's hotel partnership network. It is not an installation count or a claim that Privé operates every partner hotel's courts. Recognition by The World's 50 Best Hotels and membership of The Leading Hotels of the World describe hotels within that network.

The Astria credential is attributed to Privé Padel. Astria's public account carries the endorsement announcement, its supplier collection directly lists Privé Padel Court Building, and Forbes Travel Guide describes Astria as its preferred vendor platform. The page does not assert a Quatre Star Rating, an exclusive category appointment or an Official Brand designation. Press logos describe Privé coverage; LHW and 50 Best logos describe recognition of hotels within its network. They are not presented as Quatre memberships, awards, direct endorsement or a count of Quatre installations.

Brand references:

- [Astria's Privé Padel Court Building listing](https://www.discoverastria.com/product/prive-padel-court-building/)
- [Astria's public endorsement announcement](https://www.linkedin.com/company/discover-astria)
- [Forbes Travel Guide's description of Astria](https://www.forbestravelguide.com/forbes-travel-guide-brands)

The page has its own stylesheet and script, with no change to the Passport application or checkout flows and no new npm dependencies.

## Inquiry flow

`quatre.html` → `js/quatre.js` → `POST /api/quatre-inquiry` → existing Resend account → team notification to `chris@quatrepadelcourts.com` → an on-page confirmation.

The direct contact links, no-JavaScript fallback and API delivery-error messages use the same Quatre address. The alias was verified in Gmail on 2026-10-20 and receives mail in the existing `chris@prive-padel.com` inbox. Changing the destination does not change the Resend sender or require another mailbox.

The visitor's address is the notification's reply-to address. The endpoint sends one notification to the fixed team address. It does not send a visitor confirmation, subscribe the visitor to marketing, or create a CRM record.

Required fields: full name, email, project location, project type, and support requested. Optional fields: representing a client, company/role, phone, and project details. The form captures UTM source, medium, campaign, content and term, plus the landing pathname and referrer hostname. It does not store visitor details in browser storage or transmit them to an analytics service.

Step 1 asks for property type, location and service (default: complete court project). Step 2 asks for the visitor's contact details, with optional phone, project details and client representation. Continue and Enter on step 1 only advance the form; no inquiry is sent until a valid final submission. Each step is validated explicitly so hidden required controls cannot block the first step or fail silently. Back retains entered details, and any invalid required field is brought into view. The form appears only after its script initializes; visitors without JavaScript receive a direct team email link.

Success is shown only when Resend accepts the notification and returns an email ID. Acceptance is not proof of inbox delivery. Failures preserve the form and present an email fallback. The client retains the same inquiry ID and serialized payload for a retry in the same page session; changing the details creates a new inquiry. Resend's idempotency window is 24 hours. A page reload starts a new session.

## Runtime configuration

- `RESEND_API_KEY`: required. Vercel metadata showed this configured for Preview and Production on 2026-10-19. No secret value was retrieved.
- `RESEND_FROM`: optional; the fallback is `Quatre Padel Courts <inquiries@privepassport.com>`, using the address already referenced by this site's other inquiry routes. Confirm that this sender remains verified in Resend before launch.
- Vercel's `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `VERCEL_PROJECT_PRODUCTION_URL` allow the current deployment's exact origins. The production Privé domains are also allowed. Do not add a wildcard for all `vercel.app` domains.

Same-origin JSON submission, strict field validation, size limits, a honeypot, output escaping, and idempotent notification retries provide basic protection. They are not a distributed rate limiter or proof that a submission is human. Monitor actual inquiry volume and the existing email service quota; no new paid spam or automation service is provisioned by this change.

## Domain configuration

The two hostname-specific rules in `vercel.json` redirect the Quatre apex and www domains to `https://www.prive-padel.com/quatre`. They are temporary redirects for initial validation and do not match the Privé hostname. They only take effect for Quatre traffic after the domains are assigned to the project and their DNS reaches Vercel.

On 2026-10-19, Vercel reported the Quatre apex's nameservers as `ns67.domaincontrol.com` and `ns68.domaincontrol.com`, with existing A records `3.33.130.190` and `15.197.148.33`. The domain was not configured for this project. No DNS record was changed during that preflight.

On 2026-10-20, PR #1 was published through the existing `prive-padel` project at main commit `140c86c4e7b9e1a3300bad0e4b2a9ba705ca8932`. Both Quatre domains were assigned and verified in Vercel. The owner updated the authoritative DNS to the Vercel A/CNAME targets. The design/copy revision does not alter those domain settings or the inquiry delivery route.

The full public redirect journey and actual inbox delivery still need an end-to-end confirmation. Automated public requests were denied by Vercel, and no live inquiry was sent. A mocked form test does not establish production deliverability.

## Validation

`node --test test/quatre-inquiry.test.js` exercises the real handler with mocked email transport. It covers successful acceptance, invalid fields and JSON, origin restrictions, field lengths, header/HTML injection, honeypot handling, missing configuration, uncertain provider responses, provider throttling and duplicate retry behavior. `npm test` also runs the repository's existing measurement contract checks.

Browser verification should cover desktop and mobile layouts, the supplied images and new fonts, keyboard access, both inquiry steps, Back and Enter behavior, hidden-field validation, service/project preselection, the client representative field, pending duplicate suppression, submission success and failure, stable request IDs on retries, and mobile CTA visibility. For the earlier hospitality design refinement, local checks at 320, 375, 768, 1024 and 1440px confirmed the fonts, no horizontal overflow or header overlap, and no missing resources or page errors. For the copy and credentials revision, source comparison confirms all IDs, form controls, option values, validation attributes and prefill data remain compatible; `js/quatre.js` and `api/quatre-inquiry.js` are byte-for-byte unchanged. The revised page passed local browser checks at 320, 375, 768, 1024 and 1440px: both headline spans are upright, Newsreader and Manrope load, all images decode, and there is no horizontal overflow or page error. Desktop and mobile screenshots were reviewed for the Privé logo, network statement, complete hotel marks and press wrapping. The two-step form, Back, retained details, property/service prefills, client field and mocked failure-to-success retry also passed. No live email was sent. All local email requests must remain mocked. The visual checks alone do not establish conversion performance; assess that using real campaign inquiries after launch.

External references:

- [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel static routing configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
