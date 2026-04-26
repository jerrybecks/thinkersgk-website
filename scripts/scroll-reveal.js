/* ============================================================
   Scroll reveal — IntersectionObserver
   Respects prefers-reduced-motion. Scoped via js-scroll-ready
   on <html> so CSS can safely use that as a guard.
   ============================================================ */
(function () {
  'use strict';

  /* If the user prefers reduced motion, do nothing.
     CSS animations in main.css also check this query. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Pre-mark elements already in the viewport so they never flash hidden
     when js-scroll-ready is added below. */
  function inViewport(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  function preReveal() {
    document.querySelectorAll('.section-title, .section-label').forEach(function (el) {
      if (el.closest('.home-cinematic-hero, .service-page-hero, .page-header, .hero')) return;
      if (inViewport(el)) el.classList.add('is-visible');
    });
    document.querySelectorAll('.section-num, .reveal').forEach(function (el) {
      if (inViewport(el)) el.classList.add('is-visible');
    });
    var STAGGER_GRIDS = [
      '.cards-grid', '.home-service-overview__grid', '.home-testimonials__grid',
      '.home-signature-offers__grid', '.home-principles__grid', '.cs-grid'
    ].join(',');
    document.querySelectorAll(STAGGER_GRIDS).forEach(function (grid) {
      if (!inViewport(grid)) return;
      Array.from(grid.children).forEach(function (child) {
        child.classList.add('is-visible');
      });
    });
  }
  preReveal();

  /* Signal to CSS that JS loaded — used to gate initial hidden states */
  document.documentElement.classList.add('js-scroll-ready');

  /* ── Individual element reveal ─────────────────────────── */
  var revealIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      revealIo.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -52px 0px' });

  /* ── Stagger grid reveal (observes parent, fans children) ─ */
  var staggerIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var children = Array.from(e.target.children);
      children.forEach(function (child, i) {
        child.style.transitionDelay = Math.min(i * 90, 540) + 'ms';
        /* Double rAF so the delay is committed before is-visible fires */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            child.classList.add('is-visible');
          });
        });
      });
      staggerIo.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  function init() {
    /* 1. Mark stagger grids — JS adds class so CSS can scope hidden state */
    var STAGGER_GRIDS = [
      '.cards-grid',
      '.home-service-overview__grid',
      '.home-testimonials__grid',
      '.home-signature-offers__grid',
      '.home-principles__grid',
      '.cs-grid'
    ].join(',');

    document.querySelectorAll(STAGGER_GRIDS).forEach(function (grid) {
      grid.classList.add('stagger-parent');
      staggerIo.observe(grid);
    });

    /* 2. Section titles and labels — skip anything inside a hero */
    document.querySelectorAll('.section-title, .section-label').forEach(function (el) {
      if (el.closest('.home-cinematic-hero, .service-page-hero, .page-header, .hero')) return;
      revealIo.observe(el);
    });

    /* 3. Numbered section markers */
    document.querySelectorAll('.section-num').forEach(function (el) {
      revealIo.observe(el);
    });

    /* 4. Standalone reveal targets */
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealIo.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
