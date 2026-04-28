// ─── HERO CAROUSEL ────────────────────────────────────────────
// Crossfade-only, 6.5s auto-advance, pause on hover and touch.
// Reads slide data from window.HERO_SLIDES (data/hero-slides.js).

(function () {
  'use strict';

  var slides   = window.HERO_SLIDES || [];
  var current  = 0;
  var timer    = null;
  var paused   = false;
  var INTERVAL = 6500;

  function buildSlide(s, index) {
    var el = document.createElement('div');
    el.className = 'hc-slide' + (index === 0 ? ' active' : '');
    el.setAttribute('role', 'tabpanel');
    el.setAttribute('aria-label', 'Slide ' + (index + 1));

    var secondary = s.secondaryLabel
      ? '<a href="' + s.secondaryHref + '" class="btn-ghost"><span class="btn-ghost-line"></span>' + s.secondaryLabel + '</a>'
      : '';

    var location = s.location
      ? '<div class="hero-location">' + s.location + '</div>'
      : '';

    el.innerHTML =
      '<div class="hc-slide-bg" style="background-image:url(\'' + s.image + '\')"></div>' +
      '<div class="hc-slide-overlay"></div>' +
      '<div class="hero-grain"></div>' +
      '<div class="hc-slide-content">' +
        '<div class="hc-slide-left">' +
          '<div class="hc-slide-eyebrow">' + s.eyebrow + '</div>' +
          '<h1 class="hc-slide-hl">' + s.headline + '</h1>' +
          '<p class="hc-slide-sub">' + s.sub + '</p>' +
          '<div class="hc-slide-actions">' +
            '<a href="' + s.primaryHref + '" class="btn-primary">' + s.primaryLabel + '</a>' +
            secondary +
          '</div>' +
        '</div>' +
        '<div class="hc-slide-right">' +
          '<div class="hero-scroll">Scroll</div>' +
          location +
        '</div>' +
      '</div>';
    return el;
  }

  function goTo(index) {
    var allSlides = document.querySelectorAll('.hc-slide');
    var allDots   = document.querySelectorAll('.hc-dot');
    if (!allSlides[index]) return;
    allSlides[current].classList.remove('active');
    allDots[current] && allDots[current].classList.remove('active');
    current = index;
    allSlides[current].classList.add('active');
    allDots[current] && allDots[current].classList.add('active');
  }

  function advance() {
    goTo((current + 1) % slides.length);
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(advance, INTERVAL);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function init() {
    if (!slides.length) return;

    var track  = document.getElementById('hcSlides');
    var dotsEl = document.getElementById('hcDots');
    var carousel = document.getElementById('heroCarousel');
    if (!track || !dotsEl || !carousel) return;

    // Render slides
    slides.forEach(function (s, i) {
      track.appendChild(buildSlide(s, i));

      var dot = document.createElement('button');
      dot.className = 'hc-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); stopTimer(); startTimer(); });
      dotsEl.appendChild(dot);
    });

    startTimer();

    // Pause on hover
    carousel.addEventListener('mouseenter', function () { paused = true; stopTimer(); });
    carousel.addEventListener('mouseleave', function () { paused = false; startTimer(); });

    // Pause on touch; resume after 3s of inactivity
    var touchTimer;
    carousel.addEventListener('touchstart', function () {
      paused = true; stopTimer();
      clearTimeout(touchTimer);
    }, { passive: true });
    carousel.addEventListener('touchend', function () {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(function () { paused = false; startTimer(); }, 3000);
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', init);
}());
