// Measurement contract.
//
// These are source-level assertions, not behavioural tests — they exist to stop
// a refactor silently breaking the money path or the running experiment. Two
// invariants matter most:
//
//   1. v2 (control) and v2b (variant) differ ONLY in the checkout step, so the
//      A/B result stays readable.
//   2. Stripe → Passport → Klaviyo keeps one owner for each event.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

const checkout  = read('api/checkout.js');
const subscribe = read('api/subscribe.js');
const webhook   = read('api/webhook.js');
const offerV2   = read('passport-offer-v2.html');
const offerV2b  = read('passport-offer-v2b.html');

/* ── the flow that must not move ─────────────────────────── */

test('checkout still hands off to the Passport welcome page', () => {
  assert.match(checkout, /success_url:\s+`https:\/\/passport\.prive-padel\.com\/welcome\?session_id=\{CHECKOUT_SESSION_ID\}`/);
});

test('Started Checkout has exactly one owner, and it is subscribe.js', () => {
  assert.match(subscribe, /attributes: \{ name: 'Started Checkout' \}/);
  assert.doesNotMatch(checkout, /Started Checkout/);
});

test('Placed Order stays in the webhook and keeps its dedup id', () => {
  assert.match(webhook, /attributes: \{ name: 'Placed Order' \}/);
  assert.match(webhook, /unique_id: session\.id/);
});

test('Meta CAPI Purchase still deduplicates on the Stripe session id', () => {
  assert.match(webhook, /event_id:\s+session\.id/);
});

/* ── experiment isolation ────────────────────────────────── */

test('v2b differs from v2 only by removing the details step', () => {
  // the variable under test
  assert.match(offerV2,  /id="fEmail"/);
  assert.doesNotMatch(offerV2b, /id="fEmail"/);
  // everything else that would confound the result
  const sections = s => (s.match(/<section/g) || []).length;
  assert.equal(sections(offerV2), sections(offerV2b), 'section count must match');
  const faq = s => (s.match(/lp-faq-item/g) || []).length;
  assert.equal(faq(offerV2), faq(offerV2b), 'FAQ item count must match');
});

