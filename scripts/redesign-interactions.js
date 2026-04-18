/**
 * Thinkers GK — Redesign Micro-Interactions & Enhanced Animations
 * Production script for section reveals, magnetic buttons, 3D card tilt,
 * logo bar hover, nav dots, stats glow, staggered cards, and theme transitions.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var isMobile = window.innerWidth < 768;

        // 1. Section Reveal — removed (caused floating effect)

        // -------------------------------------------------------------------
        // 2. Magnetic Button Effect (desktop only)
        // -------------------------------------------------------------------
        if (!isMobile) {
            document.querySelectorAll('.btn-primary').forEach(function (btn) {
                btn.addEventListener('mousemove', function (e) {
                    var rect = btn.getBoundingClientRect();
                    var x = e.clientX - (rect.left + rect.width / 2);
                    var y = e.clientY - (rect.top + rect.height / 2);
                    var dist = Math.sqrt(x * x + y * y);
                    var maxDist = 100;
                    if (dist < maxDist) {
                        var force = (1 - dist / maxDist) * 8;
                        btn.style.transform =
                            'translate(' +
                            (x / dist) * force +
                            'px,' +
                            (y / dist) * force +
                            'px)';
                    }
                });
                btn.addEventListener('mouseleave', function () {
                    btn.style.transform = '';
                });
            });
        }

        // 3. 3D Card Tilt — removed (cards should not move)

        // -------------------------------------------------------------------
        // 4. Logo Bar Hover Pause
        // -------------------------------------------------------------------
        var logoTrack = document.querySelector('.logo-track');
        var logoWrapper = logoTrack && logoTrack.closest('.logo-track-wrapper');
        if (logoWrapper) {
            logoWrapper.addEventListener('mouseenter', function () {
                logoTrack.style.animationPlayState = 'paused';
            });
            logoWrapper.addEventListener('mouseleave', function () {
                logoTrack.style.animationPlayState = 'running';
            });
        }

        // -------------------------------------------------------------------
        // 5. Nav Section Dots
        // -------------------------------------------------------------------
        var sectionEls = document.querySelectorAll('section[id]');
        if (sectionEls.length > 0) {
            var dotsContainer = document.createElement('div');
            dotsContainer.className = 'nav-section-dots';
            dotsContainer.style.cssText =
                'position:fixed;right:18px;top:50%;transform:translateY(-50%);' +
                'z-index:1000;display:flex;flex-direction:column;gap:10px;';

            sectionEls.forEach(function (sec) {
                var dot = document.createElement('button');
                dot.className = 'nav-dot';
                dot.setAttribute('aria-label', 'Scroll to ' + sec.id);
                dot.dataset.target = sec.id;
                dot.style.cssText =
                    'width:10px;height:10px;border-radius:50%;border:2px solid rgba(150,150,150,0.5);' +
                    'background:transparent;cursor:pointer;padding:0;transition:background 0.3s ease, border-color 0.3s ease;';
                dot.addEventListener('click', function () {
                    document
                        .getElementById(sec.id)
                        .scrollIntoView({ behavior: 'smooth' });
                });
                dotsContainer.appendChild(dot);
            });

            document.body.appendChild(dotsContainer);

            var dotObserver = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        var id = entry.target.id;
                        var dot = dotsContainer.querySelector(
                            '[data-target="' + id + '"]'
                        );
                        if (!dot) return;
                        if (entry.isIntersecting) {
                            dot.classList.add('active');
                            dot.style.background = 'var(--accent, #2563eb)';
                            dot.style.borderColor = 'var(--accent, #2563eb)';
                        } else {
                            dot.classList.remove('active');
                            dot.style.background = 'transparent';
                            dot.style.borderColor = 'rgba(150,150,150,0.5)';
                        }
                    });
                },
                { threshold: 0.3 }
            );

            sectionEls.forEach(function (sec) {
                dotObserver.observe(sec);
            });
        }

        // -------------------------------------------------------------------
        // 6. Stats Glow Effect
        // -------------------------------------------------------------------
        var statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length > 0) {
            var glowStyle = document.createElement('style');
            glowStyle.textContent =
                '.stat-glow { animation: statGlowPulse 0.8s ease-out; }' +
                '@keyframes statGlowPulse {' +
                '  0% { text-shadow: 0 0 0 transparent; }' +
                '  40% { text-shadow: 0 0 18px rgba(37,99,235,0.6), 0 0 40px rgba(37,99,235,0.25); }' +
                '  100% { text-shadow: none; }' +
                '}';
            document.head.appendChild(glowStyle);

            statNumbers.forEach(function (el) {
                var mo = new MutationObserver(function (mutations) {
                    mutations.forEach(function (m) {
                        if (
                            m.type === 'attributes' &&
                            m.attributeName === 'class' &&
                            el.classList.contains('counted')
                        ) {
                            el.classList.add('stat-glow');
                            setTimeout(function () {
                                el.classList.remove('stat-glow');
                            }, 900);
                            mo.disconnect();
                        }
                    });
                });
                mo.observe(el, { attributes: true, attributeFilter: ['class'] });
            });
        }

        // 7. Staggered Card Entrance — removed (caused floating effect)

        // -------------------------------------------------------------------
        // 8. Smooth Theme Transition
        // -------------------------------------------------------------------
        var themeObserver = new MutationObserver(function () {
            document.body.style.transition =
                'background-color 0.4s ease, color 0.3s ease';
            setTimeout(function () {
                document.body.style.transition = '';
            }, 500);
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
    });
})();
