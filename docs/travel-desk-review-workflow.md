# Travel Desk — manual review workflow and applicant communications

Companion to `passport-travel-desk.html`. Nothing here is built yet: the
revision brief says not to change production code without approval, so this
is the design for §7–§9 for you to sign off before anything is wired.

The page itself is finished and ends at a pending-review state. It never
calls `/api/checkout`. Stripe only ever begins from the invitation email
below.

---

## 1. Application states

| State | Set by | Means |
|---|---|---|
| `pending_review` | the server, on submit | waiting for you, same day |
| `conversation_started` | you | you have replied and are talking |
| `invited` | you | invitation sent, activation link live |
| `joined` | the Stripe webhook | membership paid and active |
| `not_now` | you | closed for now, no invitation |

Stored on the Klaviyo profile as `passport_application_state`, alongside
the `passport_application_id` already written today. One profile property,
five values — no new system.

## 2. What happens on submit

`api/application.js` runs in this order today, and the order matters
because the marketing subscription is the only step allowed to fail:

1. `profile-import` — upsert the applicant
2. `events/` — `Passport Application Submitted`, deduplicated on
   `${applicationId}:${stage}`
3. marketing subscription — last, and non-fatal

The revision adds two steps, both after (2) and both non-fatal:

4. **set `passport_application_state = pending_review`** and
   `passport_application_submitted_at`
5. **notify you**, via Resend (already provisioned in `prive-passport`)

The applicant's confirmation email is best sent by a Klaviyo flow triggered
on `Passport Application Submitted`, not from the endpoint — that keeps the
send retryable and editable without a deploy.

Because the application id already deduplicates the event, a duplicate
submit cannot produce a second notification or a second confirmation.

## 3. Your notification

Sent immediately, to chris@prive-padel.com. Everything needed to reply is
in the body — no Klaviyo screens to cross-reference.

> **Subject:** Passport application — Chris, Miami (retreats, specific trip)

```
PASSPORT APPLICATION                     2 Sep 2026, 14:12 ET

Chris Moore
chris@prive-padel.com
Miami

Wants it for      Signature retreats
Timing            A specific trip or club visit in mind
Their note        "Marbella in March, or the Madagascar week"

Source            paid_social · meta / founding-sep · fbclid present
Landing page      /passport-travel-desk
Marketing consent Yes

Reply to this email to answer them directly.
Profile → https://www.klaviyo.com/profile/<id>
Application 5f3c…a91b
```

The subject line carries name, city, interest and timing so the inbox list
alone tells you who is waiting.

## 4. Applicant confirmation

Sent within a minute of submitting. No purchase CTA anywhere in it.

> **Subject:** We received your Privé Passport application

> Hi Chris,
>
> Thank you for applying for Privé Passport — your application is with me now.
>
> I read every application myself rather than passing them to a team, so the
> reply you get will be from me, and it will come today.
>
> I may ask about a trip you have coming up, where you play at home, or what
> you are hoping Passport does for you. If it is a good fit, I will send you
> everything you need to join.
>
> In the meantime, if there is anything you would like me to know — a
> destination you have in mind, a question about how the membership works —
> just reply to this email.
>
> Christopher
> Founder, Privé Padel

If the application arrives after hours, "today" becomes "in the morning" —
worth a send-time condition in the flow rather than a promise you have to
keep at midnight.

## 5. The invitation

Sent by you, personally, when you move the application to `invited`. The
one place a Stripe link ever appears.

> **Subject:** Your Privé Passport invitation

> Chris,
>
> Good speaking with you. Based on the Madagascar week you mentioned, I think
> Passport earns its place for you quickly — members save 20% on the
> retreats, which on that trip is $1,650 against a $595 membership, and you
> would be invited to the next one before it opens.
>
> Here is your invitation to join at the founding rate:
>
> Founding Full Access — $595 for the year, renewing annually at the same
> rate for as long as your membership stays active.
>
> [ Activate my Passport ]
>
> The link is yours alone and good for seven days. If you need longer, or you
> would rather talk it through first, just reply.
>
> Christopher

## 6. The private activation link

Never put an email address, an answer, or any customer field in the URL.

```
you mark `invited`
  → server mints a token: random 32 bytes, stored against the application id,
    single applicant, 7-day expiry, single successful use
  → the applicant opens /passport-activate?t=<token>
  → the server resolves the token, and only then calls the existing
    /api/checkout path with:
       customer_email       the address they already validated
       client_reference_id  the application id
       metadata             application id, state, and the original
                            acquisition metadata captured at apply time
  → redirect to Stripe
  → Stripe → passport.prive-padel.com/welcome, unchanged
```

Prefilling `customer_email` means Stripe does not ask again for something
they already gave you.

Duplicate clicks are already safe: `api/checkout.js` passes
`idempotencyKey: checkout_<attemptId>`, so the same token returns the same
Checkout Session rather than opening a second one. An expired or spent token
should offer a "send me a new link" reply path, not a dead end.

**Why a token rather than a raw Stripe Payment Link:** a Payment Link cannot
carry the applicant identity or the original campaign attribution, and it
cannot expire per applicant. If the link is ever forwarded, a token can be
revoked; a Payment Link cannot.

## 7. Two decisions I need from you

**Partner membership.** The prototype sent `addPartner: false`, which
silently removed an existing revenue option. It is now not sent at all,
because the page no longer touches checkout. Before the invitation flow is
built, pick one: offer the partner add-on inside the invitation, leave it
selectable on the Stripe page, or deliberately exclude it from this funnel.

**The same-day promise.** The page and both emails now commit to a reply
today. That is the strongest thing on the page and the easiest to break. It
should not go live until you are confident of holding it — including
weekends, or with the wording softened for them.

## 8. Reporting

The funnel the brief asks for maps onto what already exists:

| Stage | Source |
|---|---|
| Application view | GA4 `application_view` |
| Application started | GA4 `application_start` |
| Application submitted | GA4 `application_submit` · Klaviyo event |
| Conversation started | `passport_application_state` |
| Invitation sent | `passport_application_state` |
| Stripe checkout started | GA4 `begin_checkout`, fired on the activation page |
| Purchase | Stripe webhook, unchanged |

`begin_checkout` and Meta `InitiateCheckout` moved off the application
entirely. They now belong to the activation page, which is the first moment
an invited applicant actually starts paying.
