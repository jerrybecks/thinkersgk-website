/* ========================================
   THINKERS GK — Main JavaScript
   Theme, language, nav, animations,
   particles, 3D globe, color pulse
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
        if (window._particleNet) window._particleNet.updateColors();
        if (window._globeInstance) window._globeInstance.updateColors();
        // Swap logo for dark/light mode
        document.querySelectorAll('.nav-logo').forEach(function(img) {
            img.src = theme === 'dark' ? 'assets/logo-dark.svg' : 'assets/logo.svg';
        });
    }

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
            mouse.x = null; mouse.y = null;
        });

        window.addEventListener('resize', function() { resize(); init(); });

        resize(); init(); animate();

        window._particleNet = {
            updateColors: function() { colors = getColors(); }
        };
    }

    // ── Japan Map — Stationary Canvas with Cities & Glow ──────────
    function initGlobe() {
        var canvas = document.getElementById('globeCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W, H;

        // Japan cities — pixel positions mapped to a normalized Japan outline
        // Coordinates are % of canvas (0-1 range), mapped from real geography
        var cities = [
            { name: 'Sapporo',   nx: 0.72, ny: 0.13, isHQ: false },
            { name: 'Sendai',    nx: 0.70, ny: 0.36, isHQ: false },
            { name: 'Tokyo',     nx: 0.64, ny: 0.50, isHQ: true },
            { name: 'Nagoya',    nx: 0.52, ny: 0.53, isHQ: false },
            { name: 'Osaka',     nx: 0.44, ny: 0.57, isHQ: false },
            { name: 'Hiroshima', nx: 0.30, ny: 0.58, isHQ: false },
            { name: 'Fukuoka',   nx: 0.18, ny: 0.57, isHQ: false }
        ];

        // Simplified Japan coastline outlines (normalized 0-1 coords)
        // Hokkaido
        var hokkaido = [
            [0.60,0.18],[0.62,0.14],[0.65,0.10],[0.68,0.07],[0.72,0.05],[0.76,0.04],
            [0.80,0.05],[0.83,0.07],[0.85,0.10],[0.86,0.14],[0.85,0.18],[0.83,0.21],
            [0.80,0.23],[0.76,0.24],[0.72,0.23],[0.68,0.21],[0.65,0.20],[0.62,0.20],
            [0.60,0.18]
        ];
        // Honshu (main island)
        var honshu = [
            [0.62,0.26],[0.65,0.25],[0.68,0.27],[0.72,0.30],[0.74,0.33],[0.75,0.36],
            [0.74,0.39],[0.72,0.42],[0.70,0.44],[0.68,0.47],[0.66,0.50],[0.64,0.52],
            [0.61,0.53],[0.58,0.54],[0.55,0.55],[0.52,0.56],[0.48,0.57],[0.44,0.58],
            [0.40,0.58],[0.37,0.56],[0.35,0.54],[0.34,0.52],[0.35,0.50],[0.37,0.48],
            [0.39,0.46],[0.42,0.44],[0.44,0.42],[0.46,0.40],[0.48,0.38],[0.50,0.36],
            [0.52,0.34],[0.54,0.32],[0.56,0.30],[0.58,0.28],[0.60,0.27],[0.62,0.26]
        ];
        // Shikoku
        var shikoku = [
            [0.38,0.60],[0.41,0.59],[0.44,0.60],[0.46,0.62],[0.45,0.64],[0.42,0.65],
            [0.39,0.64],[0.37,0.62],[0.38,0.60]
        ];
        // Kyushu
        var kyushu = [
            [0.22,0.52],[0.25,0.50],[0.28,0.51],[0.30,0.53],[0.31,0.56],[0.30,0.59],
            [0.28,0.62],[0.25,0.64],[0.22,0.65],[0.19,0.64],[0.17,0.62],[0.15,0.59],
            [0.14,0.56],[0.15,0.53],[0.17,0.51],[0.19,0.50],[0.22,0.52]
        ];
        // Okinawa chain (small)
        var okinawa = [
            [0.12,0.78],[0.14,0.80],[0.16,0.82],[0.18,0.85],[0.20,0.88]
        ];

        var islands = [hokkaido, honshu, shikoku, kyushu];

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                landFill: dark ? 'rgba(59,130,246,0.08)' : 'rgba(37,99,235,0.06)',
                landStroke: dark ? 'rgba(59,130,246,0.5)' : 'rgba(37,99,235,0.35)',
                city: dark ? '#60a5fa' : '#2563eb',
                cityGlow: dark ? 'rgba(96,165,250,0.5)' : 'rgba(37,99,235,0.35)',
                hq: '#f59e0b',
                hqGlow: 'rgba(245,158,11,0.5)',
                line: dark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.12)',
                label: dark ? '#e5e7eb' : '#1e293b',
                grid: dark ? 'rgba(59,130,246,0.04)' : 'rgba(37,99,235,0.03)',
                okinawa: dark ? 'rgba(59,130,246,0.3)' : 'rgba(37,99,235,0.2)'
            };
        }

        var colors = getColors();

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            W = canvas.width;
            H = canvas.height;
        }

        function toPixel(nx, ny) {
            // Add padding and scale to fill canvas
            var pad = 20;
            return {
                x: pad + nx * (W - pad * 2),
                y: pad + ny * (H - pad * 2)
            };
        }

        function drawIsland(pts, fill, stroke, lineW) {
            ctx.beginPath();
            for (var i = 0; i < pts.length; i++) {
                var p = toPixel(pts[i][0], pts[i][1]);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            if (fill) { ctx.fillStyle = fill; ctx.fill(); }
            if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineW || 2; ctx.stroke(); }
        }

        function drawPolyline(pts, color, lineW) {
            ctx.beginPath();
            for (var i = 0; i < pts.length; i++) {
                var p = toPixel(pts[i][0], pts[i][1]);
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = lineW || 1.5;
            ctx.stroke();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            var time = Date.now() * 0.002;

            // Subtle grid dots
            var gridSpacing = 40;
            for (var gx = 0; gx < W; gx += gridSpacing) {
                for (var gy = 0; gy < H; gy += gridSpacing) {
                    ctx.beginPath();
                    ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
                    ctx.fillStyle = colors.grid;
                    ctx.fill();
                }
            }

            // Draw islands with fill and stroke
            for (var i = 0; i < islands.length; i++) {
                // Glow effect behind each island
                ctx.save();
                ctx.shadowColor = colors.cityGlow;
                ctx.shadowBlur = 20;
                drawIsland(islands[i], colors.landFill, null, 0);
                ctx.restore();
                // Crisp outline
                drawIsland(islands[i], colors.landFill, colors.landStroke, 2);
            }

            // Okinawa chain (dots and line)
            drawPolyline(okinawa, colors.okinawa, 1.5);
            for (var i = 0; i < okinawa.length; i++) {
                var op = toPixel(okinawa[i][0], okinawa[i][1]);
                ctx.beginPath();
                ctx.arc(op.x, op.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = colors.okinawa;
                ctx.fill();
            }

            // Connection lines from Tokyo to each city (curved arcs)
            var tokyoCity = cities[2]; // Tokyo
            var tkP = toPixel(tokyoCity.nx, tokyoCity.ny);
            for (var i = 0; i < cities.length; i++) {
                if (cities[i].isHQ) continue;
                var cp = toPixel(cities[i].nx, cities[i].ny);
                ctx.beginPath();
                ctx.moveTo(tkP.x, tkP.y);
                var mx = (tkP.x + cp.x) / 2;
                var my = (tkP.y + cp.y) / 2 - 30;
                ctx.quadraticCurveTo(mx, my, cp.x, cp.y);
                ctx.strokeStyle = colors.line;
                ctx.lineWidth = 1.2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Animated dot traveling along the line
                var t = (Math.sin(time + i * 1.2) + 1) / 2;
                var dotX = (1 - t) * (1 - t) * tkP.x + 2 * (1 - t) * t * mx + t * t * cp.x;
                var dotY = (1 - t) * (1 - t) * tkP.y + 2 * (1 - t) * t * my + t * t * cp.y;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = colors.city;
                ctx.globalAlpha = 0.7;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Draw city markers
            for (var i = 0; i < cities.length; i++) {
                var c = cities[i];
                var p = toPixel(c.nx, c.ny);
                var dotColor = c.isHQ ? colors.hq : colors.city;
                var glowColor = c.isHQ ? colors.hqGlow : colors.cityGlow;
                var pulseR = 6 + Math.sin(time + i * 0.8) * 3;

                // Outer glow pulse
                ctx.beginPath();
                ctx.arc(p.x, p.y, pulseR * (c.isHQ ? 4.5 : 3), 0, Math.PI * 2);
                var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseR * (c.isHQ ? 4.5 : 3));
                grd.addColorStop(0, glowColor);
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.globalAlpha = 0.6 + Math.sin(time + i) * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Mid ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 12 : 8, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.globalAlpha = 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Inner dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 7 : 5, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.fill();

                // White center
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 3 : 2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Label
                ctx.font = (c.isHQ ? '700 14px' : '600 12px') + ' Inter, -apple-system, sans-serif';
                ctx.fillStyle = c.isHQ ? colors.hq : colors.label;
                ctx.textAlign = 'center';
                var labelY = p.y + (c.isHQ ? 24 : 20);
                ctx.fillText(c.name, p.x, labelY);

                // HQ badge
                if (c.isHQ) {
                    ctx.font = '600 9px Inter, sans-serif';
                    ctx.fillStyle = colors.hq;
                    ctx.globalAlpha = 0.8;
                    ctx.fillText('★ HQ', p.x, labelY + 14);
                    ctx.globalAlpha = 1;
                }
            }
        }

        function animate() {
            draw();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();

        window._globeInstance = {
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
                    var startTime = null;

                    function step(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var progress = Math.min((timestamp - startTime) / duration, 1);
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
        var clone = track.innerHTML;
        track.innerHTML = clone + clone;
    }

    // ── Color Pulse Animation ───────────────────────
    // Subtle animated gradient that shifts through brand colors
    function initColorPulse() {
        var el = document.querySelector('.color-pulse-bg');
        if (!el) return;
        // Color pulse is handled purely by CSS @keyframes
        // This function adds the class to page-headers too
        document.querySelectorAll('.page-header, .service-page-hero').forEach(function(header) {
            if (!header.querySelector('.color-pulse-bg')) {
                var div = document.createElement('div');
                div.className = 'color-pulse-bg';
                header.style.position = 'relative';
                header.style.overflow = 'hidden';
                header.insertBefore(div, header.firstChild);
            }
        });
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

        document.querySelectorAll('.card, .feature, .cta-box, .service-detail-inner, .fade-target, .stat-item, .logo-bar, .contact-info, .contact-form, .service-feature-card, .process-step, .testimonial-block').forEach(function(el, i) {
            el.classList.add('fade-in');
            el.style.transitionDelay = (i % 6) * 0.1 + 's';
            observer.observe(el);
        });

        // ── Init modules ─────────────────────────────
        initParticleNetwork();
        initGlobe();
        initCounters();
        initHeroTextAnim();
        initLogoScroll();
        initColorPulse();
    });

})();
