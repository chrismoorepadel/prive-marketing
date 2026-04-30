// ─── DESTINATION & RETREAT DRAWER ─────────────────────
(function () {
  'use strict';

  var drawer  = document.getElementById('propertyDrawer');
  var overlay = document.getElementById('drawerOverlay');
  if (!drawer || !overlay) return;

  function openDrawer(data) {
    var heroEl = document.getElementById('drawerHero');
    var bodyEl = drawer.querySelector('.drawer-body');
    heroEl.style.display = 'none';
    if (bodyEl) bodyEl.style.paddingTop = '72px';
    document.getElementById('drawerRegion').textContent  = data.region;
    document.getElementById('drawerTitle').textContent   = data.name;
    document.getElementById('drawerLoc').textContent     = data.loc;
    document.getElementById('drawerDesc').innerHTML      = data.desc;

    var imagesEl = document.getElementById('drawerImages');
    if (imagesEl) {
      var imgs = data.images || [];
      imagesEl.innerHTML = imgs.map(function(u) {
        return '<div class="drawer-img-item" style="background-image:url(\'' + u + '\')"></div>';
      }).join('');
      imagesEl.style.display = imgs.length ? '' : 'none';
    }

    var bLabel = document.getElementById('drawerBenefitsLabel');
    var bList  = document.getElementById('drawerBenefits');
    if (data.benefits && data.benefits.length) {
      bLabel.style.display = '';
      bList.innerHTML = data.benefits.map(function(b){ return '<li>' + b + '</li>'; }).join('');
    } else {
      bLabel.style.display = 'none';
      bList.innerHTML = '';
    }

    var pillsEl = document.getElementById('drawerPills');
    if (data.pills && data.pills.length) {
      pillsEl.style.display = '';
      pillsEl.innerHTML = data.pills.map(function(p){ return '<span class="drawer-pill">' + p + '</span>'; }).join('');
    } else {
      pillsEl.style.display = 'none';
    }

    var statusEl = document.getElementById('drawerStatus');
    if (data.status) {
      statusEl.style.display = '';
      var dot = statusEl.querySelector('.drawer-status-dot');
      var txt = statusEl.querySelector('.retreat-status-text');
      dot.className = 'drawer-status-dot ' + (data.statusClass || 'status-coming-soon');
      txt.textContent = data.status;
    } else {
      statusEl.style.display = 'none';
    }

    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Public API
  window.openDestDrawer = function(id) {
    var dest = (window.DESTINATIONS || []).find(function(d){ return d.id === id; });
    if (dest) openDrawer(dest);
  };

  window.openRetreatDrawer = function(id) {
    var retreat = (window.RETREATS || []).find(function(r){ return r.id === id; });
    if (retreat) openDrawer(retreat);
  };

  // Close handlers
  overlay.addEventListener('click', closeDrawer);
  var closeBtn = document.getElementById('drawerCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // Region filter for full network
  document.querySelectorAll('.region-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var filter = tab.dataset.filter;
      document.querySelectorAll('.region-tab').forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.network-card').forEach(function(card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.filter !== filter);
      });
    });
  });

}());
