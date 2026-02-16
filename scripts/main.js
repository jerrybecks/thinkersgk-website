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

    // ── Morphing Particle Network ──────────────────
    // Particles float freely, then morph into service-related shapes.
    // Each service page defines its shapes via data-particle-shapes attribute.
    // Shapes cycle automatically: free → shape1 → free → shape2 → ...

    // Shape library: arrays of [x, y] normalized 0-1, centered at (0.5, 0.5)
    var PARTICLE_SHAPES = {
        // Shield — Cybersecurity
        shield: (function() {
            var pts = [];
            // Shield outline
            var outline = [[0.5,0.08],[0.15,0.22],[0.15,0.5],[0.22,0.65],[0.35,0.78],[0.5,0.92],[0.65,0.78],[0.78,0.65],[0.85,0.5],[0.85,0.22],[0.5,0.08]];
            for (var i = 0; i < outline.length - 1; i++) {
                var steps = 5;
                for (var s = 0; s < steps; s++) {
                    var t = s / steps;
                    pts.push([outline[i][0]+(outline[i+1][0]-outline[i][0])*t, outline[i][1]+(outline[i+1][1]-outline[i][1])*t]);
                }
            }
            // Checkmark inside
            var check = [[0.35,0.48],[0.45,0.6],[0.65,0.35]];
            for (var i = 0; i < check.length - 1; i++) {
                for (var s = 0; s < 6; s++) {
                    var t = s / 6;
                    pts.push([check[i][0]+(check[i+1][0]-check[i][0])*t, check[i][1]+(check[i+1][1]-check[i][1])*t]);
                }
            }
            return pts;
        })(),

        // Cloud — Cloud Consulting
        cloud: (function() {
            var pts = [];
            // Cloud shape using circles
            var centers = [[0.35,0.45,0.18],[0.55,0.35,0.22],[0.72,0.45,0.16],[0.5,0.55,0.14]];
            for (var c = 0; c < centers.length; c++) {
                var cx = centers[c][0], cy = centers[c][1], r = centers[c][2];
                for (var a = 0; a < Math.PI * 2; a += 0.35) {
                    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8]);
                }
            }
            // Base line
            for (var x = 0.2; x <= 0.8; x += 0.04) pts.push([x, 0.62]);
            return pts;
        })(),

        // Monitor/Screen — IT Support
        monitor: (function() {
            var pts = [];
            // Screen rectangle
            for (var x = 0.2; x <= 0.8; x += 0.04) { pts.push([x, 0.18]); pts.push([x, 0.62]); }
            for (var y = 0.18; y <= 0.62; y += 0.04) { pts.push([0.2, y]); pts.push([0.8, y]); }
            // Stand
            pts.push([0.45,0.65]); pts.push([0.5,0.7]); pts.push([0.55,0.65]);
            pts.push([0.45,0.72]); pts.push([0.5,0.75]); pts.push([0.55,0.72]);
            // Base
            for (var x = 0.35; x <= 0.65; x += 0.03) pts.push([x, 0.78]);
            // Screen content lines
            for (var x = 0.28; x <= 0.55; x += 0.04) pts.push([x, 0.3]);
            for (var x = 0.28; x <= 0.65; x += 0.04) pts.push([x, 0.38]);
            for (var x = 0.28; x <= 0.48; x += 0.04) pts.push([x, 0.46]);
            return pts;
        })(),

        // Wrench/Gear — Field Engineering
        gear: (function() {
            var pts = [];
            var cx = 0.5, cy = 0.45;
            // Outer gear teeth
            for (var a = 0; a < Math.PI * 2; a += 0.12) {
                var tooth = (Math.floor(a / 0.5) % 2 === 0) ? 0.32 : 0.26;
                pts.push([cx + Math.cos(a) * tooth, cy + Math.sin(a) * tooth]);
            }
            // Inner circle
            for (var a = 0; a < Math.PI * 2; a += 0.4) {
                pts.push([cx + Math.cos(a) * 0.1, cy + Math.sin(a) * 0.1]);
            }
            // Wrench handle extending down
            for (var y = 0.6; y <= 0.88; y += 0.04) { pts.push([0.48, y]); pts.push([0.52, y]); }
            return pts;
        })(),

        // Network nodes — Networking
        network: (function() {
            var pts = [];
            // Central hub
            var hub = [0.5, 0.45];
            for (var a = 0; a < Math.PI * 2; a += 0.4) pts.push([hub[0]+Math.cos(a)*0.06, hub[1]+Math.sin(a)*0.06]);
            // 6 outer nodes
            var nodes = [];
            for (var i = 0; i < 6; i++) {
                var angle = i * Math.PI / 3 - Math.PI / 6;
                var nx = hub[0] + Math.cos(angle) * 0.32;
                var ny = hub[1] + Math.sin(angle) * 0.32;
                nodes.push([nx, ny]);
                // Node circle
                for (var a = 0; a < Math.PI * 2; a += 0.6) pts.push([nx+Math.cos(a)*0.04, ny+Math.sin(a)*0.04]);
                // Connection line to hub
                for (var t = 0.15; t < 0.85; t += 0.12) {
                    pts.push([hub[0]+(nx-hub[0])*t, hub[1]+(ny-hub[1])*t]);
                }
            }
            return pts;
        })(),

        // Lock — Access Control
        lock: (function() {
            var pts = [];
            // Lock body (rectangle)
            for (var x = 0.3; x <= 0.7; x += 0.04) { pts.push([x, 0.45]); pts.push([x, 0.82]); }
            for (var y = 0.45; y <= 0.82; y += 0.04) { pts.push([0.3, y]); pts.push([0.7, y]); }
            // Shackle (arch)
            for (var a = 0; a <= Math.PI; a += 0.15) {
                pts.push([0.5 + Math.cos(a) * 0.15, 0.45 - Math.sin(a) * 0.22]);
            }
            // Keyhole
            for (var a = 0; a < Math.PI * 2; a += 0.5) pts.push([0.5+Math.cos(a)*0.05, 0.58+Math.sin(a)*0.05]);
            pts.push([0.5, 0.65]); pts.push([0.5, 0.72]);
            return pts;
        })(),

        // Server stack — Managed Services
        server: (function() {
            var pts = [];
            for (var row = 0; row < 3; row++) {
                var y0 = 0.18 + row * 0.24;
                // Box outline
                for (var x = 0.22; x <= 0.78; x += 0.04) { pts.push([x, y0]); pts.push([x, y0 + 0.18]); }
                for (var y = y0; y <= y0 + 0.18; y += 0.04) { pts.push([0.22, y]); pts.push([0.78, y]); }
                // LED dots
                pts.push([0.3, y0 + 0.09]); pts.push([0.36, y0 + 0.09]);
                // Drive bay lines
                for (var x = 0.55; x <= 0.72; x += 0.04) pts.push([x, y0 + 0.09]);
            }
            return pts;
        })(),

        // Headset — Service Desk
        headset: (function() {
            var pts = [];
            // Head arc
            for (var a = 0.3; a <= Math.PI - 0.3; a += 0.12) {
                pts.push([0.5 + Math.cos(a) * 0.28, 0.45 - Math.sin(a) * 0.3]);
            }
            // Left earpiece
            for (var y = 0.38; y <= 0.58; y += 0.03) { pts.push([0.22, y]); pts.push([0.28, y]); }
            // Right earpiece
            for (var y = 0.38; y <= 0.58; y += 0.03) { pts.push([0.72, y]); pts.push([0.78, y]); }
            // Mic boom
            for (var a = 0; a <= 1.2; a += 0.12) {
                pts.push([0.22 - Math.sin(a) * 0.1, 0.55 + a * 0.15]);
            }
            // Mic circle
            for (var a = 0; a < Math.PI * 2; a += 0.5) pts.push([0.14+Math.cos(a)*0.04, 0.76+Math.sin(a)*0.04]);
            return pts;
        })(),

        // Hard drive — Data Backup
        harddrive: (function() {
            var pts = [];
            // Drive body
            for (var x = 0.2; x <= 0.8; x += 0.04) { pts.push([x, 0.25]); pts.push([x, 0.75]); }
            for (var y = 0.25; y <= 0.75; y += 0.04) { pts.push([0.2, y]); pts.push([0.8, y]); }
            // Platter circles
            for (var a = 0; a < Math.PI * 2; a += 0.3) {
                pts.push([0.48 + Math.cos(a) * 0.18, 0.48 + Math.sin(a) * 0.18]);
                pts.push([0.48 + Math.cos(a) * 0.1, 0.48 + Math.sin(a) * 0.1]);
            }
            // Read arm
            pts.push([0.68, 0.35]); pts.push([0.62, 0.42]); pts.push([0.55, 0.48]);
            return pts;
        })(),

        // Box with arrow — Asset Lifecycle / Relocation
        box: (function() {
            var pts = [];
            // Box
            for (var x = 0.25; x <= 0.75; x += 0.04) { pts.push([x, 0.35]); pts.push([x, 0.8]); }
            for (var y = 0.35; y <= 0.8; y += 0.04) { pts.push([0.25, y]); pts.push([0.75, y]); }
            // Flaps
            pts.push([0.25,0.35]); pts.push([0.35,0.22]); pts.push([0.5,0.28]);
            pts.push([0.75,0.35]); pts.push([0.65,0.22]); pts.push([0.5,0.28]);
            // Arrow up
            for (var y = 0.72; y >= 0.48; y -= 0.04) pts.push([0.5, y]);
            pts.push([0.42,0.55]); pts.push([0.5,0.45]); pts.push([0.58,0.55]);
            return pts;
        })(),

        // Clipboard — Project Management
        clipboard: (function() {
            var pts = [];
            // Board
            for (var x = 0.28; x <= 0.72; x += 0.04) { pts.push([x, 0.2]); pts.push([x, 0.88]); }
            for (var y = 0.2; y <= 0.88; y += 0.04) { pts.push([0.28, y]); pts.push([0.72, y]); }
            // Clip at top
            for (var x = 0.4; x <= 0.6; x += 0.03) { pts.push([x, 0.14]); pts.push([x, 0.24]); }
            // Checklist lines
            for (var row = 0; row < 4; row++) {
                var ly = 0.35 + row * 0.13;
                pts.push([0.36, ly]); pts.push([0.38, ly + 0.03]); pts.push([0.42, ly - 0.02]); // checkmark
                for (var x = 0.46; x <= 0.64; x += 0.04) pts.push([x, ly]);
            }
            return pts;
        })(),

        // Wifi signal — Wireless Survey
        wifi: (function() {
            var pts = [];
            // Signal arcs
            for (var ring = 1; ring <= 3; ring++) {
                var r = ring * 0.12;
                for (var a = 0.6; a <= Math.PI - 0.6; a += 0.1) {
                    pts.push([0.5 + Math.cos(a) * r, 0.6 - Math.sin(a) * r]);
                }
            }
            // Center dot
            for (var a = 0; a < Math.PI * 2; a += 0.5) pts.push([0.5+Math.cos(a)*0.03, 0.62+Math.sin(a)*0.03]);
            // Base device
            for (var x = 0.35; x <= 0.65; x += 0.03) pts.push([x, 0.78]);
            for (var x = 0.38; x <= 0.62; x += 0.03) pts.push([x, 0.82]);
            return pts;
        })(),

        // Speaker — AV Solutions
        speaker: (function() {
            var pts = [];
            // Speaker body
            for (var x = 0.25; x <= 0.45; x += 0.04) { pts.push([x, 0.25]); pts.push([x, 0.75]); }
            for (var y = 0.25; y <= 0.75; y += 0.04) { pts.push([0.25, y]); pts.push([0.45, y]); }
            // Sound cone
            pts.push([0.45,0.35]); pts.push([0.55,0.25]); pts.push([0.55,0.75]); pts.push([0.45,0.65]);
            // Sound waves
            for (var ring = 1; ring <= 3; ring++) {
                var r = ring * 0.08;
                for (var a = -0.8; a <= 0.8; a += 0.12) {
                    pts.push([0.58 + r + Math.cos(a) * r * 0.3, 0.5 + Math.sin(a) * r * 1.5]);
                }
            }
            return pts;
        })(),

        // Phone — VoIP
        phone: (function() {
            var pts = [];
            // Handset shape
            for (var a = 0.3; a <= Math.PI - 0.3; a += 0.12) {
                pts.push([0.5 + Math.cos(a) * 0.25, 0.42 - Math.sin(a) * 0.12]);
            }
            // Left earpiece
            for (var y = 0.38; y <= 0.52; y += 0.03) pts.push([0.26, y]);
            // Right earpiece
            for (var y = 0.38; y <= 0.52; y += 0.03) pts.push([0.74, y]);
            // Signal waves
            for (var ring = 1; ring <= 2; ring++) {
                var r = ring * 0.06;
                for (var a = 0.5; a <= Math.PI - 0.5; a += 0.15) {
                    pts.push([0.5 + Math.cos(a) * r, 0.3 - Math.sin(a) * r]);
                }
            }
            // Keypad dots
            for (var row = 0; row < 4; row++) {
                for (var col = 0; col < 3; col++) {
                    pts.push([0.4 + col * 0.1, 0.58 + row * 0.08]);
                }
            }
            return pts;
        })(),

        // Graduation cap — Training
        gradcap: (function() {
            var pts = [];
            // Cap top (diamond)
            var top = [[0.5,0.2],[0.15,0.38],[0.5,0.5],[0.85,0.38],[0.5,0.2]];
            for (var i = 0; i < top.length - 1; i++) {
                for (var s = 0; s < 6; s++) {
                    var t = s / 6;
                    pts.push([top[i][0]+(top[i+1][0]-top[i][0])*t, top[i][1]+(top[i+1][1]-top[i][1])*t]);
                }
            }
            // Board underneath
            for (var x = 0.25; x <= 0.75; x += 0.04) pts.push([x, 0.52]);
            // Tassel
            for (var y = 0.38; y <= 0.68; y += 0.04) pts.push([0.85, y]);
            pts.push([0.82, 0.68]); pts.push([0.85, 0.72]); pts.push([0.88, 0.68]);
            return pts;
        })(),

        // Wrench and screwdriver — Hardware Maintenance
        tools: (function() {
            var pts = [];
            // Wrench (left)
            for (var y = 0.2; y <= 0.75; y += 0.04) pts.push([0.38, y]);
            for (var a = 0; a < Math.PI * 2; a += 0.4) pts.push([0.38+Math.cos(a)*0.08, 0.2+Math.sin(a)*0.06]);
            // Screwdriver (right, angled)
            for (var t = 0; t <= 1; t += 0.06) {
                pts.push([0.52 + t * 0.15, 0.2 + t * 0.55]);
            }
            // Handle
            for (var t = 0; t <= 0.15; t += 0.04) {
                pts.push([0.52 + t, 0.2 + t * 0.5]);
                pts.push([0.56 + t, 0.22 + t * 0.5]);
            }
            // Tip
            pts.push([0.67, 0.75]); pts.push([0.68, 0.8]);
            return pts;
        })(),

        // Truck — Onsite Dispatch
        truck: (function() {
            var pts = [];
            // Cargo body
            for (var x = 0.15; x <= 0.55; x += 0.04) { pts.push([x, 0.3]); pts.push([x, 0.65]); }
            for (var y = 0.3; y <= 0.65; y += 0.04) { pts.push([0.15, y]); pts.push([0.55, y]); }
            // Cab
            for (var x = 0.55; x <= 0.78; x += 0.04) pts.push([x, 0.65]);
            for (var y = 0.42; y <= 0.65; y += 0.04) { pts.push([0.55, y]); pts.push([0.78, y]); }
            pts.push([0.78, 0.42]); pts.push([0.68, 0.42]); pts.push([0.55, 0.42]);
            // Windshield
            pts.push([0.62, 0.45]); pts.push([0.74, 0.45]); pts.push([0.74, 0.55]); pts.push([0.62, 0.55]);
            // Wheels
            for (var a = 0; a < Math.PI * 2; a += 0.4) {
                pts.push([0.3+Math.cos(a)*0.06, 0.7+Math.sin(a)*0.06]);
                pts.push([0.68+Math.cos(a)*0.06, 0.7+Math.sin(a)*0.06]);
            }
            return pts;
        })(),

        // Thinkers GK logo text approximation (T-shaped)
        logo: (function() {
            var pts = [];
            // "T" shape — dominant letter
            for (var x = 0.15; x <= 0.85; x += 0.02) pts.push([x, 0.3]);  // top bar
            for (var x = 0.15; x <= 0.85; x += 0.02) pts.push([x, 0.33]); // top bar thickness
            for (var y = 0.33; y <= 0.7; y += 0.02) { pts.push([0.48, y]); pts.push([0.52, y]); } // stem
            // Sunrise/rays above (logo icon approximation)
            for (var a = 0.2; a <= Math.PI - 0.2; a += 0.15) {
                var r = 0.15;
                pts.push([0.5 + Math.cos(a) * r, 0.2 - Math.sin(a) * r]);
                pts.push([0.5 + Math.cos(a) * (r + 0.04), 0.2 - Math.sin(a) * (r + 0.04)]);
            }
            // Underline
            for (var x = 0.25; x <= 0.75; x += 0.02) pts.push([x, 0.74]);
            return pts;
        })()
    };

    // Map service page IDs to shape sequences
    var SERVICE_SHAPE_MAP = {
        'cybersecurity':        ['shield', 'network', 'lock'],
        'it-support':           ['monitor', 'headset', 'network'],
        'field-engineering':    ['gear', 'tools', 'truck'],
        'cloud-consulting':     ['cloud', 'server', 'network'],
        'managed-services':     ['server', 'monitor', 'gear'],
        'asset-lifecycle':      ['box', 'clipboard', 'harddrive'],
        'onsite-dispatch':      ['truck', 'gear', 'tools'],
        'office-relocation':    ['box', 'truck', 'monitor'],
        'project-management':   ['clipboard', 'gear', 'network'],
        'wireless-survey':      ['wifi', 'network', 'monitor'],
        'av-solutions':         ['speaker', 'monitor', 'wifi'],
        'voip':                 ['phone', 'network', 'cloud'],
        'networking':           ['network', 'server', 'cloud'],
        'access-control':       ['lock', 'shield', 'monitor'],
        'data-backup':          ['harddrive', 'server', 'cloud'],
        'cybersecurity-training': ['gradcap', 'shield', 'lock'],
        'hardware-maintenance': ['tools', 'gear', 'server'],
        'service-desk':         ['headset', 'monitor', 'network'],
        // Main services page + homepage get logo
        'services-main':        ['logo', 'network', 'shield', 'cloud'],
        'homepage':             ['logo', 'network', 'cloud', 'shield']
    };

    function initParticleNetwork() {
        var canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var particles = [];
        var mouse = { x: null, y: null };
        var count = window.innerWidth < 768 ? 50 : 100;
        var connectDist = 150;
        var mouseRadius = 120;
        var mouseScatterForce = 4;

        // Determine which shapes to cycle through
        var shapeAttr = canvas.getAttribute('data-particle-shapes');
        var shapeKeys = shapeAttr ? shapeAttr.split(',') : ['homepage'];
        var shapeCycle = SERVICE_SHAPE_MAP[shapeKeys[0]] || SERVICE_SHAPE_MAP['homepage'];

        // Timing
        var FREE_DURATION = 3000;    // ms floating free
        var MORPH_DURATION = 1500;   // ms transition to shape
        var HOLD_DURATION = 2500;    // ms holding shape
        var UNMORPH_DURATION = 1200; // ms transition back to free
        var CYCLE_DURATION = FREE_DURATION + MORPH_DURATION + HOLD_DURATION + UNMORPH_DURATION;

        var currentShapeIdx = 0;
        var cycleStart = Date.now();

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                particle: dark ? 'rgba(59,130,246,0.7)' : 'rgba(37,99,235,0.5)',
                particleShape: dark ? 'rgba(96,165,250,0.95)' : 'rgba(79,70,229,0.85)',
                line: dark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.06)',
                lineShape: dark ? 'rgba(96,165,250,0.25)' : 'rgba(79,70,229,0.15)',
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
            assignTargets();
        }

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function Particle(i) {
            this.x = Math.random() * (pW || 800);
            this.y = Math.random() * (pH || 400);
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.r = Math.random() * 1.5 + 0.8;
            this.baseR = this.r;
            this.tx = this.x; // target x
            this.ty = this.y; // target y
            this.idx = i;
        }

        function assignTargets() {
            if (!pW || !pH) return;
            var shape = PARTICLE_SHAPES[shapeCycle[currentShapeIdx]] || PARTICLE_SHAPES.logo;
            // Scale shape to fit canvas center-right area
            var shapeW = Math.min(pW * 0.4, pH * 0.7);
            var shapeCx = pW * 0.55;
            var shapeCy = pH * 0.5;

            for (var i = 0; i < particles.length; i++) {
                if (i < shape.length) {
                    particles[i].tx = shapeCx + (shape[i][0] - 0.5) * shapeW;
                    particles[i].ty = shapeCy + (shape[i][1] - 0.5) * shapeW;
                } else {
                    // Extra particles get random positions near the shape
                    var angle = Math.random() * Math.PI * 2;
                    var dist = shapeW * 0.5 + Math.random() * shapeW * 0.4;
                    particles[i].tx = shapeCx + Math.cos(angle) * dist;
                    particles[i].ty = shapeCy + Math.sin(angle) * dist;
                }
            }
        }

        function init() {
            particles = [];
            for (var i = 0; i < count; i++) particles.push(new Particle(i));
            assignTargets();
        }

        function getMorphProgress() {
            var elapsed = (Date.now() - cycleStart) % CYCLE_DURATION;
            if (elapsed < FREE_DURATION) {
                return 0; // floating free
            } else if (elapsed < FREE_DURATION + MORPH_DURATION) {
                return easeInOutCubic((elapsed - FREE_DURATION) / MORPH_DURATION);
            } else if (elapsed < FREE_DURATION + MORPH_DURATION + HOLD_DURATION) {
                return 1; // holding shape
            } else {
                return 1 - easeInOutCubic((elapsed - FREE_DURATION - MORPH_DURATION - HOLD_DURATION) / UNMORPH_DURATION);
            }
        }

        function checkShapeCycle() {
            var elapsed = Date.now() - cycleStart;
            if (elapsed >= CYCLE_DURATION) {
                cycleStart = Date.now();
                currentShapeIdx = (currentShapeIdx + 1) % shapeCycle.length;
                assignTargets();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, pW, pH);
            var morphT = getMorphProgress();
            checkShapeCycle();

            // Update and draw particles
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];

                // Free movement
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > pW) p.vx *= -1;
                if (p.y < 0 || p.y > pH) p.vy *= -1;

                // Morph toward target
                if (morphT > 0) {
                    var freeX = p.x;
                    var freeY = p.y;
                    p.x = freeX + (p.tx - freeX) * morphT;
                    p.y = freeY + (p.ty - freeY) * morphT;
                }

                // Mouse scatter — push particles AWAY from cursor
                if (mouse.x !== null) {
                    var dx = p.x - mouse.x;
                    var dy = p.y - mouse.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouseRadius && dist > 0) {
                        var force = (1 - dist / mouseRadius) * mouseScatterForce;
                        p.x += (dx / dist) * force;
                        p.y += (dy / dist) * force;
                    }
                }

                // Draw particle — brighter when in shape
                var particleAlpha = morphT > 0.3 ? 1 : 0.7;
                p.r = p.baseR * (1 + morphT * 0.5);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = morphT > 0.5 ? colors.particleShape : colors.particle;
                ctx.globalAlpha = particleAlpha;
                ctx.fill();

                // Glow when morphed
                if (morphT > 0.5) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                    var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
                    glow.addColorStop(0, colors.particleShape);
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.globalAlpha = 0.15 * morphT;
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;

            // Draw connection lines
            var lineColor = morphT > 0.5 ? colors.lineShape : colors.line;
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    var threshold = connectDist * (1 - morphT * 0.3);
                    if (dist < threshold) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = (1 - dist / threshold) * (1 + morphT);
                        ctx.stroke();
                    }
                }
                // Mouse lines
                if (mouse.x !== null) {
                    var dx2 = particles[i].x - mouse.x;
                    var dy2 = particles[i].y - mouse.y;
                    var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                    if (dist2 < mouseRadius * 1.5) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = colors.mouseLine;
                        ctx.lineWidth = 1 - dist2 / (mouseRadius * 1.5);
                        ctx.stroke();
                    }
                }
            }

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

    // ── 3D Globe — Zoomed-in Teal/Cyan Japan with Dense Wireframe ──
    function initGlobe() {
        var canvas = document.getElementById('globeCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W, H, globeR, globeCx, globeCy;

        // Rotation: centered on Japan (lon 138°)
        // rotY = π/2 - lonR puts Japan at max z (facing camera)
        var baseRotY = -0.84;
        var baseRotX = 0.12;
        var rotY = baseRotY, rotX = baseRotX;

        var cities = [
            { name: 'Tokyo',     lat: 35.68, lon: 139.69, isHQ: true,  color: '#f5b731' },
            { name: 'Osaka',     lat: 34.69, lon: 135.50, isHQ: false, color: '#22d3ee' },
            { name: 'Nagoya',    lat: 35.18, lon: 136.91, isHQ: false, color: '#22d3ee' },
            { name: 'Fukuoka',   lat: 33.59, lon: 130.40, isHQ: false, color: '#22d3ee' },
            { name: 'Sapporo',   lat: 43.06, lon: 141.35, isHQ: false, color: '#22d3ee' },
            { name: 'Sendai',    lat: 38.27, lon: 140.87, isHQ: false, color: '#22d3ee' },
            { name: 'Hiroshima', lat: 34.39, lon: 132.46, isHQ: false, color: '#22d3ee' },
            { name: 'Naha',      lat: 26.33, lon: 127.80, isHQ: false, color: '#22d3ee' }
        ].map(function(c) { c.latR = c.lat * Math.PI / 180; c.lonR = c.lon * Math.PI / 180; return c; });

        // Dense Japan coastline (~120 pts)
        var japanCoast = [
            [45.5,141.9],[45.3,141.0],[44.0,144.4],[43.4,145.5],[43.3,145.6],[42.9,144.8],
            [42.0,143.2],[42.3,140.3],[42.8,140.1],[43.1,140.9],[43.3,141.4],[43.4,141.6],
            [43.7,142.4],[44.4,143.2],[44.9,142.5],[45.1,141.7],
            [43.1,141.3],[43.8,143.4],[44.0,142.0],[42.9,141.3],[43.5,141.9],
            [41.8,140.7],[41.4,140.3],[40.9,140.0],[40.5,139.9],[40.0,139.8],
            [39.7,139.9],[39.4,140.0],[39.0,139.8],[38.9,139.8],[38.3,138.8],
            [38.7,140.9],[39.6,140.5],[40.2,140.1],[40.5,140.7],[41.0,141.4],
            [41.5,141.0],[41.8,140.7],
            [39.5,140.2],[38.5,140.3],[37.5,140.0],[37.9,139.5],[38.2,140.0],
            [40.8,140.5],[39.8,140.1],[37.0,140.5],
            [37.9,138.2],[37.5,138.8],[37.0,138.5],[36.8,137.0],[36.6,136.7],
            [36.2,136.1],[35.7,135.8],[35.5,136.2],[35.2,136.7],[35.0,137.0],
            [35.7,139.8],[35.3,139.6],[35.1,139.8],[34.7,139.4],
            [36.3,139.5],[36.0,140.0],[35.8,139.3],[36.5,139.8],[36.1,139.0],
            [36.8,139.4],[37.1,139.2],
            [34.6,138.9],[34.3,137.7],[34.0,136.8],[33.5,135.8],[33.4,135.5],
            [34.2,135.2],[34.7,135.4],[34.8,134.2],[34.2,134.0],[33.8,133.5],
            [35.5,134.2],[35.3,133.0],[35.4,132.8],[35.0,132.0],[34.8,131.4],
            [34.4,131.0],[34.0,130.9],[33.9,131.0],
            [35.1,133.4],[34.8,132.5],[34.5,132.0],[35.3,133.5],[34.2,131.8],
            [34.3,134.0],[33.9,133.0],[33.5,132.5],[33.0,132.8],[33.3,133.5],
            [33.6,134.2],[34.0,134.6],[33.6,133.5],[33.2,133.0],[33.8,133.6],
            [33.9,130.9],[33.5,130.5],[33.2,131.0],[33.0,131.4],[32.7,131.7],
            [32.1,131.3],[31.4,131.0],[31.0,130.6],[31.3,131.4],[31.9,131.8],
            [32.7,130.8],[33.1,129.7],[33.6,130.2],
            [33.2,130.7],[32.8,131.0],[32.3,130.9],[31.7,131.1],[33.3,130.3],
            [26.3,127.8],[26.5,128.0],[26.1,127.6],[26.8,128.3],[27.4,128.6],
            [28.4,129.5],[29.5,129.9],[30.4,130.5]
        ];

        var jpPoints = japanCoast.map(function(p) {
            return { latR: p[0] * Math.PI / 180, lonR: p[1] * Math.PI / 180 };
        });

        // Build mesh edges — denser connections
        var jpEdges = [];
        for (var i = 0; i < japanCoast.length; i++) {
            for (var j = i + 1; j < japanCoast.length; j++) {
                var dlat = japanCoast[i][0] - japanCoast[j][0];
                var dlon = japanCoast[i][1] - japanCoast[j][1];
                if (Math.sqrt(dlat * dlat + dlon * dlon) < 2.8) jpEdges.push([i, j]);
            }
        }

        // World grid dots (sparse, for non-Japan areas)
        var worldDots = [];
        for (var lat = -70; lat <= 70; lat += 8) {
            var lonStep = 8 / Math.cos(lat * Math.PI / 180);
            if (lonStep > 50) lonStep = 50;
            for (var lon = -180; lon < 180; lon += lonStep) {
                if (lat >= 24 && lat <= 46 && lon >= 126 && lon <= 146) continue;
                worldDots.push({ latR: lat * Math.PI / 180, lonR: lon * Math.PI / 180 });
            }
        }

        // Star particles (background)
        var stars = [];
        for (var i = 0; i < 120; i++) {
            stars.push({
                x: Math.random(), y: Math.random(),
                size: Math.random() * 1.8 + 0.3,
                alpha: Math.random() * 0.5 + 0.1,
                twinkleSpeed: Math.random() * 2 + 0.5
            });
        }

        function getColors() {
            var dark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                bg: dark ? '#0a1628' : '#eef2ff',
                globeEdge: dark ? 'rgba(34,211,238,0.2)' : 'rgba(79,70,229,0.15)',
                globeFill: dark ? 'rgba(10,22,40,0.6)' : 'rgba(238,242,255,0.5)',
                gridLine: dark ? 'rgba(34,211,238,0.06)' : 'rgba(79,70,229,0.05)',
                worldDot: dark ? 'rgba(34,211,238,0.25)' : 'rgba(79,70,229,0.2)',
                meshLine: dark ? 'rgba(34,211,238,0.55)' : 'rgba(79,70,229,0.45)',
                meshDot: dark ? '#22d3ee' : '#6366f1',
                meshGlow: dark ? 'rgba(34,211,238,0.7)' : 'rgba(79,70,229,0.6)',
                japanGlow: dark ? 'rgba(34,211,238,0.2)' : 'rgba(99,102,241,0.12)',
                orbitalRing: dark ? 'rgba(34,211,238,0.12)' : 'rgba(79,70,229,0.08)',
                labelBg: dark ? 'rgba(10,22,40,0.9)' : 'rgba(255,255,255,0.92)',
                labelText: dark ? '#e2e8f0' : '#1e293b',
                labelBorder: dark ? 'rgba(34,211,238,0.3)' : 'rgba(79,70,229,0.2)',
                star: dark ? 'rgba(200,220,255,0.6)' : 'rgba(79,70,229,0.15)',
                outerGlow: dark ? 'rgba(34,211,238,0.15)' : 'rgba(99,102,241,0.1)'
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
            W = rect.width; H = rect.height;
            // Zoomed-in globe: radius 2× viewport height, offset center so Japan is visible
            globeR = H * 2.0;
            // Japan center: lat≈36°, lon≈138° → projects to certain x,y
            // We want Japan to appear at roughly center-right of viewport
            // sin(latR)*cos(rotX) ≈ 0.587*0.99 ≈ 0.58 → y offset = 0.58*R
            // cos(latR)*cos(lonR+rotY) ≈ 0.81*cos(1.57) ≈ 0 → x offset ≈ 0
            globeCx = W * 0.42;
            globeCy = H * 0.5 + 0.55 * globeR;
        }

        function project(latR, lonR) {
            var cosLat = Math.cos(latR);
            var x3 = cosLat * Math.cos(lonR + rotY);
            var y3 = Math.sin(latR);
            var z3 = cosLat * Math.sin(lonR + rotY);
            var y3r = y3 * Math.cos(rotX) - z3 * Math.sin(rotX);
            var z3r = y3 * Math.sin(rotX) + z3 * Math.cos(rotX);
            return { x: globeCx + x3 * globeR, y: globeCy - y3r * globeR, z: z3r };
        }

        function drawRoundedRect(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
            ctx.arcTo(x + w, y, x + w, y + r, r);
            ctx.lineTo(x + w, y + h - r);
            ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
            ctx.lineTo(x + r, y + h);
            ctx.arcTo(x, y + h, x, y + h - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
            ctx.closePath();
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            var time = Date.now() * 0.001;

            // Gentle oscillation
            rotY = baseRotY + Math.sin(time * 0.06) * 0.08;
            rotX = baseRotX + Math.sin(time * 0.04) * 0.03;

            // ── Stars ──
            for (var i = 0; i < stars.length; i++) {
                var s = stars[i];
                var twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + i);
                ctx.globalAlpha = s.alpha * twinkle;
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.star;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── Globe edge glow (visible arc) ──
            // The globe is huge, only its edge/arc is visible across the canvas
            ctx.beginPath();
            ctx.arc(globeCx, globeCy, globeR, 0, Math.PI * 2);
            ctx.strokeStyle = colors.globeEdge;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Atmospheric outer glow
            var atmoGlow = ctx.createRadialGradient(globeCx, globeCy, globeR * 0.97, globeCx, globeCy, globeR * 1.05);
            atmoGlow.addColorStop(0, 'transparent');
            atmoGlow.addColorStop(0.4, colors.outerGlow);
            atmoGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = atmoGlow;
            ctx.beginPath();
            ctx.arc(globeCx, globeCy, globeR * 1.05, 0, Math.PI * 2);
            ctx.fill();

            // Globe surface fill (subtle)
            ctx.beginPath();
            ctx.arc(globeCx, globeCy, globeR, 0, Math.PI * 2);
            ctx.fillStyle = colors.globeFill;
            ctx.fill();

            // ── Globe grid lines ──
            ctx.strokeStyle = colors.gridLine;
            ctx.lineWidth = 0.6;
            // Latitude lines
            for (var lat = -60; lat <= 60; lat += 20) {
                var latR = lat * Math.PI / 180;
                ctx.beginPath();
                var firstVisible = true;
                for (var lonStep = 0; lonStep <= 360; lonStep += 3) {
                    var p = project(latR, (lonStep - 180) * Math.PI / 180);
                    if (p.z < 0) { firstVisible = true; continue; }
                    if (firstVisible) { ctx.moveTo(p.x, p.y); firstVisible = false; }
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }
            // Longitude lines
            for (var lon = -180; lon < 180; lon += 30) {
                var lonR = lon * Math.PI / 180;
                ctx.beginPath();
                var firstVisible = true;
                for (var latStep = -80; latStep <= 80; latStep += 3) {
                    var p = project(latStep * Math.PI / 180, lonR);
                    if (p.z < 0) { firstVisible = true; continue; }
                    if (firstVisible) { ctx.moveTo(p.x, p.y); firstVisible = false; }
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.stroke();
            }

            // ── World dots ──
            for (var i = 0; i < worldDots.length; i++) {
                var p = project(worldDots[i].latR, worldDots[i].lonR);
                if (p.z < 0.05) continue;
                if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) continue;
                ctx.globalAlpha = 0.15 + p.z * 0.4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = colors.worldDot;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── Orbital rings (decorative arcs around globe) ──
            ctx.strokeStyle = colors.orbitalRing;
            ctx.lineWidth = 1;
            for (var ring = 0; ring < 3; ring++) {
                var ringR = globeR * (1.03 + ring * 0.04);
                var tilt = 0.2 + ring * 0.15 + time * 0.01 * (ring + 1);
                var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
                ctx.beginPath();
                var started = false;
                for (var a = 0; a <= Math.PI * 2; a += 0.03) {
                    var rx = Math.cos(a) * ringR;
                    var ry = Math.sin(a) * ringR * 0.3;
                    var px = globeCx + rx * cosT - ry * sinT;
                    var py = globeCy + rx * sinT * 0.5 + ry * cosT;
                    // Only draw front half (approximate depth check)
                    var dFromCenter = Math.sqrt((px - globeCx) * (px - globeCx) + (py - globeCy) * (py - globeCy));
                    if (dFromCenter > globeR * 0.95 && Math.sin(a) > -0.2) {
                        if (!started) { ctx.moveTo(px, py); started = true; }
                        else ctx.lineTo(px, py);
                    } else { started = false; }
                }
                ctx.globalAlpha = 0.3 - ring * 0.08;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // ── Japan ambient glow ──
            var jCenter = project(36 * Math.PI / 180, 138 * Math.PI / 180);
            if (jCenter.z > 0) {
                var glowR = globeR * 0.08;
                var jGlow = ctx.createRadialGradient(jCenter.x, jCenter.y, 0, jCenter.x, jCenter.y, glowR);
                jGlow.addColorStop(0, colors.japanGlow);
                jGlow.addColorStop(0.6, colors.japanGlow);
                jGlow.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.8 + Math.sin(time * 0.5) * 0.15;
                ctx.fillStyle = jGlow;
                ctx.beginPath();
                ctx.arc(jCenter.x, jCenter.y, glowR, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // ── Japan wireframe mesh ──
            var jpProj = [];
            for (var i = 0; i < jpPoints.length; i++) {
                jpProj.push(project(jpPoints[i].latR, jpPoints[i].lonR));
            }

            // Mesh edges
            ctx.lineCap = 'round';
            for (var i = 0; i < jpEdges.length; i++) {
                var a = jpProj[jpEdges[i][0]], b = jpProj[jpEdges[i][1]];
                if (a.z < 0.1 || b.z < 0.1) continue;
                if (a.x < -100 || a.x > W + 100 || b.x < -100 || b.x > W + 100) continue;
                var avgZ = (a.z + b.z) / 2;
                ctx.globalAlpha = avgZ * 0.65;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = colors.meshLine;
                ctx.lineWidth = 0.8 + avgZ * 0.4;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Mesh node dots with glow
            for (var i = 0; i < jpProj.length; i++) {
                var p = jpProj[i];
                if (p.z < 0.1) continue;
                if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) continue;
                // Glow
                ctx.globalAlpha = p.z * 0.5;
                var ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 5 + p.z * 4);
                ng.addColorStop(0, colors.meshGlow);
                ng.addColorStop(1, 'transparent');
                ctx.fillStyle = ng;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5 + p.z * 4, 0, Math.PI * 2);
                ctx.fill();
                // Core dot
                ctx.globalAlpha = 0.7 + p.z * 0.3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.2 + p.z * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = colors.meshDot;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── City markers with dark badges ──
            var labelPositions = [];
            for (var i = 0; i < cities.length; i++) {
                var c = cities[i];
                var p = project(c.latR, c.lonR);
                if (p.z < 0.1) continue;
                if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) continue;

                var pulse = Math.sin(time + i * 0.9);

                // City glow
                var glowSize = c.isHQ ? 25 + pulse * 6 : 14 + pulse * 3;
                var grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                grd.addColorStop(0, c.color);
                grd.addColorStop(0.4, c.isHQ ? 'rgba(245,183,49,0.3)' : 'rgba(34,211,238,0.25)');
                grd.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.5 + pulse * 0.15;
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // Dot
                var dotR = c.isHQ ? 5 : 3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(p.x, p.y, c.isHQ ? 2 : 1.2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                // Badge label
                ctx.font = (c.isHQ ? '600 13px' : '500 11px') + ' Inter, -apple-system, sans-serif';
                var textW = ctx.measureText(c.name).width;
                var badgeW = textW + 16;
                var badgeH = c.isHQ ? 26 : 22;

                // Collision avoidance: try right, left, below, above
                var positions = [
                    { x: p.x + dotR + 8, y: p.y - badgeH / 2 },
                    { x: p.x - dotR - badgeW - 8, y: p.y - badgeH / 2 },
                    { x: p.x - badgeW / 2, y: p.y + dotR + 8 },
                    { x: p.x - badgeW / 2, y: p.y - dotR - badgeH - 8 }
                ];
                var bestPos = positions[0];
                for (var pi = 0; pi < positions.length; pi++) {
                    var cand = positions[pi], overlaps = false;
                    for (var li = 0; li < labelPositions.length; li++) {
                        var lp = labelPositions[li];
                        if (cand.x < lp.x + lp.w + 4 && cand.x + badgeW + 4 > lp.x &&
                            cand.y < lp.y + lp.h + 4 && cand.y + badgeH + 4 > lp.y) { overlaps = true; break; }
                    }
                    if (!overlaps) { bestPos = cand; break; }
                }
                labelPositions.push({ x: bestPos.x, y: bestPos.y, w: badgeW, h: badgeH });

                // Draw dark badge
                ctx.globalAlpha = 0.92;
                ctx.fillStyle = colors.labelBg;
                ctx.strokeStyle = colors.labelBorder;
                ctx.lineWidth = 1;
                drawRoundedRect(bestPos.x, bestPos.y, badgeW, badgeH, 5);
                ctx.fill(); ctx.stroke();
                ctx.globalAlpha = 1;

                ctx.fillStyle = c.isHQ ? c.color : colors.labelText;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(c.name, bestPos.x + badgeW / 2, bestPos.y + badgeH / 2);
            }
            ctx.textBaseline = 'alphabetic';
        }

        function animate() { draw(); requestAnimationFrame(animate); }
        window.addEventListener('resize', resize);
        resize(); animate();
        window._globeInstance = { updateColors: function() { colors = getColors(); } };
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
