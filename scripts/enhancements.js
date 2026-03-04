/**
 * thinkersgk.com — UX enhancements
 * Zero dependencies. Three features:
 *   1. Scroll progress bar (thin accent line at viewport top)
 *   2. CSS spotlight on service cards (cursor-following glow via custom props)
 *   3. Subtle 3D tilt on cards (perspective transform on mousemove)
 */
(function () {

  // ── 1. Scroll progress bar ──────────────────────────────────────────────────
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);

    var raf;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var scrolled = document.documentElement.scrollTop || document.body.scrollTop;
        var total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
      });
    }, { passive: true });
  }

  // ── 2. Card spotlight (cursor-following glow) ───────────────────────────────
  function initCardSpotlight() {
    var cards = document.querySelectorAll('.card, .service-feature-card, .illustration-card');
    cards.forEach(function (card) {
      card.classList.add('spotlight-card');
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--mx', '-999px');
        card.style.setProperty('--my', '-999px');
      });
    });
  }

  // ── 3. 3D card tilt ─────────────────────────────────────────────────────────
  function initCardTilt() {
    var MAX_TILT = 6; // degrees
    var cards = document.querySelectorAll('.card, .service-feature-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform =
          'perspective(600px) rotateX(' + (-dy * MAX_TILT) + 'deg) rotateY(' + (dx * MAX_TILT) + 'deg) translateZ(4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 400);
      });
    });
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initScrollProgress();
    initCardSpotlight();
    initCardTilt();
  });

})();
