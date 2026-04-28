// ═══════════════════════════════════════════════════════
//  Privé Marketing — Shared JS
//  Nav scroll, reveal observer, counter animation,
//  dropdown handling, mobile menu.
// ═══════════════════════════════════════════════════════


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
</script>
