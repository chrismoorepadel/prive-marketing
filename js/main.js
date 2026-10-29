// ═══════════════════════════════════════════════════════
//  Privé Marketing — Shared JS
//  Nav scroll, reveal observer, counter animation,
//  dropdown handling, mobile menu.
// ═══════════════════════════════════════════════════════


// ─── APP_URL ─────────────────────────────────────────────
// The one destination for every "Get the app" CTA on the site.
//
// PLACEHOLDER. The Passport portal has no free-signup route yet — it has
// /login, and accounts are created at /welcome after a Stripe checkout — so
// this URL does not resolve. Set the real one before this branch merges.
//
// Every app CTA also carries the URL in its href, so it works without JS and
// on contact.html (which does not load this file); this keeps them in step.
// test/brand-2.test.js fails if any of those hrefs drift from this constant.
window.APP_URL = 'https://passport.prive-padel.com/signup';
document.querySelectorAll('[data-app-link]').forEach(a => { a.href = window.APP_URL; });


// ─── NAV SCROLL ──────────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── PAGE ROUTING ────────────────────────────────────────
function showPage(id) {
  const navMap = {
    'home': 'index.html',
    'collection': 'collection.html',
    'destinations': 'destinations.html',
    'membership': 'membership.html',
    'join': 'join.html',
    'club-partners': 'club-partners.html',
    'experiences': 'experiences.html',
    'clubs': 'clubs.html',
    'club-montauk': 'club-montauk.html',
    'club-coral-gables': 'club-coral-gables.html',
  };
  if (navMap[id]) { window.location.href = navMap[id]; }
}

// ─── SCROLL REVEAL ───────────────────────────────────────
function checkReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', checkReveal);
document.addEventListener('DOMContentLoaded', () => { checkReveal(); animateCounters(); });
checkReveal();

// ─── COUNTER ANIMATION ───────────────────────────────────
function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && !el.dataset.done) {
      el.dataset.done = true;
      const target = parseInt(el.dataset.target);
      const suffix = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
      let current = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.innerHTML = Math.round(current) + suffix;
        if (current >= target) clearInterval(timer);
      }, 30);
    }
  });
}
window.addEventListener('scroll', animateCounters);
animateCounters();

// ─── NAV DROPDOWNS ───────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  let t;
  item.addEventListener('mouseenter', () => {
    clearTimeout(t);
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('open'));
    item.classList.add('open');
  });
  item.addEventListener('mouseleave', () => {
    t = setTimeout(() => item.classList.remove('open'), 200);
  });
});

document.querySelectorAll('.nav-link[data-page]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('open'));
    const page = this.getAttribute('data-page');
    if (page) showPage(page);
  });
});

// ─── MOBILE MENU ─────────────────────────────────────────
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileMenuClose');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMobileMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMobileMenu);

// ─── CLOSE NAV ON OUTSIDE CLICK ──────────────────────────
document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-item')) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('open'));
  }
});

document.addEventListener('DOMContentLoaded', function() {
  checkReveal();
  animateCounters();
});

// ── Footer subscribe form ─────────────────────────────
(function () {
  var form = document.getElementById('footerSubForm');
  if (!form) return;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var field   = document.getElementById('footerSubField');
  var btn     = document.getElementById('footerSubBtn');
  var confirm = document.getElementById('footerSubConfirm');
  var emailIn = document.getElementById('footerSubEmail');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = emailIn.value.trim();
    if (!emailRe.test(email)) { field.classList.add('err'); return; }
    field.classList.remove('err');
    btn.disabled = true;
    btn.textContent = 'SENDING…';
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: 'footer_subscribe' })
    })
    .catch(function () {})
    .then(function () {
      form.style.display = 'none';
      confirm.style.display = 'block';
    });
  });
})();
