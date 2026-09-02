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
