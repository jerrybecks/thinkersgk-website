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
            img.src = theme === 'dark' ? 'assets/logo-dark.png' : 'assets/logo.png';
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
        var pW, pH;

        function resize() {
            var dpr = window.devicePixelRatio || 1;
            pW = canvas.parentElement.offsetWidth;
            pH = canvas.parentElement.offsetHeight;
            canvas.width = pW * dpr;
            canvas.height = pH * dpr;
            canvas.style.width = pW + 'px';
            canvas.style.height = pH + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function Particle() {
            this.x = Math.random() * pW;
            this.y = Math.random() * pH;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.r = Math.random() * 2 + 1;
        }

        Particle.prototype.update = function() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > pW) this.vx *= -1;
            if (this.y < 0 || this.y > pH) this.vy *= -1;
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
            ctx.clearRect(0, 0, pW, pH);
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

    // ── Wireframe Mesh Globe — Japan Focus with Neon Glow ──────────
    function initGlobe() {
        var canvas = document.getElementById('globeCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W, H, cx, cy, radius;

        // Gentle oscillation centered on Japan
        var baseRotY = 2.42;
        var baseRotX = -0.55;
        var rotY = baseRotY;
        var rotX = baseRotX;

        // Japan cities with unique colors
        var cities = [
            { name: 'Tokyo',     lat: 35.68, lon: 139.69, isHQ: true,  color: '#f59e0b', glow: 'rgba(245,158,11,0.6)' },
            { name: 'Osaka',     lat: 34.69, lon: 135.50, isHQ: false, color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
            { name: 'Nagoya',    lat: 35.18, lon: 136.91, isHQ: false, color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
            { name: 'Fukuoka',   lat: 33.59, lon: 130.40, isHQ: false, color: '#10b981', glow: 'rgba(16,185,129,0.5)' },
            { name: 'Sapporo',   lat: 43.06, lon: 141.35, isHQ: false, color: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
            { name: 'Sendai',    lat: 38.27, lon: 140.87, isHQ: false, color: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
            { name: 'Hiroshima', lat: 34.39, lon: 132.46, isHQ: false, color: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
            { name: 'Naha',      lat: 26.33, lon: 127.80, isHQ: false, color: '#14b8a6', glow: 'rgba(20,184,166,0.5)' }
        ].map(function(c) {
            c.latR = c.lat * Math.PI / 180;
            c.lonR = c.lon * Math.PI / 180;
            return c;
        });

        // Simplified Japan coastline points for wireframe mesh
        // Hokkaido, Honshu, Shikoku, Kyushu, Okinawa - ~120 points
        var japanCoast = [
            // Hokkaido
            [45.5,141.9],[45.3,141.0],[44.0,144.4],[43.4,145.5],[43.3,145.6],[42.9,144.8],
            [42.0,143.2],[42.3,140.3],[42.8,140.1],[43.1,140.9],[43.3,141.4],[43.4,141.6],
            [43.7,142.4],[44.4,143.2],[44.9,142.5],[45.1,141.7],
            // Hokkaido interior
            [43.1,141.3],[43.8,143.4],[44.0,142.0],[42.9,141.3],[43.5,141.9],
            // Northern Honshu (Tohoku)
            [41.8,140.7],[41.4,140.3],[40.9,140.0],[40.5,139.9],[40.0,139.8],
            [39.7,139.9],[39.4,140.0],[39.0,139.8],[38.9,139.8],[38.3,138.8],
            [38.7,140.9],[39.6,140.5],[40.2,140.1],[40.5,140.7],[41.0,141.4],
            [41.5,141.0],[41.8,140.7],
            // Honshu interior points (for mesh density)
            [39.5,140.2],[38.5,140.3],[37.5,140.0],[37.9,139.5],[38.2,140.0],
            [40.8,140.5],[39.8,140.1],[37.0,140.5],
            // Central Honshu (Kanto, Chubu)
            [37.9,138.2],[37.5,138.8],[37.0,138.5],[36.8,137.0],[36.6,136.7],
            [36.2,136.1],[35.7,135.8],[35.5,136.2],[35.2,136.7],[35.0,137.0],
            [35.7,139.8],[35.3,139.6],[35.1,139.8],[34.7,139.4],
            // Kanto interior
            [36.3,139.5],[36.0,140.0],[35.8,139.3],[36.5,139.8],[36.1,139.0],
            [36.8,139.4],[37.1,139.2],
            // Kii Peninsula / Osaka region
            [34.6,138.9],[34.3,137.7],[34.0,136.8],[33.5,135.8],[33.4,135.5],
            [34.2,135.2],[34.7,135.4],[34.8,134.2],[34.2,134.0],[33.8,133.5],
            // Western Honshu (Chugoku)
            [35.5,134.2],[35.3,133.0],[35.4,132.8],[35.0,132.0],[34.8,131.4],
            [34.4,131.0],[34.0,130.9],[33.9,131.0],
            // Chugoku interior
            [35.1,133.4],[34.8,132.5],[34.5,132.0],[35.3,133.5],[34.2,131.8],
            // Shikoku
            [34.3,134.0],[33.9,133.0],[33.5,132.5],[33.0,132.8],[33.3,133.5],
            [33.6,134.2],[34.0,134.6],[33.6,133.5],[33.2,133.0],[33.8,133.6],
            // Kyushu
            [33.9,130.9],[33.5,130.5],[33.2,131.0],[33.0,131.4],[32.7,131.7],
            [32.1,131.3],[31.4,131.0],[31.0,130.6],[31.3,131.4],[31.9,131.8],
            [32.7,130.8],[33.1,129.7],[33.6,130.2],
            // Kyushu interior
            [33.2,130.7],[32.8,131.0],[32.3,130.9],[31.7,131.1],[33.3,130.3],
            // Okinawa chain
            [26.3,127.8],[26.5,128.0],[26.1,127.6],[26.8,128.3],[27.4,128.6],
            [28.4,129.5],[29.5,129.9],[30.4,130.5]
        ];

        // Convert to radians
        var jpPoints = japanCoast.map(function(p) {
            return { latR: p[0] * Math.PI / 180, lonR: p[1] * Math.PI / 180, lat: p[0], lon: p[1] };
        });

        // Build mesh edges using proximity (Delaunay-like)
        var jpEdges = [];
        var maxEdgeDist = 2.5; // degrees — controls mesh density
        for (var i = 0; i < jpPoints.length; i++) {
            for (var j = i + 1; j < jpPoints.length; j++) {
                var dlat = japanCoast[i][0] - japanCoast[j][0];
                var dlon = japanCoast[i][1] - japanCoast[j][1];
                var dist = Math.sqrt(dlat * dlat + dlon * dlon);
                if (dist < maxEdgeDist) {
                    jpEdges.push([i, j]);
                }
            }
        }

        // World grid dots (sparse)
        var worldDots = [];
        for (var lat = -70; lat <= 70; lat += 6) {
            var lonStep = 6 / Math.cos(lat * Math.PI / 180);
            if (lonStep > 45) lonStep = 45;
            for (var lon = -180; lon < 180; lon += lonStep) {
                // Skip Japan region — Japan uses mesh instead
                if (lat >= 24 && lat <= 46 && lon >= 126 && lon <= 146) continue;
                worldDots.push({
                    latR: lat * Math.PI / 180,
                    lonR: lon * Math.PI / 180
                });
            }
        }

        // Floating particles around globe
        var floatingParticles = [];
        for (var i = 0; i < 50; i++) {
            var pLat = (Math.random() - 0.5) * Math.PI;
            var pLon = Math.random() * Math.PI * 2;
            floatingParticles.push({
                latR: pLat,
                lonR: pLon,
                speed: 0.001 + Math.random() * 0.002,
                size: 0.5 + Math.random() * 2,
                alpha: 0.2 + Math.random() * 0.5
            });
        }

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                // Globe structure
                outline: dark ? 'rgba(96,165,250,0.4)' : 'rgba(79,70,229,0.35)',
                globeFill: dark ? 'rgba(15,17,23,0.5)' : 'rgba(238,242,255,0.5)',
                worldDot: dark ? 'rgba(96,165,250,0.3)' : 'rgba(79,70,229,0.35)',
                // Japan mesh — BRIGHT
                meshLine: dark ? 'rgba(96,165,250,0.7)' : 'rgba(79,70,229,0.6)',
                meshDot: dark ? '#93c5fd' : '#4f46e5',
                meshGlow: dark ? 'rgba(96,165,250,0.9)' : 'rgba(79,70,229,0.8)',
                japanGlow: dark ? 'rgba(56,189,248,0.4)' : 'rgba(79,70,229,0.25)',
                // Cities
                labelBg: dark ? 'rgba(15,17,23,0.85)' : 'rgba(255,255,255,0.9)',
                labelText: dark ? '#e5e7eb' : '#1e293b',
                labelBorder: dark ? 'rgba(96,165,250,0.4)' : 'rgba(79,70,229,0.3)',
                // Particles
                particle: dark ? 'rgba(96,165,250,0.5)' : 'rgba(79,70,229,0.35)'
            };
        }

        var colors = getColors();

        function resize() {
            var rect = canvas.parentElement.getBoundingClientRect();
            var dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            W = rect.width;
            H = rect.height;
            cx = W / 2;
            cy = H / 2;
            radius = Math.min(W, H) * 0.58;
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
            var time = Date.now() * 0.001;

            // Gentle oscillation — Japan always stays visible
            rotY = baseRotY + Math.sin(time * 0.08) * 0.15;
            rotX = baseRotX + Math.sin(time * 0.05) * 0.05;

            // ── Globe body ──
            // Outer glow
            var outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.15);
            outerGlow.addColorStop(0, 'transparent');
            outerGlow.addColorStop(0.5, colors.outline);
            outerGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
            ctx.fill();

            // Globe fill
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.globeFill;
            ctx.fill();

            // Globe outline
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = colors.outline;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // ── World dots ──
            for (var i = 0; i < worldDots.length; i++) {
                var p = project(worldDots[i].latR, worldDots[i].lonR);
                if (p.z < 0.05) continue;
                ctx.globalAlpha = (0.3 + p.z * 0.7) * 0.8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
                ctx.fillStyle = colors.worldDot;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── Japan ambient glow ──
            var jCenter = project(36 * Math.PI / 180, 138 * Math.PI / 180);
            if (jCenter.z > 0) {
                var glowR = radius * 0.4;
                var jGlow = ctx.createRadialGradient(jCenter.x, jCenter.y, 0, jCenter.x, jCenter.y, glowR);
                jGlow.addColorStop(0, colors.japanGlow);
                jGlow.addColorStop(0.5, colors.japanGlow);
                jGlow.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.6 + Math.sin(time * 0.5) * 0.15;
                ctx.fillStyle = jGlow;
                ctx.beginPath();
                ctx.arc(jCenter.x, jCenter.y, glowR, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // ── Japan wireframe mesh ──
            // Project all Japan points
            var jpProj = [];
            for (var i = 0; i < jpPoints.length; i++) {
                jpProj.push(project(jpPoints[i].latR, jpPoints[i].lonR));
            }

            // Draw mesh edges (lines between connected points)
            ctx.lineCap = 'round';
            for (var i = 0; i < jpEdges.length; i++) {
                var a = jpProj[jpEdges[i][0]];
                var b = jpProj[jpEdges[i][1]];
                if (a.z < 0.05 || b.z < 0.05) continue;
                var avgZ = (a.z + b.z) / 2;
                ctx.globalAlpha = avgZ * 0.7;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = colors.meshLine;
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Draw mesh nodes (dots at coastline points)
            for (var i = 0; i < jpProj.length; i++) {
                var p = jpProj[i];
                if (p.z < 0.05) continue;

                // Glow around each node
                ctx.globalAlpha = p.z * 0.6;
                var nodeGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
                nodeGlow.addColorStop(0, colors.meshGlow);
                nodeGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = nodeGlow;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fill();

                // Dot
                ctx.globalAlpha = 0.8 + p.z * 0.2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = colors.meshDot;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── Floating particles ──
            for (var i = 0; i < floatingParticles.length; i++) {
                var fp = floatingParticles[i];
                fp.lonR += fp.speed;
                var p = project(fp.latR, fp.lonR);
                if (p.z < 0) continue;
                ctx.globalAlpha = fp.alpha * p.z;
                ctx.beginPath();
                ctx.arc(p.x, p.y, fp.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.particle;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── Connection arcs from Tokyo ──
            var tokyoP = project(cities[0].latR, cities[0].lonR);
            if (tokyoP.z > 0) {
                for (var i = 1; i < cities.length; i++) {
                    var cp = project(cities[i].latR, cities[i].lonR);
                    if (cp.z < 0) continue;
                    var mx = (tokyoP.x + cp.x) / 2;
                    var my = (tokyoP.y + cp.y) / 2 - 15;
                    ctx.beginPath();
                    ctx.moveTo(tokyoP.x, tokyoP.y);
                    ctx.quadraticCurveTo(mx, my, cp.x, cp.y);
                    ctx.strokeStyle = colors.meshLine;
                    ctx.lineWidth = 0.7;
                    ctx.globalAlpha = 0.4;
                    ctx.setLineDash([3, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    ctx.globalAlpha = 1;

                    // Traveling dot
                    var t = (Math.sin(time * 0.8 + i * 1.5) + 1) / 2;
                    var ax = (1-t)*(1-t)*tokyoP.x + 2*(1-t)*t*mx + t*t*cp.x;
                    var ay = (1-t)*(1-t)*tokyoP.y + 2*(1-t)*t*my + t*t*cp.y;
                    ctx.beginPath();
                    ctx.arc(ax, ay, 2, 0, Math.PI * 2);
                    ctx.fillStyle = cities[i].color;
                    ctx.globalAlpha = 0.9;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            // ── City markers with badge labels ──
            for (var i = 0; i < cities.length; i++) {
                var c = cities[i];
                var p = project(c.latR, c.lonR);
                if (p.z < 0) continue;

                var pulse = Math.sin(time + i * 0.9);

                // Glow pulse
                var glowSize = c.isHQ ? 35 + pulse * 8 : 20 + pulse * 5;
                var grdC = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                grdC.addColorStop(0, c.color);
                grdC.addColorStop(0.3, c.glow);
                grdC.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.5 + pulse * 0.2;
                ctx.fillStyle = grdC;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // Inner dot
                var dotR = c.isHQ ? 6 : 4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();

                // White center
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 3 : 1.8, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Badge label
                ctx.font = (c.isHQ ? '700 12px' : '500 10px') + ' Inter, -apple-system, sans-serif';
                var labelText = c.isHQ ? c.name : c.name;
                var textW = ctx.measureText(labelText).width;
                var badgeW = textW + (c.isHQ ? 20 : 14);
                var badgeH = c.isHQ ? 24 : 20;
                var badgeX = p.x - badgeW / 2;
                var badgeY = p.y + dotR + 6;

                // Badge background
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = colors.labelBg;
                ctx.strokeStyle = colors.labelBorder;
                ctx.lineWidth = 1;
                ctx.beginPath();
                var r = 4;
                ctx.moveTo(badgeX + r, badgeY);
                ctx.lineTo(badgeX + badgeW - r, badgeY);
                ctx.arcTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + r, r);
                ctx.lineTo(badgeX + badgeW, badgeY + badgeH - r);
                ctx.arcTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - r, badgeY + badgeH, r);
                ctx.lineTo(badgeX + r, badgeY + badgeH);
                ctx.arcTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r, r);
                ctx.lineTo(badgeX, badgeY + r);
                ctx.arcTo(badgeX, badgeY, badgeX + r, badgeY, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.globalAlpha = 1;

                // Badge text
                ctx.fillStyle = c.isHQ ? c.color : colors.labelText;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(labelText, p.x, badgeY + badgeH / 2);

                if (c.isHQ) {
                    ctx.font = '600 8px Inter, sans-serif';
                    ctx.fillStyle = c.color;
                    ctx.fillText('\u2605 HQ', p.x, badgeY + badgeH + 10);
                }
            }
            ctx.textBaseline = 'alphabetic';
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
