// ─── RETREAT BOOKING LIGHTBOX ─────────────────────────────────
// Replaces the mailto: booking links on the retreat pages. mailto:
// hands the visitor to an email client they may not have configured
// — on mobile it often does nothing at all — and the inquiry that
// results is whatever they choose to type.
//
// Opens on any [data-book] element. Retreat identity comes from
// document.body.dataset, so each page needs no JS of its own.

(function () {
  'use strict';

  var body = document.body;
  var SLUG = body.dataset.retreat;
  var NAME = body.dataset.retreatName;
  if (!SLUG || !NAME) return;

  var overlay, form, status, lastFocus;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'rb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Booking inquiry — ' + NAME);
    overlay.innerHTML =
      '<div class="rb-panel">' +
        '<button type="button" class="rb-close" aria-label="Close">&times;</button>' +
        '<p class="rb-eyebrow">Booking inquiry</p>' +
        '<h2 class="rb-title">' + NAME + '</h2>' +
        '<p class="rb-intro">Tell us when you\'d like to travel and we\'ll be in touch to confirm your place.</p>' +
        '<form class="rb-form" novalidate>' +
          '<div class="rb-row">' +
            '<label class="rb-field"><span>First name</span><input name="firstName" autocomplete="given-name" required></label>' +
            '<label class="rb-field"><span>Last name</span><input name="lastName" autocomplete="family-name" required></label>' +
          '</div>' +
          '<div class="rb-row">' +
            '<label class="rb-field"><span>Email</span><input name="email" type="email" autocomplete="email" required></label>' +
            '<label class="rb-field"><span>Phone <em>optional</em></span><input name="phone" type="tel" autocomplete="tel"></label>' +
          '</div>' +
          '<div class="rb-row">' +
            '<label class="rb-field"><span>Preferred dates</span><input name="date" placeholder="e.g. early March"></label>' +
            '<label class="rb-field"><span>Party size</span><input name="party" inputmode="numeric" placeholder="2"></label>' +
          '</div>' +
          '<label class="rb-field"><span>Anything we should know <em>optional</em></span><textarea name="message" rows="3"></textarea></label>' +
          '<p class="rb-status" role="alert" aria-live="polite"></p>' +
          '<button type="submit" class="rb-submit">Send inquiry</button>' +
          '<p class="rb-note">We\'ll reply by email. Nothing is charged now.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);

    form   = overlay.querySelector('.rb-form');
    status = overlay.querySelector('.rb-status');

    overlay.querySelector('.rb-close').addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    form.addEventListener('submit', submit);
  }

  function open(e) {
    if (e) e.preventDefault();
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.classList.add('is-open');
    document.body.classList.add('rb-locked');
    var first = form.querySelector('input');
    if (first) first.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('rb-locked');
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // Keep tabbing inside the dialog — otherwise focus walks off into the
    // page behind it, which for a screen reader means the form vanishes.
    var f = overlay.querySelectorAll('button, input, textarea');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function submit(e) {
    e.preventDefault();
    var btn = form.querySelector('.rb-submit');
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name) data[el.name] = el.value.trim();
    });

    if (!data.firstName || !data.lastName) return fail('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return fail('Please add a valid email.');

    data.retreat = SLUG;
    status.textContent = '';
    status.className = 'rb-status';
    btn.disabled = true;
    btn.textContent = 'Sending…';

    fetch('/api/retreat-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function () {
        if (window.gtag) gtag('event', 'retreat_inquiry', { retreat: SLUG });
        form.innerHTML =
          '<div class="rb-done">' +
            '<p class="rb-done-mark">✓</p>' +
            '<h3>Inquiry sent.</h3>' +
            '<p>We\'ve emailed you a confirmation. A member of the team will be in touch shortly about ' + NAME + '.</p>' +
          '</div>';
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Send inquiry';
        // A failed send must not look like a sent one — give them a route out.
        fail('Something went wrong. Please email <a href="mailto:chris@prive-padel.com">chris@prive-padel.com</a> and we\'ll pick it up.');
      });
  }

  function fail(msg) {
    status.className = 'rb-status is-error';
    status.innerHTML = msg;
    return false;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book]');
    if (t) open(e);
  });
})();
