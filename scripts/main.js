/* ========================================
   THINKERS GK — Main JavaScript
   Theme, language, nav, animations, particles
   ======================================== */

(function() {
    'use strict';

    // ── Theme Toggle (Dark/Light) ──────────────────
    const THEME_KEY = 'thinkers-theme';

    function getPreferredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.innerHTML = theme === 'dark'
                ? '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>'
                : '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
        // Update particle colors if canvas exists
        if (window._particleNet) window._particleNet.updateColors();
    }

    // Apply theme immediately to prevent flash
    setTheme(getPreferredTheme());

    // ── Language Toggle (EN/JP) ────────────────────
    const LANG_KEY = 'thinkers-lang';

    function getLang() {
        return localStorage.getItem(LANG_KEY) || 'en';
    }

    function setLang(lang) {
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem(LANG_KEY, lang);
        document.querySelectorAll('[data-en]').forEach(function(el) {
            el.textContent = lang === 'ja' ? el.getAttribute('data-ja') : el.getAttribute('data-en');
        });
        document.querySelectorAll('[data-en-placeholder]').forEach(function(el) {
            el.placeholder = lang === 'ja' ? el.getAttribute('data-ja-placeholder') : el.getAttribute('data-en-placeholder');
        });
        var langBtn = document.getElementById('langToggle');
        if (langBtn) langBtn.textContent = lang === 'ja' ? 'EN' : 'JP';
    }

    // ── Particle Network Background ─────────────────
    function initParticleNetwork() {
        var canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var particles = [];
        var mouse = { x: null, y: null };
        var count = window.innerWidth < 768 ? 40 : 80;
        var connectDist = 150;
        var mouseRadius = 200;

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                particle: dark ? 'rgba(59,130,246,0.6)' : 'rgba(37,99,235,0.4)',
                line: dark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)',
                mouseLine: dark ? 'rgba(59,130,246,0.3)' : 'rgba(37,99,235,0.15)'
            };
        }

        var colors = getColors();

        function resize() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        function Particle() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.r = Math.random() * 2 + 1;
        }

        Particle.prototype.update = function() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            // Mouse attraction
            if (mouse.x !== null) {
                var dx = mouse.x - this.x, dy = mouse.y - this.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseRadius) {
                    this.x += dx * 0.01;
                    this.y += dy * 0.01;
                }
            }
        };

        Particle.prototype.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = colors.particle;
            ctx.fill();
        };

        function init() {
            particles = [];
            for (var i = 0; i < count; i++) particles.push(new Particle());
        }

        function drawLines() {
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectDist) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = colors.line;
                        ctx.lineWidth = 1 - (dist / connectDist);
                        ctx.stroke();
                    }
                }
                // Mouse lines
                if (mouse.x !== null) {
                    var dx2 = particles[i].x - mouse.x;
                    var dy2 = particles[i].y - mouse.y;
                    var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    if (dist2 < mouseRadius) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = colors.mouseLine;
                        ctx.lineWidth = 1 - (dist2 / mouseRadius);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            drawLines();
            requestAnimationFrame(animate);
        }

        canvas.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', function() {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', function() {
            resize();
            init();
        });

        resize();
        init();
        animate();

        // Expose for theme change
        window._particleNet = {
            updateColors: function() { colors = getColors(); }
        };
    }

    // ── Stats Counter Animation ─────────────────────
    function initCounters() {
        var counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    var target = parseInt(entry.target.getAttribute('data-count'), 10);
                    var suffix = entry.target.getAttribute('data-suffix') || '';
                    var prefix = entry.target.getAttribute('data-prefix') || '';
                    var duration = 2000;
                    var start = 0;
                    var startTime = null;

                    function step(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var progress = Math.min((timestamp - startTime) / duration, 1);
                        // Ease out cubic
                        var eased = 1 - Math.pow(1 - progress, 3);
                        var current = Math.floor(eased * target);
                        entry.target.textContent = prefix + current.toLocaleString() + suffix;
                        if (progress < 1) requestAnimationFrame(step);
                    }

                    requestAnimationFrame(step);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(function(c) { observer.observe(c); });
    }

    // ── Hero Text Animation ─────────────────────────
    function initHeroTextAnim() {
        var el = document.querySelector('.hero-title-animated');
        if (!el) return;
        var text = el.getAttribute('data-text') || el.textContent;
        el.textContent = '';
        el.style.opacity = '1';
        var chars = text.split('');
        chars.forEach(function(char, i) {
            var span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.className = 'hero-char';
            span.style.animationDelay = (i * 0.04 + 0.5) + 's';
            el.appendChild(span);
        });
    }

    // ── Logo Bar Scroll ─────────────────────────────
    function initLogoScroll() {
        var track = document.querySelector('.logo-track');
        if (!track) return;
        // Duplicate logos for infinite scroll
        var clone = track.innerHTML;
        track.innerHTML = clone + clone;
    }

    // ── DOM Ready ──────────────────────────────────
    document.addEventListener('DOMContentLoaded', function() {

        // Theme toggle button
        var themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                var current = document.documentElement.getAttribute('data-theme') || 'light';
                setTheme(current === 'dark' ? 'light' : 'dark');
            });
        }
        setTheme(getPreferredTheme());

        // Language toggle button
        var langBtn = document.getElementById('langToggle');
        if (langBtn) {
            langBtn.addEventListener('click', function() {
                var current = getLang();
                setLang(current === 'ja' ? 'en' : 'ja');
            });
        }
        setLang(getLang());

        // ── Navbar scroll effect ───────────────────
        var nav = document.getElementById('nav');
        if (nav) {
            window.addEventListener('scroll', function() {
                nav.classList.toggle('scrolled', window.scrollY > 50);
            });
        }

        // ── Mobile toggle ──────────────────────────
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('navMenu');
        if (toggle && menu) {
            toggle.addEventListener('click', function() {
                menu.classList.toggle('open');
                toggle.classList.toggle('open');
            });
            menu.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function() {
                    menu.classList.remove('open');
                    toggle.classList.remove('open');
                });
            });
        }

        // ── Staggered fade-in on scroll ──────────────
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.card, .feature, .cta-box, .service-detail-inner, .fade-target, .stat-item, .logo-bar, .contact-info, .contact-form').forEach(function(el, i) {
            el.classList.add('fade-in');
            el.style.transitionDelay = (i % 6) * 0.1 + 's';
            observer.observe(el);
        });

        // ── Init modules ─────────────────────────────
        initParticleNetwork();
        initCounters();
        initHeroTextAnim();
        initLogoScroll();
    });

})();
