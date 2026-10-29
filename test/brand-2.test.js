// Brand 2.0 contract.
//
// Source-level assertions for the naming system in
// docs/brand/brand-2.0-website-brief.md. They exist so a later edit can't
// quietly bring back the old nav, split the app CTAs across two URLs, or
// paraphrase the one sentence that defines the Passport.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');

const PAGES = ['index.html', 'passport.html', 'passport/destinations.html', 'passport/experiences.html',
  'passport/club-partners.html', 'locations.html', 'montauk.html', 'miami.html', 'join.html',
  'about.html', 'contact.html', 'privacy.html', 'terms.html',
  'experiences/court-and-cellar.html', 'experiences/nihi-sumba.html', 'experiences/voaara-madagascar.html'];

const DEF = 'Passport is the Privé Padel membership: member rates and benefits at 40+ padel destinations, ' +
  'partner clubs, and our own courts in Montauk and Miami.';

const APP_URL = read('js/main.js').match(/window\.APP_URL = '([^']+)'/)?.[1];

test('APP_URL is defined once, in js/main.js', () => {
  assert.ok(APP_URL, 'window.APP_URL is missing from js/main.js');
});

for (const page of PAGES) {
  const html = read(page);

  test(`${page}: nav reads Destinations · Passport · Clubs · About`, () => {
    const ul = html.match(/<ul class="nav-links">([\s\S]*?)<\/ul>/)?.[1];
    assert.ok(ul, 'no nav-links list');
    const labels = [...ul.matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map(m => m[1].trim());
    assert.deepEqual(labels, ['Destinations', 'Passport', 'Clubs', 'About']);
  });

  test(`${page}: every app CTA points at APP_URL`, () => {
    const links = [...html.matchAll(/<a [^>]*data-app-link[^>]*>/g)].map(m => m[0]);
    assert.ok(links.length >= 2, 'nav and mobile menu should both carry the app CTA');
    for (const a of links) assert.equal(a.match(/href="([^"]*)"/)?.[1], APP_URL, a);
  });

  test(`${page}: the nav never says "Privé Passport"`, () => {
    const nav = html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';
    const menu = html.match(/<div class="mobile-menu"[\s\S]*?<div class="mobile-nav">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';
    assert.doesNotMatch(nav + menu, /Privé Passport/);
  });

  test(`${page}: the definition line, where present, is verbatim`, () => {
    for (const m of html.matchAll(/<p class="passport-def">([^<]*)<\/p>/g)) assert.equal(m[1], DEF);
  });
}
