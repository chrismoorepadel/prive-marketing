// ─── MOBILE CAROUSEL ──────────────────────────────────────────
// Turns a stacked grid into a swipeable, looping carousel on small
// screens. Swipe past the last card and it continues into the first;
// swipe back past the first and it continues into the last.
//
// No auto-advance — it only moves when the reader moves it.
//
// Layout is CSS scroll-snap, so swiping works with no JS at all.
// This adds the wrap-around and the position dots.
//
// Applied to: .offerings-grid, .members-grid

(function () {
  'use strict';

  var BREAKPOINT = 900;

  function init(track) {
    if (!track || track.dataset.carousel === 'on') return;

    var real = Array.prototype.slice.call(track.children);
    if (real.length < 2) return;
    track.dataset.carousel = 'on';

    // ── Seamless loop via clones ────────────────────────────────
    // [last']  [1][2][3][4]  [first']
    // Resting position is item 1. Land on a clone and we silently jump
    // to its real twin, so the reader only ever sees a continuous reel.
    var head = real[real.length - 1].cloneNode(true);
    var tail = real[0].cloneNode(true);
    [head, tail].forEach(function (c, i) {
      c.dataset.clone = i === 0 ? 'head' : 'tail';
      c.setAttribute('aria-hidden', 'true');
      // keep clones out of the tab order
      Array.prototype.forEach.call(
        c.querySelectorAll('a,button,input,[tabindex]'),
        function (f) { f.setAttribute('tabindex', '-1'); }
      );
    });
    track.insertBefore(head, real[0]);
    track.appendChild(tail);

    var items = Array.prototype.slice.call(track.children);
    var FIRST = 1, LAST = items.length - 2;
    var index = FIRST;

    // Cards snap on their centre, so target the scroll position that
    // centres them. Aligning to offsetLeft leaves the browser to snap
    // afterwards, which shows as a stutter right at the loop seam.
    function offsetOf(i) {
      var el = items[i];
      return (el.offsetLeft - track.offsetLeft) - (track.clientWidth - el.offsetWidth) / 2;
    }

    // ── Dots (one per real card) ────────────────────────────────
    var dots = document.createElement('div');
    dots.className = 'mc-dots';
    real.forEach(function (_, i) {
      var d = document.createElement('span');
      d.className = 'mc-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', function () { glide(offsetOf(i + FIRST)); });
      dots.appendChild(d);
    });
    track.parentNode.insertBefore(dots, track.nextSibling);

    function paint() {
      var d = dots.querySelectorAll('.mc-dot');
      var active = index - FIRST;
      for (var i = 0; i < d.length; i++) d[i].classList.toggle('active', i === active);
    }

    // ── Instant reposition, used when landing on a clone ────────
    // Snap has to come off for the jump or it fights the assignment
    // and the reader sees a stutter at the seam.
    function jump(i) {
      var snap = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      track.scrollLeft = offsetOf(i);
      void track.offsetWidth;                 // flush before restoring
      track.style.scrollSnapType = snap || '';
      index = i;
    }

    // ── Eased move, used for dot taps ───────────────────────────
    // Hand-rolled rather than scrollTo({behavior:'smooth'}): native
    // smooth scrolling is dropped outright in some environments,
    // which would leave a dot tap doing nothing at all.
    var raf = null;
    function glide(to) {
      if (raf) cancelAnimationFrame(raf);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.scrollLeft = to; return;
      }
      var from = track.scrollLeft, delta = to - from, t0 = null, DUR = 420;
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / DUR, 1);
        var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        track.scrollLeft = from + delta * e;
        if (p < 1) raf = requestAnimationFrame(step);
      })(performance.now());
    }

    function nearest() {
      var mid = track.scrollLeft + track.clientWidth / 2, best = Infinity, n = FIRST;
      items.forEach(function (el, i) {
        var c = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2;
        var d = Math.abs(c - mid);
        if (d < best) { best = d; n = i; }
      });
      return n;
    }

    // ── Settle: once scrolling stops, close the loop if needed ──
    var idle;
    track.addEventListener('scroll', function () {
      clearTimeout(idle);
      idle = setTimeout(function () {
        var n = nearest();
        if (items[n].dataset.clone === 'tail')      jump(FIRST);  // past the end → first
        else if (items[n].dataset.clone === 'head') jump(LAST);   // before the start → last
        else index = n;
        paint();
      }, 90);
    }, { passive: true });

    // Rest on the first real card, not the leading clone.
    jump(FIRST);
    paint();
  }

  function teardown(track) {
    if (!track || track.dataset.carousel !== 'on') return;
    delete track.dataset.carousel;

    // Clones must go, or the desktop grid renders six offerings.
    Array.prototype.forEach.call(
      track.querySelectorAll('[data-clone]'),
      function (c) { c.parentNode.removeChild(c); }
    );
    var dots = track.parentNode.querySelector('.mc-dots');
    if (dots) dots.parentNode.removeChild(dots);
    track.style.scrollSnapType = '';
    track.scrollLeft = 0;
  }

  function sync() {
    var on = window.matchMedia('(max-width: ' + BREAKPOINT + 'px)').matches;
    ['.offerings-grid', '.members-grid'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (!el) return;
      on ? init(el) : teardown(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  } else {
    sync();
  }
  window.addEventListener('resize', sync);
})();
