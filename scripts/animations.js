/* ========================================
   THINKERS GK — GSAP Scroll Animations
   Full-site animations for ALL page types.
   Requires: GSAP, ScrollTrigger, Lenis, Typed.js (via CDN)
   ======================================== */

(function () {
    'use strict';

    var retryCount = 0;

    function init() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            if (retryCount++ < 30) setTimeout(init, 100);
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        initSmoothScroll();
        initScrollProgressBar();
        initHeroAnimations();
        initPageHeaderAnimations();
        initScrollAnimations();
        initCounterAnimations();
        initParallax();
        initServicePageAnimations();
        initContactPageAnimations();
        initBlogAnimations();
        initMagneticButtons();
        initFloatingOrbs();
        initNavScrollEffect();
    }

    /* ========================================
       SMOOTH SCROLLING (Lenis)
       ======================================== */
    function initSmoothScroll() {
        if (typeof Lenis === 'undefined') return;

        var lenis = new Lenis({
            duration: 1.2,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
            orientation: 'vertical',
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        window._lenis = lenis;
    }

    /* ========================================
       SCROLL PROGRESS BAR
       ======================================== */
    function initScrollProgressBar() {
        var bar = document.querySelector('.scroll-progress-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'scroll-progress-bar';
            bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#6366f1,#06b6d4);z-index:999;transform-origin:left;will-change:transform;transform:scaleX(0);';
            document.body.prepend(bar);
        }

        gsap.to(bar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
            },
        });
    }

    /* ========================================
       HOMEPAGE HERO
       ======================================== */
    function initHeroAnimations() {
        var hero = document.querySelector('.hero');
        if (!hero) return;

        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Badge float in
        var badge = hero.querySelector('.hero-badge');
        if (badge) {
            tl.from(badge, { y: 20, opacity: 0, duration: 0.8 }, 0.2);
        }

        // Headline stagger — each word/span
        var h1Spans = hero.querySelectorAll('h1 span');
        if (h1Spans.length) {
            tl.from(h1Spans, { y: 60, opacity: 0, duration: 1, stagger: 0.15 }, 0.4);
        } else {
            var h1 = hero.querySelector('h1');
            if (h1) tl.from(h1, { y: 40, opacity: 0, duration: 1 }, 0.4);
        }

        // Subtitle
        var sub = hero.querySelector('.hero-sub, .hero p');
        if (sub) tl.from(sub, { y: 30, opacity: 0, duration: 0.8 }, 0.8);

        // CTA buttons
        var actions = hero.querySelector('.hero-actions, .hero-cta');
        if (actions) tl.from(actions.children, { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, 1.0);

        // Trust row items
        var trustItems = hero.querySelectorAll('.hero-trust-item');
        if (trustItems.length) {
            tl.from(trustItems, { y: 15, opacity: 0, duration: 0.5, stagger: 0.08 }, 1.2);
        }

        // Hero image — scale in
        var heroImg = hero.querySelector('.hero-image-right img, .hero-image img');
        if (heroImg) {
            tl.from(heroImg, { scale: 1.08, opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.3);
        }

        // Initialize Typed.js
        initTypedSubtitle();
    }

    /* ========================================
       TYPED.JS SUBTITLE
       ======================================== */
    function initTypedSubtitle() {
        var typedEl = document.getElementById('typed-services');
        if (!typedEl || typeof Typed === 'undefined') return;

        var lang = document.documentElement.getAttribute('lang') || 'en';

        var stringsEN = [
            'IT Support & Helpdesk',
            'Field Engineering',
            'Cybersecurity',
            'Cloud Migration',
            'AI Integration',
            'DX Consulting',
            'Zero Trust Security',
        ];

        var stringsJA = [
            'ITサポート＆ヘルプデスク',
            'フィールドエンジニアリング',
            'サイバーセキュリティ',
            'クラウド移行',
            'AI統合',
            'DXコンサルティング',
            'ゼロトラストセキュリティ',
        ];

        new Typed(typedEl, {
            strings: lang === 'ja' ? stringsJA : stringsEN,
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|',
        });
    }

    /* ========================================
       PAGE HEADER ANIMATIONS (Inner pages)
       ======================================== */
    function initPageHeaderAnimations() {
        var header = document.querySelector('.page-header, .service-page-hero');
        if (!header) return;

        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        var h1 = header.querySelector('h1, h2');
        if (h1) tl.from(h1, { y: 40, opacity: 0, duration: 1 }, 0.3);

        var sub = header.querySelector('p');
        if (sub) tl.from(sub, { y: 25, opacity: 0, duration: 0.8 }, 0.6);

        var backLink = header.querySelector('.back-link, a[href="services.html"]');
        if (backLink) tl.from(backLink, { x: -20, opacity: 0, duration: 0.6 }, 0.2);

        var breadcrumb = header.querySelector('.breadcrumb');
        if (breadcrumb) tl.from(breadcrumb, { y: -10, opacity: 0, duration: 0.5 }, 0.2);
    }

    /* ========================================
       SCROLL-TRIGGERED ANIMATIONS (all pages)
       ======================================== */
    function initScrollAnimations() {
        // Universal card animation
        gsap.utils.toArray('.card, .blog-card, .service-feature-card, .pricing-card, .mission-card, .team-card, .contact-info-card').forEach(function (card, i) {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, duration: 0.7, delay: (i % 3) * 0.1, ease: 'power3.out',
            });
        });

        // Section headers — slide up
        gsap.utils.toArray('.section-label, .section-title, .section h2, .section h3').forEach(function (el) {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
                y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
            });
        });

        // Process steps — stagger
        var processSteps = gsap.utils.toArray('.process-step');
        if (processSteps.length) {
            gsap.from(processSteps, {
                scrollTrigger: { trigger: processSteps[0], start: 'top 80%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
            });
        }

        // Value props — slide from left
        gsap.utils.toArray('.value-prop').forEach(function (vp, i) {
            gsap.from(vp, {
                scrollTrigger: { trigger: vp, start: 'top 85%', toggleActions: 'play none none none' },
                x: -30, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
            });
        });

        // Testimonials
        gsap.utils.toArray('.testimonial-block').forEach(function (t) {
            gsap.from(t, {
                scrollTrigger: { trigger: t, start: 'top 80%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, scale: 0.97, duration: 0.8, ease: 'power3.out',
            });
        });

        // Illustration cards
        gsap.utils.toArray('.illustration-card').forEach(function (card, i) {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, duration: 0.7, delay: i * 0.12, ease: 'power3.out',
            });
        });

        // CTA sections
        gsap.utils.toArray('.cta-box, .cta-section').forEach(function (cta) {
            gsap.from(cta, {
                scrollTrigger: { trigger: cta, start: 'top 80%', toggleActions: 'play none none none' },
                y: 30, opacity: 0, scale: 0.98, duration: 0.8, ease: 'power3.out',
            });
        });

        // Logo bar
        var logoBar = document.querySelector('.logo-bar');
        if (logoBar) {
            gsap.from(logoBar, {
                scrollTrigger: { trigger: logoBar, start: 'top 90%', toggleActions: 'play none none none' },
                opacity: 0, duration: 1, ease: 'power2.out',
            });
        }

        // Images — slide in from side
        gsap.utils.toArray('.split-image img, .about-image img, .contact-image img').forEach(function (img) {
            gsap.from(img, {
                scrollTrigger: { trigger: img, start: 'top 80%', toggleActions: 'play none none none' },
                x: 60, opacity: 0, duration: 1, ease: 'power3.out',
            });
        });

        // Feature lists
        gsap.utils.toArray('.feature-list li, .service-list li').forEach(function (li, i) {
            gsap.from(li, {
                scrollTrigger: { trigger: li, start: 'top 90%', toggleActions: 'play none none none' },
                x: -20, opacity: 0, duration: 0.5, delay: (i % 6) * 0.05, ease: 'power3.out',
            });
        });

        // Related services
        gsap.utils.toArray('.related-service, .related-services a').forEach(function (rs, i) {
            gsap.from(rs, {
                scrollTrigger: { trigger: rs, start: 'top 85%', toggleActions: 'play none none none' },
                y: 30, opacity: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
            });
        });

        // Fade targets (catch-all for existing .fade-in elements)
        gsap.utils.toArray('.fade-target, .fade-in:not(.visible)').forEach(function (el) {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
                y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
            });
        });

        // Footer columns stagger
        var footerCols = gsap.utils.toArray('.footer-col');
        if (footerCols.length) {
            gsap.from(footerCols, {
                scrollTrigger: { trigger: footerCols[0], start: 'top 90%', toggleActions: 'play none none none' },
                y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            });
        }
    }

    /* ========================================
       ANIMATED NUMBER COUNTERS
       ======================================== */
    function initCounterAnimations() {
        var statNumbers = document.querySelectorAll('.stat-number[data-count]');
        if (!statNumbers.length) return;

        statNumbers.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-count'), 10);
            var suffix = el.getAttribute('data-suffix') || '';

            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                onEnter: function () {
                    var obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function () {
                            el.textContent = Math.round(obj.val) + suffix;
                        },
                    });
                },
                once: true,
            });
        });
    }

    /* ========================================
       PARALLAX EFFECTS
       ======================================== */
    function initParallax() {
        // Hero image parallax
        var heroImg = document.querySelector('.hero-image-right img, .hero img');
        if (heroImg) {
            gsap.to(heroImg, {
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
                y: 60, scale: 1.02, ease: 'none',
            });
        }

        // Globe parallax
        var globeImg = document.querySelector('.globe-image');
        if (globeImg) {
            gsap.to(globeImg, {
                scrollTrigger: { trigger: '.globe-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
                y: -30, ease: 'none',
            });
        }

        // Service page hero images
        gsap.utils.toArray('.service-page-hero img, .page-header img').forEach(function (img) {
            gsap.to(img, {
                scrollTrigger: { trigger: img.parentElement, start: 'top top', end: 'bottom top', scrub: 1 },
                y: 40, ease: 'none',
            });
        });

        // Section background parallax
        gsap.utils.toArray('.section-alt, .stats-section').forEach(function (sec) {
            gsap.to(sec, {
                scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 1 },
                backgroundPositionY: '30%', ease: 'none',
            });
        });
    }

    /* ========================================
       SERVICE PAGE ANIMATIONS
       ======================================== */
    function initServicePageAnimations() {
        // Service detail content — slide in
        var detailInner = document.querySelector('.service-detail-inner');
        if (detailInner) {
            var detailText = detailInner.querySelector('.service-detail-text, .service-text');
            var detailImg = detailInner.querySelector('.service-detail-image, .service-image');
            if (detailText) {
                gsap.from(detailText, {
                    scrollTrigger: { trigger: detailInner, start: 'top 75%', toggleActions: 'play none none none' },
                    x: -40, opacity: 0, duration: 0.8, ease: 'power3.out',
                });
            }
            if (detailImg) {
                gsap.from(detailImg, {
                    scrollTrigger: { trigger: detailInner, start: 'top 75%', toggleActions: 'play none none none' },
                    x: 40, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out',
                });
            }
        }

        // Service feature cards grid
        var featureCards = gsap.utils.toArray('.service-feature-card, .feature-card');
        if (featureCards.length > 1) {
            gsap.from(featureCards, {
                scrollTrigger: { trigger: featureCards[0], start: 'top 80%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            });
        }
    }

    /* ========================================
       CONTACT PAGE ANIMATIONS
       ======================================== */
    function initContactPageAnimations() {
        var contactForm = document.querySelector('.contact-form, form');
        if (!contactForm || !document.querySelector('.page-header')) return; // Only on contact page

        // Form fields — stagger in
        var formGroups = contactForm.querySelectorAll('.form-group, .form-field, input, textarea, select');
        if (formGroups.length) {
            gsap.from(formGroups, {
                scrollTrigger: { trigger: contactForm, start: 'top 80%', toggleActions: 'play none none none' },
                y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
            });
        }

        // Contact info cards
        var infoCards = gsap.utils.toArray('.contact-info-card, .contact-info .info-item');
        if (infoCards.length) {
            gsap.from(infoCards, {
                scrollTrigger: { trigger: infoCards[0], start: 'top 85%', toggleActions: 'play none none none' },
                x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            });
        }

        // Add focus glow effect to form inputs
        contactForm.querySelectorAll('input, textarea, select').forEach(function (input) {
            input.addEventListener('focus', function () {
                gsap.to(this, { boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)', duration: 0.3 });
            });
            input.addEventListener('blur', function () {
                gsap.to(this, { boxShadow: 'none', duration: 0.3 });
            });
        });
    }

    /* ========================================
       BLOG ANIMATIONS
       ======================================== */
    function initBlogAnimations() {
        // Blog cards stagger
        var blogCards = gsap.utils.toArray('.blog-card, .post-card, article.card');
        if (blogCards.length) {
            gsap.from(blogCards, {
                scrollTrigger: { trigger: blogCards[0], start: 'top 85%', toggleActions: 'play none none none' },
                y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            });
        }

        // Blog post content — headings stagger as you scroll
        gsap.utils.toArray('.blog-content h2, .blog-content h3, article h2, article h3').forEach(function (heading) {
            gsap.from(heading, {
                scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' },
                y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
            });
        });

        // Blog images — scale reveal
        gsap.utils.toArray('.blog-content img, article img').forEach(function (img) {
            gsap.from(img, {
                scrollTrigger: { trigger: img, start: 'top 85%', toggleActions: 'play none none none' },
                scale: 0.95, opacity: 0, duration: 0.8, ease: 'power2.out',
            });
        });

        // Blockquotes
        gsap.utils.toArray('.blog-content blockquote, article blockquote').forEach(function (bq) {
            gsap.from(bq, {
                scrollTrigger: { trigger: bq, start: 'top 85%', toggleActions: 'play none none none' },
                x: -20, opacity: 0, duration: 0.6, ease: 'power3.out',
            });
        });
    }

    /* ========================================
       MAGNETIC BUTTON EFFECT
       ======================================== */
    function initMagneticButtons() {
        if (window.matchMedia('(hover: none)').matches) return; // Skip on touch

        document.querySelectorAll('.btn-primary, .btn-lg, .magnetic-btn').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
            });

            btn.addEventListener('mouseleave', function () {
                gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
            });
        });
    }

    /* ========================================
       FLOATING ORBS — Injected dynamically
       ======================================== */
    function initFloatingOrbs() {
        // Add orbs to hero and CTA sections
        var targets = document.querySelectorAll('.hero, .cta-section, .stats-section');
        targets.forEach(function (section) {
            if (section.querySelector('.orb')) return; // Already has orbs
            section.classList.add('orb-container');

            for (var i = 1; i <= 3; i++) {
                var orb = document.createElement('div');
                orb.className = 'orb orb-' + i;
                section.appendChild(orb);
            }
        });

        // Add aurora effect to page headers
        document.querySelectorAll('.page-header, .service-page-hero').forEach(function (header) {
            header.classList.add('aurora-bg');
        });
    }

    /* ========================================
       NAV SCROLL EFFECT
       ======================================== */
    function initNavScrollEffect() {
        var nav = document.querySelector('.nav');
        if (!nav) return;

        ScrollTrigger.create({
            start: 'top -80',
            onUpdate: function (self) {
                if (self.direction === 1 && self.scroll() > 300) {
                    gsap.to(nav, { y: -100, duration: 0.3, ease: 'power2.in' });
                } else {
                    gsap.to(nav, { y: 0, duration: 0.3, ease: 'power2.out' });
                }
            },
        });
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
