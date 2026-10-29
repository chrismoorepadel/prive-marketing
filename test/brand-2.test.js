// Brand 2.0 contract.
//
// Source-level assertions for the naming system in
// docs/brand/brand-2.0-website-brief.md. They exist so a later edit can't
// quietly bring back the old nav, split the app CTAs across two URLs, or
// paraphrase the one sentence that defines the Passport.

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
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

/* ── the homepage hands out the app; it doesn't sell the Passport ── */

test('homepage shows no price and links to no checkout', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /\$\d{3}/);
  assert.doesNotMatch(html, /href="\/?join\.html/);
  assert.doesNotMatch(html, /class="passport-pricing"|id="privePopup"/);
});

test('homepage closing CTA is "Get the app"', () => {
  const closing = read('index.html').match(/<section class="closing-cta">[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(closing, /<a [^>]*data-app-link[^>]*>Get the app<\/a>/);
});

test('hero leads with the app, then Miami', () => {
  const slides = read('data/hero-slides.js');
  assert.match(slides, /primaryLabel:\s+'Get the app',\s+primaryHref:\s+'app'/);
  assert.match(slides, /secondaryLabel:\s+'Book Miami',\s+secondaryHref:\s+'https:\/\/playtomic\.com\//);
  assert.match(slides, /eyebrow: '40\+ destinations · Montauk · Miami · Turks and Caicos'/);
});

/* ── /passport is the upgrade page ── */

test('/passport opens with the definition line', () => {
  const hero = read('passport.html').match(/<section class="club-hero">[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(hero.includes(`>${DEF}</p>`), 'definition line missing from the hero');
});

test('/passport presents both tiers, differing on one axis only', () => {
  const tiers = read('passport.html').match(/<section class="tiers-sec"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(tiers, /Standard[\s\S]*\$595[\s\S]*four visits a month/);
  assert.match(tiers, /Full Access[\s\S]*\$995[\s\S]*unlimited visits/);
  assert.match(tiers, /href="\/join\.html\?tier=standard"/);
  assert.match(tiers, /href="\/join\.html\?tier=full"/);
});

test('/passport carries one worked example', () => {
  // Figures are Chris's to supply; until then they stay as bracketed placeholders.
  assert.match(read('passport.html'), /<p class="worked-line">A week at [^<]+: public rate [^<]+, member rate [^<]+\.<\/p>/);
  assert.match(read('passport.html'), /The Passport pays for itself in one trip\./);
});

/* ── property pages (scripts/build-destinations.js) ── */

const sandbox = { window: {} };
vm.runInNewContext(read('data/destinations.js'), sandbox);
const DESTINATIONS = sandbox.window.DESTINATIONS;

test('one property page per destination, and nothing else in destinations/', () => {
  const files = readdirSync(new URL('../destinations/', import.meta.url)).filter(f => f.endsWith('.html')).sort();
  assert.deepEqual(files, Array.from(DESTINATIONS, d => `${d.id}.html`).sort());
});

for (const d of DESTINATIONS) {
  test(`destinations/${d.id}: title, JSON-LD, app CTA, and no rates`, () => {
    const html = read(`destinations/${d.id}.html`);
    const esc = s => s.replace(/&/g, '&amp;');
    assert.ok(html.includes(`<title>Padel at ${esc(d.name)} · Privé Padel</title>`));
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)[1]);
    assert.equal(ld['@type'], 'LodgingBusiness');
    assert.equal(ld.name, d.name);
    assert.ok(ld.address.addressLocality);
    assert.match(html, new RegExp(`<a class="btn-primary prop-rate" href="${APP_URL}" data-app-link>Member rate in the app</a>`));
    const body = html.slice(html.indexOf('<section class="prop-hero">'), html.indexOf('<footer>'));
    assert.doesNotMatch(body, /\$\s?\d|\d+\s?%\s?off/i, 'a public property page must not show a rate');
  });
}

test('every property page is in the sitemap and linked from the destinations grid', () => {
  const sitemap = read('sitemap.xml');
  for (const d of DESTINATIONS) assert.ok(sitemap.includes(`<loc>https://prive-padel.com/destinations/${d.id}</loc>`), d.id);
  assert.match(read('passport/destinations.html'), /card\.href = '\/destinations\/' \+ d\.id \+ '\.html';/);
});
