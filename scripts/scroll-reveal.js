/* Scroll Reveal — GSAP ScrollTrigger
   Narrow reveal layer: section-entry fade + translateY only.
   No Lenis, no Typed.js, no glow effects. */

(function() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Targets: all major content sections and cards
  var selectors = [
    '.section',
    '.page-header',
    '.service-page-hero',
    '.card',
    '.home-service-card',
    '.home-principles__lead',
    '.home-principles__item',
    '.home-motion-band__card',
    '.home-coverage__frame',
    '.home-final-cta__box',
    '.contact-info',
    '.contact-form-card',
    '.service-feature-card',
    '.process-step',
    '.testimonial-block',
    '.proof-item',
    '.stat-item',
    '.cta-box',
    '.fact-card',
    '.credibility-item'
  ].join(', ');

  var elements = document.querySelectorAll(selectors);

  elements.forEach(function(el, i) {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true
      },
      delay: (i % 4) * 0.08
    });
  });
})();