test('both arms fire the one funnel event they share', () => {
  for (const [name, page] of [['v2', offerV2], ['v2b', offerV2b]]) {
    assert.match(page, /gtag\('event', 'begin_checkout'/, `${name} begin_checkout`);
    assert.match(page, /fbq\('track', 'InitiateCheckout'/, `${name} InitiateCheckout`);
  }
});

test('only the control captures a lead — the variant cannot', () => {
  // Match the calls, not the word: v2b's source comments explain the absence.
  assert.match(offerV2, /gtag\('event', 'generate_lead'/);
  assert.doesNotMatch(offerV2b, /gtag\('event', 'generate_lead'/);
  assert.match(offerV2, /fetch\('\/api\/subscribe'/);
  assert.doesNotMatch(offerV2b, /fetch\('\/api\/subscribe'/);
});

/* ── the hardening kept from the proposed patch ──────────── */

test('checkout rejects malformed input before reaching Stripe', () => {
  assert.match(checkout, /ALLOWED_TIERS\.has\(tier\)/);
  assert.match(checkout, /typeof addPartner !== 'boolean'/);
  assert.match(checkout, /Checkout price not configured/);
});

test('a double-click cannot open two Stripe sessions', () => {
  assert.match(checkout, /idempotencyKey/);
});

test('attribution reaches Stripe metadata with legacy fallbacks', () => {
  assert.match(checkout, /normalizedAttribution/);
  assert.match(checkout, /landing_page: \(attribution && attribution\.landing_page\) \|\| eventSourceUrl/);
});

test('revenue analytics require a paid, positive-value checkout', () => {
  assert.match(webhook, /session\.payment_status === 'paid' && value > 0/);
  assert.match(webhook, /sendAnalytics && isRevenuePurchase/);
});

test('analytics failures are surfaced rather than swallowed', () => {
  assert.match(webhook, /if \(!response\.ok\) throw new Error/);
});

test('GA4 prefers the browser client id when one was captured', () => {
  assert.match(webhook, /session\.metadata\?\.ga_client_id \|\| session\.customer \|\| session\.id/);
  assert.match(webhook, /transaction_id: session\.id/);
});

/* ── application funnel · acceptance tests (spec §11) ────── */

const apply    = read('passport-apply.html');
const invite   = read('passport-apply/complete.html');
const applyApi = read('api/application.js');

test('§11.1 the application feature does not touch v2 or v2b', () => {
  // the funnel must not reference or reuse the experiment's markup
  assert.doesNotMatch(apply,  /passport-offer-v2/);
  assert.doesNotMatch(invite, /passport-offer-v2/);
  // and the experiment must not know the funnel exists
  assert.doesNotMatch(offerV2,  /passport-apply/);
  assert.doesNotMatch(offerV2b, /passport-apply/);
});

test('§11.3 the application id is generated once and reused for retries', () => {
  assert.match(apply, /state\.applicationId/);
  assert.match(applyApi, /unique_id: `\$\{applicationId\}:\$\{stage\}`/);
});

test('§11.4 input is allowlisted and length-limited', () => {
  assert.match(applyApi, /INTERESTS\s*=\s*new Set/);
  assert.match(applyApi, /TIMINGS\s*=\s*new Set/);
  assert.match(applyApi, /clean\(b\.notes, 1000\)/);
  assert.match(applyApi, /clean\(b\.email, 320\)/);
});

test('§11.5 marketing consent is optional and recorded separately', () => {
  assert.match(applyApi, /passport_marketing_consent/);
  // never required to submit
  assert.doesNotMatch(applyApi, /marketingConsent[^;]*return res\.status\(400\)/);
  // the checkbox ships unchecked
  assert.match(apply, /id="marketingConsent"(?![^>]*checked)/);
});

test('§11.6 no PII reaches analytics or the URL', () => {
  // the redirect carries an id and a segment label only
  assert.match(apply, /'\/passport-apply\/complete\?' \+ q/);
  assert.match(apply, /id=' \+ encodeURIComponent\(applicationId\(\)\)/);
  assert.doesNotMatch(apply, /encodeURIComponent\(state\.email\)/);
  // server logs carry the application id, never the applicant
  assert.match(applyApi, /console\.error\('Application profile write failed', \{\s*\n?\s*applicationId/);
});

test('§11.8 activation uses the existing checkout path', () => {
  assert.match(invite, /fetch\('\/api\/checkout'/);
  assert.doesNotMatch(invite, /stripe\.checkout\.sessions\.create/);
});

test('§11.9 checkout still returns to Passport onboarding', () => {
  // guarded by the existing success_url test; assert the invitation adds no other
  assert.doesNotMatch(invite, /success_url/);
});

test('§11.14 the page survives analytics being unavailable', () => {
  assert.match(apply, /if \(window\.gtag\)/);
  assert.match(apply, /if \(window\.fbq\)/);
  assert.match(apply, /try \{ if \(window\.clarity\)/);
  assert.match(invite, /if \(window\.gtag\)/);
});

test('the application is written before the optional marketing subscription', () => {
  const profileAt = applyApi.indexOf('profile-import/');
  const eventAt   = applyApi.indexOf("klaviyo('events/'");
  const subAt     = applyApi.indexOf('profile-subscription-bulk-create-jobs/');
  assert.ok(profileAt < eventAt, 'profile must precede the event');
  assert.ok(eventAt < subAt, 'event must precede the marketing subscription');
});

/* ── application notifications ───────────────────────────── */

test('a submitted application reaches a human inbox', () => {
  assert.match(applyApi, /api\.resend\.com\/emails/);
  assert.match(applyApi, /to: \[TEAM\]/);
  assert.match(applyApi, /reply_to: email/);
});

test('the applicant is confirmed regardless of marketing consent', () => {
  // the confirmation is operational, so it must not sit behind the opt-in
  const mailAt = applyApi.indexOf('await Promise.allSettled');
  const subAt  = applyApi.indexOf('if (marketingConsent && marketingList)');
  assert.ok(mailAt < subAt, 'confirmation must not depend on the consent branch');
  assert.match(applyApi, /We received your Privé Passport application/);
});

test('mail is awaited, not fired and forgotten', () => {
  // an unawaited send can be frozen the moment the response returns
  assert.match(applyApi, /const \[notify, confirm\] = await Promise\.allSettled/);
});

test('a mail failure cannot cost an application', () => {
  // both sends run after the Klaviyo writes and neither returns non-2xx
  const eventAt = applyApi.indexOf("klaviyo('events/'");
  const mailAt  = applyApi.indexOf('await Promise.allSettled');
  assert.ok(eventAt < mailAt, 'email must follow the durable write');
  assert.match(applyApi, /console\.error\('Application notification failed'/);
  assert.doesNotMatch(
    applyApi.slice(mailAt),
    /return res\.status\(5\d\d\)/,
    'a Resend failure must not fail the request',
  );
});

test('a retry cannot send either email twice', () => {
  assert.match(applyApi, /'Idempotency-Key'/);
  assert.match(applyApi, /`application-\$\{applicationId\}-team`/);
  assert.match(applyApi, /`application-\$\{applicationId\}-applicant`/);
});

test('only a completed application notifies anyone', () => {
  assert.match(applyApi, /if \(stage === 'submitted' && REVIEW_LED\.has\(variant\) && process\.env\.RESEND_API_KEY\)/);
  // a partial ('started') application must never mail anyone
  assert.doesNotMatch(applyApi, /stage === 'started'[^\n]*sendEmail/);
});

test('applicant text is escaped into the email, and the subject is stripped', () => {
  assert.match(applyApi, /const esc = v =>[\s\S]{0,80}replace\(\/\[&<>"\]\/g/);
  assert.match(applyApi, /const subj = \(v, max/);
  assert.match(applyApi, /\$\{subj\(firstName, 32\)\}/);
});

test('the confirmation email sells nothing', () => {
  const start = applyApi.indexOf('function confirmationHtml');
  const body  = applyApi.slice(start, applyApi.indexOf('\n}', start));
  for (const banned of ['checkout', 'Stripe', '$595', 'Activate']) {
    assert.ok(!body.includes(banned), `confirmation must not mention ${banned}`);
  }
});

test('the live self-serve funnel is left exactly as it was', () => {
  // application_v1 ends at Stripe activation; a "we'll reply today" mail
  // there would contradict its own completion page
  assert.match(applyApi, /REVIEW_LED = new Set\(\['travel_desk_v2'\]\)/);
  assert.match(applyApi, /stage === 'submitted' && REVIEW_LED\.has\(variant\)/);
});
