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

    // ── 3D Interactive Globe (Japan Focus, Full World) ───────────
    function initGlobe() {
        var canvas = document.getElementById('globeCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W, H, cx, cy, radius;
        // Start facing Japan
        var JAPAN_Y = 2.4; // Y rotation to center Japan
        var rotation = { x: -0.6, y: JAPAN_Y };
        var autoRotateDir = 1; // 1 = forward, -1 = backward
        var autoRotateSpeed = 0.0012;
        var rotateRange = 0.8; // Half-rotation range (radians) from center
        var isDragging = false;
        var lastMouse = { x: 0, y: 0 };

        // Japan cities (lat, lon) in radians
        var cities = [
            { name: 'Tokyo',     lat: 35.68, lon: 139.69, isHQ: true },
            { name: 'Osaka',     lat: 34.69, lon: 135.50, isHQ: false },
            { name: 'Nagoya',    lat: 35.18, lon: 136.91, isHQ: false },
            { name: 'Fukuoka',   lat: 33.59, lon: 130.40, isHQ: false },
            { name: 'Sapporo',   lat: 43.06, lon: 141.35, isHQ: false },
            { name: 'Sendai',    lat: 38.27, lon: 140.87, isHQ: false },
            { name: 'Hiroshima', lat: 34.39, lon: 132.46, isHQ: false }
        ].map(function(c) {
            c.latR = c.lat * Math.PI / 180;
            c.lonR = c.lon * Math.PI / 180;
            return c;
        });

        // Simplified world continent coastline data (lat, lon pairs)
        // Each sub-array is a separate coastline polyline
        var continents = [
            // East Asia (Japan, Korea, China coast)
            [[46,143],[44,145],[43,146],[42,145],[40,140],[38,139],[36,140],[35,140],[34,136],[33,131],[31,131],[30,130]],
            [[51,141],[50,143],[48,143],[46,143],[44,144],[43,146]],
            // Japan main islands (simplified)
            [[45,142],[44,144],[43,145],[42,143],[41,141],[40,140],[39,140],[38,139],[37,137],[36,137],[35,136],[34,135],[33,133],[32,132],[31,131]],
            [[34,129],[33,130],[32,131],[31,131]],
            // China/SE Asia coast
            [[40,120],[38,118],[36,121],[34,120],[30,122],[27,121],[25,119],[23,117],[21,110],[18,109],[15,109],[10,107],[8,105],[5,104],[2,104],[1,104]],
            // Korean peninsula
            [[43,130],[42,130],[39,128],[38,127],[37,126],[35,126],[34,127],[35,129],[37,129],[38,129],[40,129],[42,130]],
            // India
            [[24,69],[23,68],[21,70],[19,73],[17,74],[15,74],[12,75],[9,77],[8,77],[8,78],[10,80],[13,80],[15,80],[17,82],[19,85],[21,87],[22,89],[23,89],[24,89]],
            // Africa East
            [[30,32],[28,33],[25,35],[20,37],[15,40],[12,43],[10,45],[8,47],[5,45],[2,42],[-1,42],[-4,40],[-8,40],[-12,40],[-15,41],[-18,38],[-22,36],[-26,33],[-30,31],[-34,27],[-34,18]],
            // Africa West
            [[36,0],[34,-1],[33,-8],[30,-10],[26,-15],[22,-17],[18,-16],[15,-17],[12,-17],[8,-14],[5,-5],[5,0],[4,2],[5,5],[5,10],[3,10],[0,10],[-3,10],[-5,12]],
            // Europe
            [[36,0],[38,0],[40,-1],[42,-9],[44,-9],[44,-1],[46,-2],[47,-3],[49,-5],[51,-5],[52,-1],[53,1],[54,5],[55,8],[57,6],[58,10],[60,5],[62,5],[64,10],[66,14],[68,16],[70,20],[70,28],[68,30]],
            [[45,14],[44,15],[42,17],[41,17],[40,20],[38,22],[38,24],[40,25],[42,29],[43,28],[44,29],[45,30]],
            // North America East
            [[60,-65],[55,-60],[48,-53],[46,-56],[44,-63],[42,-70],[40,-74],[37,-76],[35,-76],[32,-80],[30,-82],[28,-82],[25,-80],[25,-81]],
            // North America West
            [[60,-140],[58,-137],[55,-133],[50,-128],[48,-125],[45,-124],[42,-124],[38,-123],[35,-120],[32,-117],[30,-115],[28,-113],[25,-110],[22,-106],[20,-105]],
            // South America East
            [[10,-62],[8,-60],[5,-51],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-20,-40],[-25,-48],[-30,-50],[-35,-57],[-40,-62],[-45,-65],[-50,-68],[-55,-68]],
            // South America West
            [[10,-75],[5,-77],[0,-80],[-5,-81],[-10,-78],[-15,-75],[-20,-70],[-25,-70],[-30,-72],[-35,-72],[-40,-72],[-45,-74],[-50,-75],[-55,-68]],
            // Australia
            [[-12,132],[-14,127],[-18,122],[-22,114],[-28,114],[-33,116],[-35,117],[-35,137],[-38,141],[-39,146],[-38,148],[-34,151],[-28,153],[-24,152],[-20,149],[-16,146],[-14,136],[-12,132]]
        ].map(function(coast) {
            return coast.map(function(p) {
                return { latR: p[0] * Math.PI / 180, lonR: p[1] * Math.PI / 180 };
            });
        });

        // Japan region highlight outline (more detailed)
        var japanHighlight = [
            [45,142],[44,144],[43,145],[42,143],[41,141],[40,140],[39,140],[38,139],
            [37,137],[36,137],[35,136],[34,135],[33,133],[32,131],[31,131],
            [33,130],[34,132],[35,135],[36,136],[37,137],[38,140],[39,140],
            [40,140],[41,141],[42,143],[43,145],[44,145],[45,142]
        ].map(function(p) {
            return { latR: p[0] * Math.PI / 180, lonR: p[1] * Math.PI / 180 };
        });

        // Generate wireframe grid
        var gridLines = [];
        for (var lat = -80; lat <= 80; lat += 20) {
            var pts = [];
            for (var lon = 0; lon <= 360; lon += 10) {
                pts.push({ latR: lat * Math.PI / 180, lonR: lon * Math.PI / 180 });
            }
            gridLines.push(pts);
        }
        for (var lon = 0; lon < 360; lon += 20) {
            var pts = [];
            for (var lat = -80; lat <= 80; lat += 10) {
                pts.push({ latR: lat * Math.PI / 180, lonR: lon * Math.PI / 180 });
            }
            gridLines.push(pts);
        }

        // Random node points scattered across globe (more of them)
        var nodes = [];
        for (var i = 0; i < 300; i++) {
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.acos(2 * Math.random() - 1);
            nodes.push({
                latR: phi - Math.PI / 2,
                lonR: theta,
                size: Math.random() * 1.5 + 0.5
            });
        }

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                grid: dark ? 'rgba(59,130,246,0.06)' : 'rgba(37,99,235,0.05)',
                node: dark ? 'rgba(59,130,246,0.35)' : 'rgba(37,99,235,0.2)',
                city: dark ? 'rgba(59,130,246,0.9)' : 'rgba(37,99,235,0.8)',
                cityGlow: dark ? 'rgba(59,130,246,0.4)' : 'rgba(37,99,235,0.25)',
                hq: '#f59e0b',
                hqGlow: 'rgba(245,158,11,0.4)',
                line: dark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.06)',
                outline: dark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.15)',
                label: dark ? 'rgba(229,231,235,0.9)' : 'rgba(17,24,39,0.75)',
                coast: dark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.15)',
                japanGlow: dark ? 'rgba(59,130,246,0.35)' : 'rgba(37,99,235,0.25)',
                japanCoast: dark ? 'rgba(59,130,246,0.6)' : 'rgba(37,99,235,0.5)'
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
            radius = Math.min(W, H) * 0.46;
        }

        function project(latR, lonR) {
            var x3 = Math.cos(latR) * Math.cos(lonR + rotation.y);
            var y3 = Math.sin(latR);
            var z3 = Math.cos(latR) * Math.sin(lonR + rotation.y);
            var y3r = y3 * Math.cos(rotation.x) - z3 * Math.sin(rotation.x);
            var z3r = y3 * Math.sin(rotation.x) + z3 * Math.cos(rotation.x);
            return {
                x: cx + x3 * radius,
                y: cy - y3r * radius,
                z: z3r,
                visible: z3r > -0.1
            };
        }

        function drawPolyline(points, color, width) {
            ctx.beginPath();
            var started = false;
            for (var j = 0; j < points.length; j++) {
                var p = project(points[j].latR, points[j].lonR);
                if (p.visible) {
                    if (!started) { ctx.moveTo(p.x, p.y); started = true; }
                    else ctx.lineTo(p.x, p.y);
                } else {
                    started = false;
                }
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Globe outline circle
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = colors.outline;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Subtle sphere fill
            var grd = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
            grd.addColorStop(0, colors.grid);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.fill();

            // Grid lines
            ctx.lineWidth = 0.4;
            for (var i = 0; i < gridLines.length; i++) {
                drawPolyline(gridLines[i], colors.grid, 0.4);
            }

            // World continent coastlines
            for (var i = 0; i < continents.length; i++) {
                drawPolyline(continents[i], colors.coast, 1);
            }

            // Japan highlight — draw thicker, brighter coastline
            drawPolyline(japanHighlight, colors.japanCoast, 2.5);

            // Japan region glow effect
            var japanCenter = project(36 * Math.PI / 180, 138 * Math.PI / 180);
            if (japanCenter.visible && japanCenter.z > 0) {
                var glowR = radius * 0.12;
                var grd2 = ctx.createRadialGradient(japanCenter.x, japanCenter.y, 0, japanCenter.x, japanCenter.y, glowR);
                grd2.addColorStop(0, colors.japanGlow);
                grd2.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(japanCenter.x, japanCenter.y, glowR, 0, Math.PI * 2);
                ctx.fillStyle = grd2;
                ctx.fill();
            }

            // Scattered nodes
            for (var i = 0; i < nodes.length; i++) {
                var p = project(nodes[i].latR, nodes[i].lonR);
                if (p.visible && p.z > 0) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, nodes[i].size, 0, Math.PI * 2);
                    ctx.fillStyle = colors.node;
                    ctx.globalAlpha = p.z * 0.5;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            // Connection lines between nearby visible nodes
            ctx.lineWidth = 0.3;
            for (var i = 0; i < nodes.length; i++) {
                var p1 = project(nodes[i].latR, nodes[i].lonR);
                if (!p1.visible || p1.z < 0.1) continue;
                for (var j = i + 1; j < nodes.length && j < i + 8; j++) {
                    var p2 = project(nodes[j].latR, nodes[j].lonR);
                    if (!p2.visible || p2.z < 0.1) continue;
                    var dx = p1.x - p2.x, dy = p1.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius * 0.25) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = colors.line;
                        ctx.globalAlpha = (1 - dist / (radius * 0.25)) * Math.min(p1.z, p2.z);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }

            // City dots + labels (drawn last so they're on top)
            var time = Date.now() * 0.003;
            for (var i = 0; i < cities.length; i++) {
                var c = cities[i];
                var p = project(c.latR, c.lonR);
                if (!p.visible || p.z < 0) continue;
                var dotColor = c.isHQ ? colors.hq : colors.city;
                var glowColor = c.isHQ ? colors.hqGlow : colors.cityGlow;
                var pulseR = 4 + Math.sin(time + i) * 2;

                // Glow pulse
                ctx.beginPath();
                ctx.arc(p.x, p.y, pulseR * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = glowColor;
                ctx.globalAlpha = 0.35 + Math.sin(time + i) * 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Inner dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 6 : 4, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.fill();

                // White center
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 2.5 : 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Label
                ctx.font = (c.isHQ ? '700 12px' : '500 10px') + ' Inter, sans-serif';
                ctx.fillStyle = c.isHQ ? colors.hq : colors.label;
                ctx.textAlign = 'center';
                ctx.fillText(c.name, p.x, p.y + (c.isHQ ? 20 : 17));
            }

            // City connection lines (Tokyo to other cities)
            var tokyoP = project(cities[0].latR, cities[0].lonR);
            if (tokyoP.visible && tokyoP.z > 0) {
                for (var i = 1; i < cities.length; i++) {
                    var cp = project(cities[i].latR, cities[i].lonR);
                    if (!cp.visible || cp.z < 0) continue;
                    ctx.beginPath();
                    ctx.moveTo(tokyoP.x, tokyoP.y);
                    var mx = (tokyoP.x + cp.x) / 2;
                    var my = (tokyoP.y + cp.y) / 2 - 25;
                    ctx.quadraticCurveTo(mx, my, cp.x, cp.y);
                    ctx.strokeStyle = colors.hqGlow;
                    ctx.lineWidth = 1.2;
                    ctx.globalAlpha = 0.5;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }

        function animate() {
            if (!isDragging) {
                rotation.y += autoRotateSpeed * autoRotateDir;
                // Oscillate: reverse direction when too far from Japan center
                if (rotation.y > JAPAN_Y + rotateRange) autoRotateDir = -1;
                else if (rotation.y < JAPAN_Y - rotateRange) autoRotateDir = 1;
            }
            draw();
            requestAnimationFrame(animate);
        }

        // Mouse drag to rotate
        canvas.addEventListener('mousedown', function(e) {
            isDragging = true;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
        });
        window.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            var dx = e.clientX - lastMouse.x;
            var dy = e.clientY - lastMouse.y;
            rotation.y += dx * 0.005;
            rotation.x += dy * 0.005;
            rotation.x = Math.max(-1.2, Math.min(1.2, rotation.x));
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
        });
        window.addEventListener('mouseup', function() { isDragging = false; });

        // Touch support
        canvas.addEventListener('touchstart', function(e) {
            isDragging = true;
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
        }, { passive: true });
        canvas.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            var dx = e.touches[0].clientX - lastMouse.x;
            var dy = e.touches[0].clientY - lastMouse.y;
            rotation.y += dx * 0.005;
            rotation.x += dy * 0.005;
            rotation.x = Math.max(-1.2, Math.min(1.2, rotation.x));
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
        }, { passive: true });
        canvas.addEventListener('touchend', function() { isDragging = false; });

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
