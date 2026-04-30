(function () {
  function loadBg(el) {
    if (el.dataset.bg) el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
  }
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-bg]').forEach(loadBg);
    return;
  }
  var obs = new IntersectionObserver(function (entries, o) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      loadBg(e.target);
      o.unobserve(e.target);
    });
  }, { rootMargin: '300px' });
  document.querySelectorAll('[data-bg]').forEach(function (el) { obs.observe(el); });
})();
