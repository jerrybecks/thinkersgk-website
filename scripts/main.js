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

        // Swap globe image for dark/light mode
        var globeImg = document.querySelector('.globe-image');
        if (globeImg) {
            globeImg.src = theme === 'dark' ? 'assets/globe-japan-dark-beacons.gif' : 'assets/globe-japan-light-beacons.gif';
        }

        // Swap logo for dark/light mode
        var logos = document.querySelectorAll('.nav-logo');
        logos.forEach(function(logo) {
            var src = logo.getAttribute('src') || '';
            if (theme === 'dark') {
                logo.src = src.replace('logo.png', 'logo-dark.png');
            } else {
                logo.src = src.replace('logo-dark.png', 'logo.png');
            }
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
            el.innerHTML = lang === 'ja' ? el.getAttribute('data-ja') : el.getAttribute('data-en');
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

        // Data Destruction — Hard Drive with X
        data_destruction: (function() {
            var pts = [];
            // Drive body (simple rectangle)
            for (var x = 0.3; x <= 0.7; x += 0.04) { pts.push([x, 0.3]); pts.push([x, 0.7]); }
            for (var y = 0.3; y <= 0.7; y += 0.04) { pts.push([0.3, y]); pts.push([0.7, y]); }
            // X over the drive
            for (var t = 0; t <= 1; t += 0.05) {
                pts.push([0.3 + t * 0.4, 0.3 + t * 0.4]); // Diagonal \
                pts.push([0.7 - t * 0.4, 0.3 + t * 0.4]); // Diagonal /
            }
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

        // Thinkers GK logo — sunrise dome + rays + thinker silhouette
        logo: (function() {
            var pts = [];
            var cx = 0.5, sunY = 0.48; // center of sun dome

            // ── Half-dome (sunrise) ──
            for (var a = 0; a <= Math.PI; a += 0.12) {
                var r = 0.16;
                pts.push([cx + Math.cos(a) * r, sunY - Math.sin(a) * r]);
            }
            // Fill dome interior slightly
            for (var a = 0.2; a <= Math.PI - 0.2; a += 0.2) {
                var r = 0.11;
                pts.push([cx + Math.cos(a) * r, sunY - Math.sin(a) * r]);
            }

            // ── Radiating rays (fan above dome) ──
            var rayCount = 13;
            for (var i = 0; i < rayCount; i++) {
                var a = (Math.PI / (rayCount - 1)) * i; // 0 to PI
                var rInner = 0.19;
                var rOuter = (i % 2 === 0) ? 0.34 : 0.28; // alternating long/short
                // 2-3 points per ray
                for (var t = 0; t <= 1; t += 0.4) {
                    var rr = rInner + (rOuter - rInner) * t;
                    pts.push([cx + Math.cos(a) * rr, sunY - Math.sin(a) * rr]);
                }
            }

            // ── Horizon line ──
            for (var x = 0.12; x <= 0.88; x += 0.04) {
                pts.push([x, sunY]);
            }

            // ── Thinker silhouette (seated figure, chin on hand) ──
            // Positioned center-right, sitting at horizon
            var tx = 0.56, ty = sunY; // thinker anchor point
            // Head (small circle)
            for (var a = 0; a < Math.PI * 2; a += 0.5) {
                pts.push([tx + 0.01 + Math.cos(a) * 0.03, ty + 0.02 + Math.sin(a) * 0.03]);
            }
            // Bent back (curved line from head down-left)
            var back = [[tx + 0.01, ty + 0.05], [tx - 0.01, ty + 0.09], [tx - 0.03, ty + 0.13], [tx - 0.04, ty + 0.17], [tx - 0.04, ty + 0.21]];
            for (var i = 0; i < back.length; i++) pts.push(back[i]);
            // Arm from shoulder to chin (thinking pose)
            var arm = [[tx - 0.01, ty + 0.08], [tx + 0.01, ty + 0.1], [tx + 0.03, ty + 0.08], [tx + 0.03, ty + 0.06]];
            for (var i = 0; i < arm.length; i++) pts.push(arm[i]);
            // Legs (bent, seated)
            var legs = [[tx - 0.04, ty + 0.21], [tx - 0.02, ty + 0.24], [tx + 0.01, ty + 0.22], [tx + 0.03, ty + 0.24], [tx + 0.01, ty + 0.27], [tx - 0.02, ty + 0.27]];
            for (var i = 0; i < legs.length; i++) pts.push(legs[i]);

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
        'homepage':             ['data_destruction', 'logo', 'network', 'cloud', 'shield'],
        // Split canvases — left and right get different shape sequences
        'services-left':        ['shield', 'cloud', 'logo', 'gear'],
        'services-right':       ['network', 'server', 'monitor', 'lock'],
        'homepage-left':        ['logo', 'shield', 'cloud', 'network'],
        'homepage-right':       ['gear', 'monitor', 'server', 'lock']
    };

    function createParticleSystem(canvas) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        var mouse = { x: null, y: null };
        var count = window.innerWidth < 768 ? 50 : 100;
        var connectDist = 180; /* Increased connection distance */
        var mouseRadius = 150; /* Increased mouse interaction radius */
        var mouseScatterForce = 6; /* Increased mouse scatter force */

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
            var isSideCanvas = canvas.classList.contains('particle-side');
            if (isSideCanvas) {
                // Side canvases: use own CSS-constrained dimensions, don't override style
                pW = canvas.offsetWidth;
                pH = canvas.offsetHeight;
            } else {
                // Single/full canvas: use parent dimensions (original behavior)
                pW = canvas.parentElement.offsetWidth;
                pH = canvas.parentElement.offsetHeight;
                canvas.style.width = pW + 'px';
                canvas.style.height = pH + 'px';
            }
            canvas.width = pW * dpr;
            canvas.height = pH * dpr;
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
            var isLeft = canvas.classList.contains('particle-left');
            var isRight = canvas.classList.contains('particle-right');
            var isSide = isLeft || isRight;
            // Side canvases: center shape within the canvas itself
            var shapeW = isSide ? Math.min(pW * 0.7, pH * 0.4) : Math.min(pW * 0.4, pH * 0.7);
            var shapeCx = isSide ? pW * 0.5 : pW * 0.55;
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

        return { updateColors: function() { colors = getColors(); } };
    }

    function initParticleNetwork() {
        var systems = [];

        // Support dual canvases (left + right) or single canvas
        var canvasLeft = document.getElementById('particleCanvasLeft');
        var canvasRight = document.getElementById('particleCanvasRight');
        var canvasSingle = document.getElementById('particleCanvas');

        if (canvasLeft) systems.push(createParticleSystem(canvasLeft));
        if (canvasRight) systems.push(createParticleSystem(canvasRight));
        if (canvasSingle) systems.push(createParticleSystem(canvasSingle));

        if (systems.length) {
            window._particleNet = {
                updateColors: function() {
                    for (var i = 0; i < systems.length; i++) systems[i].updateColors();
                }
            };
        }
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
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll('.card, .feature, .cta-box, .service-detail-inner, .fade-target, .stat-item, .logo-bar, .contact-info, .contact-form, .service-feature-card, .process-step, .testimonial-block, .testimonial-card, .sla-card, .illustration-card').forEach(function(el, i) {
            el.classList.add('fade-in-up');
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
