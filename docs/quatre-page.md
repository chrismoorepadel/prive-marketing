# Quatre landing page

## Purpose and scope

`/quatre` positions Quatre Padel Courts as a full-service court design, manufacturing and installation company for luxury hospitality, private estates, clubs, developments and the professionals representing them. It leads with the official builder relationship to Privé Padel and selected Quatre projects: Montauk Yacht Club, THēsis Hotel Miami and Safe Harbor St. Kitts.

Four service groups cover project planning and specification, court design and manufacturing, site preparation and installation, and operational consulting. The inquiry form accepts a complete court project, any of those four services, or help defining the project. Early-stage paid consulting has a scope and upfront fee agreed before work begins. Buyers may request a complete project or court proposal directly; submitting the form is not a paid engagement.

The customer-facing copy uses a company/team identity. The existing business mailbox remains the delivery and mailto destination, with a generic visible contact label. Photography uses an existing Privé Cloudinary asset of the Quatre project at THēsis. The wordmark is live text.

## Brand relationships and claim scope

Privé Hospitality Corp owns Quatre Padel Courts and Privé Padel. Quatre is the official court builder for Privé Padel locations. Company ownership, project attribution, manufacturing capability and the 45+ hotel partnership figure were supplied by the business owner for this revision.

The 45+ figure is explicitly labeled as Privé Padel's hotel partnership network. It is not an installation count or a claim that Privé operates every partner hotel's courts. Recognition by The World's 50 Best Hotels and membership of The Leading Hotels of the World describe hotels within that network.

The Astria credential is attributed to Privé Padel. Astria's public account carries the endorsement announcement, its supplier collection directly lists Privé Padel Court Building, and Forbes Travel Guide describes Astria as its preferred vendor platform. The page does not assert a Quatre Star Rating, an exclusive category appointment or an Official Brand designation. External organization logos are not used.

Brand references:

- [Astria's Privé Padel Court Building listing](https://www.discoverastria.com/product/prive-padel-court-building/)
- [Astria's public endorsement announcement](https://www.linkedin.com/company/discover-astria)
- [Forbes Travel Guide's description of Astria](https://www.forbestravelguide.com/forbes-travel-guide-brands)

The page has its own stylesheet and script, with no change to the Passport application or checkout flows and no new npm dependencies.

## Inquiry flow

`quatre.html` → `js/quatre.js` → `POST /api/quatre-inquiry` → existing Resend account → team notification to `chris@prive-padel.com` → an on-page confirmation.

The visitor's address is the notification's reply-to address. The endpoint sends one notification to the fixed team address. It does not send a visitor confirmation, subscribe the visitor to marketing, or create a CRM record.

Required fields: full name, email, project location, project type, and support requested. Optional fields: representing a client, company/role, phone, and project details. The form captures UTM source, medium, campaign, content and term, plus the landing pathname and referrer hostname. It does not store visitor details in browser storage or transmit them to an analytics service.

Success is shown only when Resend accepts the notification and returns an email ID. Acceptance is not proof of inbox delivery. Failures preserve the form and present an email fallback. The client retains the same inquiry ID and serialized payload for a retry in the same page session; changing the details creates a new inquiry. Resend's idempotency window is 24 hours. A page reload starts a new session.

## Runtime configuration

- `RESEND_API_KEY`: required. Vercel metadata showed this configured for Preview and Production on 2026-10-19. No secret value was retrieved.
- `RESEND_FROM`: optional; the fallback is `Quatre Padel Courts <inquiries@privepassport.com>`, using the address already referenced by this site's other inquiry routes. Confirm that this sender remains verified in Resend before launch.
- Vercel's `VERCEL_URL`, `VERCEL_BRANCH_URL`, and `VERCEL_PROJECT_PRODUCTION_URL` allow the current deployment's exact origins. The production Privé domains are also allowed. Do not add a wildcard for all `vercel.app` domains.

Same-origin JSON submission, strict field validation, size limits, a honeypot, output escaping, and idempotent notification retries provide basic protection. They are not a distributed rate limiter or proof that a submission is human. Monitor actual inquiry volume and the existing email service quota; no new paid spam or automation service is provisioned by this change.

## Domain configuration

The two hostname-specific rules in `vercel.json` redirect the Quatre apex and www domains to `https://www.prive-padel.com/quatre`. They are temporary redirects for initial validation and do not match the Privé hostname. They only take effect for Quatre traffic after the domains are assigned to the project and their DNS reaches Vercel.

On 2026-10-19, Vercel reported the Quatre apex's nameservers as `ns67.domaincontrol.com` and `ns68.domaincontrol.com`, with existing A records `3.33.130.190` and `15.197.148.33`. The domain was not configured for this project. No DNS record was changed.

For launch:

1. Publish the reviewed change through the existing `prive-padel` Vercel project.
2. Add `quatrepadelcourts.com` and `www.quatrepadelcourts.com` to that same project, without a dashboard redirect that overrides the path-specific configuration.
3. At the authoritative DNS provider, apply the exact A/CNAME and any ownership verification records Vercel returns for those domains. The read-only preflight returned `76.76.21.21` and `cname.vercel-dns.com.` as recommendations; recheck the domain-specific instructions after assignment before using them. Preserve MX, SPF, DKIM, DMARC and unrelated records. No nameserver change is required for this approach.
4. Verify both HTTPS hostnames, their redirect destination and query-string preservation, then load `/quatre` on the production Privé hostname.
5. With authorization for a live test, submit one clearly marked test inquiry and confirm its arrival in the team inbox and the reply-to address. A mocked test does not establish production deliverability.

## Validation

`node --test test/quatre-inquiry.test.js` exercises the real handler with mocked email transport. It covers successful acceptance, invalid fields and JSON, origin restrictions, field lengths, header/HTML injection, honeypot handling, missing configuration, uncertain provider responses, provider throttling and duplicate retry behavior. `npm test` also runs the repository's existing measurement contract checks.

Browser verification should cover desktop and mobile layouts, keyboard access, service/project preselection, the client representative field, required-field blocking, submission success and failure, and stable request IDs on retries. All local email requests must remain mocked.

External references:

- [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel static routing configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)
