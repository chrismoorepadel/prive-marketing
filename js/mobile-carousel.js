// ─── MOBILE CAROUSEL ──────────────────────────────────────────
// Turns a stacked grid into a swipeable, auto-advancing carousel on
// small screens. CSS does the layout (scroll-snap); this only drives
// the auto-advance, the dots, and pausing while the reader is busy.
//
// Applied to: .offerings-grid, .members-grid
// Desktop is untouched — the observer bails out above the breakpoint.

(function () {
  'use strict';

  var BREAKPOINT = 900;
  var INTERVAL   = 4500;   // ms between advances
  var RESUME     = 6000;   // ms of stillness before auto-advance resumes

  function init(track) {
    if (!track || track.dataset.carousel === 'on') return;
    track.dataset.carousel = 'on';

    var items = Array.prototype.slice.call(track.children);
    if (items.length < 2) return;

    // dots
    var dots = document.createElement('div');
    dots.className = 'mc-dots';
    items.forEach(function (_, i) {
      var d = document.createElement('span');
      d.className = 'mc-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', function () { hold(); go(i); });
      dots.appendChild(d);
    });
    track.parentNode.insertBefore(dots, track.nextSibling);
    track.dataset.dots = 'on';

    var index = 0, timer = null, holdTimer = null;

    // Eased by hand rather than via scroll-behavior/scrollTo({behavior}).
    // Native smooth scrolling is silently dropped in some environments,
    // which leaves the carousel frozen with no error; a rAF tween always
    // lands on the target and honours reduced-motion explicitly.
    var raf = null;
    function glide(to) {
      if (raf) cancelAnimationFrame(raf);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        track.scrollLeft = to; return;
      }
      var from = track.scrollLeft, delta = to - from, t0 = null, DUR = 480;
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / DUR, 1);
        var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;  // easeInOutQuad
        track.scrollLeft = from + delta * e;
        if (p < 1) raf = requestAnimationFrame(step);
      })(performance.now());
    }

    function go(i) {
      index = i % items.length;
      glide(items[index].offsetLeft - track.offsetLeft);
      paint();
    }

    function paint() {
      var all = dots.querySelectorAll('.mc-dot');
      for (var i = 0; i < all.length; i++) all[i].classList.toggle('active', i === index);
    }

    function start() {
      stop();
      timer = setInterval(function () { go(index + 1); }, INTERVAL);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    // Pause whenever the reader touches or scrolls, resume once they're done.
    function hold() {
      stop();
      clearTimeout(holdTimer);
      holdTimer = setTimeout(start, RESUME);
    }

    // Keep the dots honest when they swipe manually.
    var scrollIdle;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollIdle);
      scrollIdle = setTimeout(function () {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var nearest = 0, best = Infinity;
        items.forEach(function (el, i) {
          var c = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2;
          var d = Math.abs(c - mid);
          if (d < best) { best = d; nearest = i; }
        });
        index = nearest; paint();
      }, 120);
    }, { passive: true });

    ['touchstart', 'pointerdown', 'wheel'].forEach(function (ev) {
      track.addEventListener(ev, hold, { passive: true });
    });

    // Run only when the carousel is both on-screen and in a foreground tab.
    // These have to be tracked together: keying off visibilitychange alone
    // would restart an off-screen carousel whenever the tab regained focus.
    var onScreen = false;
    function evaluate() {
      (onScreen && !document.hidden) ? start() : stop();
    }

    document.addEventListener('visibilitychange', evaluate);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        evaluate();
      }, { threshold: 0.25 }).observe(track);
    } else {
      onScreen = true;
      evaluate();
    }
  }

  function teardown(track) {
    if (!track || track.dataset.carousel !== 'on') return;
    // Full teardown isn't needed — CSS reverts the layout above the
    // breakpoint, and a reload is the only way back to desktop in
    // practice. Just drop the dots so they don't linger.
    delete track.dataset.carousel;
    var dots = track.parentNode.querySelector('.mc-dots');
    if (dots) dots.parentNode.removeChild(dots);
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
