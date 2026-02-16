/* ========================================
   THINKERS GK — Main JavaScript
   Theme, language, nav, animations,
   particles, dot-matrix globe, color pulse
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

    // ── Dot-Matrix Globe — Japan Highlighted with Glowing Cities ──────────
    function initGlobe() {
        var canvas = document.getElementById('globeCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W, H, cx, cy, radius;

        // Slow auto-rotation centered on Japan
        var rotY = 2.42;
        var rotX = -0.55;
        var autoSpeed = 0.0004;

        // Japan cities — each gets a UNIQUE color
        var cities = [
            { name: 'Tokyo',     lat: 35.68, lon: 139.69, isHQ: true,  color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
            { name: 'Osaka',     lat: 34.69, lon: 135.50, isHQ: false, color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
            { name: 'Nagoya',    lat: 35.18, lon: 136.91, isHQ: false, color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
            { name: 'Fukuoka',   lat: 33.59, lon: 130.40, isHQ: false, color: '#10b981', glow: 'rgba(16,185,129,0.5)' },
            { name: 'Sapporo',   lat: 43.06, lon: 141.35, isHQ: false, color: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
            { name: 'Sendai',    lat: 38.27, lon: 140.87, isHQ: false, color: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
            { name: 'Hiroshima', lat: 34.39, lon: 132.46, isHQ: false, color: '#ec4899', glow: 'rgba(236,72,153,0.5)' }
        ].map(function(c) {
            c.latR = c.lat * Math.PI / 180;
            c.lonR = c.lon * Math.PI / 180;
            return c;
        });

        // Japan land bounding boxes for dot classification
        var japanRegions = [
            { minLat: 41, maxLat: 45.5, minLon: 139, maxLon: 146 },
            { minLat: 36, maxLat: 41, minLon: 138, maxLon: 142 },
            { minLat: 34, maxLat: 36, minLon: 134, maxLon: 141 },
            { minLat: 33.5, maxLat: 35.5, minLon: 130, maxLon: 135 },
            { minLat: 32.5, maxLat: 34.5, minLon: 132, maxLon: 135 },
            { minLat: 31, maxLat: 34, minLon: 129, maxLon: 132 },
            { minLat: 24, maxLat: 27, minLon: 126, maxLon: 129 }
        ];

        function isInJapan(latD, lonD) {
            for (var i = 0; i < japanRegions.length; i++) {
                var r = japanRegions[i];
                if (latD >= r.minLat && latD <= r.maxLat && lonD >= r.minLon && lonD <= r.maxLon) return true;
            }
            return false;
        }

        // World land bounding boxes (simplified)
        var landRegions = [
            { minLat: 10, maxLat: 55, minLon: 60, maxLon: 130 },
            { minLat: -10, maxLat: 20, minLon: 95, maxLon: 140 },
            { minLat: 35, maxLat: 70, minLon: -10, maxLon: 60 },
            { minLat: -35, maxLat: 35, minLon: -20, maxLon: 52 },
            { minLat: 15, maxLat: 70, minLon: -170, maxLon: -50 },
            { minLat: -55, maxLat: 15, minLon: -82, maxLon: -35 },
            { minLat: -45, maxLat: -10, minLon: 110, maxLon: 155 },
            { minLat: 33, maxLat: 43, minLon: 124, maxLon: 132 },
            { minLat: 43, maxLat: 65, minLon: 130, maxLon: 170 }
        ];

        function isLand(latD, lonD) {
            for (var i = 0; i < landRegions.length; i++) {
                var r = landRegions[i];
                if (latD >= r.minLat && latD <= r.maxLat && lonD >= r.minLon && lonD <= r.maxLon) return true;
            }
            return false;
        }

        // Pre-generate dot-matrix grid on sphere
        var dots = [];
        var dotSpacing = 3.5;
        for (var lat = -80; lat <= 80; lat += dotSpacing) {
            var lonStep = dotSpacing / Math.cos(lat * Math.PI / 180);
            if (lonStep > 40) lonStep = 40;
            for (var lon = -180; lon < 180; lon += lonStep) {
                var inJP = isInJapan(lat, lon);
                var land = inJP || isLand(lat, lon);
                dots.push({
                    latR: lat * Math.PI / 180,
                    lonR: lon * Math.PI / 180,
                    japan: inJP,
                    land: land
                });
            }
        }

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                oceanDot: dark ? 'rgba(59,130,246,0.07)' : 'rgba(37,99,235,0.05)',
                landDot: dark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.15)',
                japanDot: dark ? 'rgba(96,165,250,0.85)' : 'rgba(37,99,235,0.7)',
                japanGlow: dark ? 'rgba(96,165,250,0.35)' : 'rgba(37,99,235,0.2)',
                outline: dark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)',
                label: dark ? '#e5e7eb' : '#1e293b',
                connector: dark ? 'rgba(59,130,246,0.18)' : 'rgba(37,99,235,0.1)'
            };
        }

        var colors = getColors();

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            W = canvas.width;
            H = canvas.height;
            cx = W / 2;
            cy = H / 2;
            radius = Math.min(W, H) * 0.44;
        }

        function project(latR, lonR) {
            var cosLat = Math.cos(latR);
            var x3 = cosLat * Math.cos(lonR + rotY);
            var y3 = Math.sin(latR);
            var z3 = cosLat * Math.sin(lonR + rotY);
            var y3r = y3 * Math.cos(rotX) - z3 * Math.sin(rotX);
            var z3r = y3 * Math.sin(rotX) + z3 * Math.cos(rotX);
            return { x: cx + x3 * radius, y: cy - y3r * radius, z: z3r };
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            var time = Date.now() * 0.002;

            // Globe outline
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = colors.outline;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Subtle sphere shading
            var grd = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
            grd.addColorStop(0, colors.outline);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw dot-matrix
            for (var i = 0; i < dots.length; i++) {
                var d = dots[i];
                var p = project(d.latR, d.lonR);
                if (p.z < 0.05) continue;

                var dotSize, dotColor, dotAlpha;
                if (d.japan) {
                    dotSize = 2.2;
                    dotColor = colors.japanDot;
                    dotAlpha = 0.7 + p.z * 0.3;
                } else if (d.land) {
                    dotSize = 1.2;
                    dotColor = colors.landDot;
                    dotAlpha = 0.4 + p.z * 0.4;
                } else {
                    dotSize = 0.7;
                    dotColor = colors.oceanDot;
                    dotAlpha = 0.3 + p.z * 0.3;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.globalAlpha = dotAlpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Japan ambient glow
            var jCenter = project(36 * Math.PI / 180, 138 * Math.PI / 180);
            if (jCenter.z > 0) {
                var glowR = radius * 0.22;
                var grd2 = ctx.createRadialGradient(jCenter.x, jCenter.y, 0, jCenter.x, jCenter.y, glowR);
                grd2.addColorStop(0, colors.japanGlow);
                grd2.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(jCenter.x, jCenter.y, glowR, 0, Math.PI * 2);
                ctx.fillStyle = grd2;
                ctx.globalAlpha = 0.6 + Math.sin(time * 0.5) * 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Connection arcs from Tokyo
            var tokyoP = project(cities[0].latR, cities[0].lonR);
            if (tokyoP.z > 0) {
                for (var i = 1; i < cities.length; i++) {
                    var cp = project(cities[i].latR, cities[i].lonR);
                    if (cp.z < 0) continue;
                    ctx.beginPath();
                    ctx.moveTo(tokyoP.x, tokyoP.y);
                    var mx = (tokyoP.x + cp.x) / 2;
                    var my = (tokyoP.y + cp.y) / 2 - 20;
                    ctx.quadraticCurveTo(mx, my, cp.x, cp.y);
                    ctx.strokeStyle = colors.connector;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([3, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Animated traveling dot
                    var t = (Math.sin(time * 0.8 + i * 1.5) + 1) / 2;
                    var ax = (1-t)*(1-t)*tokyoP.x + 2*(1-t)*t*mx + t*t*cp.x;
                    var ay = (1-t)*(1-t)*tokyoP.y + 2*(1-t)*t*my + t*t*cp.y;
                    ctx.beginPath();
                    ctx.arc(ax, ay, 2, 0, Math.PI * 2);
                    ctx.fillStyle = cities[i].color;
                    ctx.globalAlpha = 0.8;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            // City markers — each with unique color
            for (var i = 0; i < cities.length; i++) {
                var c = cities[i];
                var p = project(c.latR, c.lonR);
                if (p.z < 0) continue;

                var pulseR = 5 + Math.sin(time + i * 0.9) * 2.5;
                var outerR = pulseR * (c.isHQ ? 5 : 3.5);

                // Glow pulse
                var grdC = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, outerR);
                grdC.addColorStop(0, c.glow);
                grdC.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(p.x, p.y, outerR, 0, Math.PI * 2);
                ctx.fillStyle = grdC;
                ctx.globalAlpha = 0.5 + Math.sin(time + i) * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Inner dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 7 : 5, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();

                // White center
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 3 : 1.8, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Label
                ctx.font = (c.isHQ ? '700 13px' : '600 11px') + ' Inter, -apple-system, sans-serif';
                ctx.fillStyle = c.isHQ ? c.color : colors.label;
                ctx.textAlign = 'center';
                var ly = p.y + (c.isHQ ? 22 : 18);
                ctx.fillText(c.name, p.x, ly);

                if (c.isHQ) {
                    ctx.font = '600 9px Inter, sans-serif';
                    ctx.fillStyle = c.color;
                    ctx.globalAlpha = 0.85;
                    ctx.fillText('\u2605 HQ', p.x, ly + 13);
                    ctx.globalAlpha = 1;
                }
            }
        }

        function animate() {
            rotY += autoSpeed;
            if (rotY > 2.42 + 0.3) autoSpeed = -Math.abs(autoSpeed);
            else if (rotY < 2.42 - 0.3) autoSpeed = Math.abs(autoSpeed);
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
    function initColorPulse() {
        var el = document.querySelector('.color-pulse-bg');
        if (!el) return;
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
