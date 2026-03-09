/* ========================================
   THINKERS GK — 3D Enhancements
   Three.js globe, hero background,
   card upgrades, micro-interactions
   Progressive enhancement — safe to remove
   ======================================== */

(function () {
    'use strict';

    // ── Utilities ────────────────────────────────
    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function accentColor() {
        return isDark() ? '#3b82f6' : '#2563eb';
    }

    function bgColor() {
        return isDark() ? '#0f1117' : '#ffffff';
    }

    function textColor() {
        return isDark() ? '#e5e7eb' : '#111827';
    }

    // ── Feature 1: Interactive 3D Globe ──────────
    function initGlobe3D() {
        if (typeof THREE === 'undefined') return;

        var container = document.querySelector('.globe-image-container');
        if (!container) return;

        // WebGL check
        try {
            var testCanvas = document.createElement('canvas');
            var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (!gl) return;
        } catch (e) { return; }

        // Hide the GIF fallback
        var gifImg = container.querySelector('.globe-image');
        if (gifImg) gifImg.style.display = 'none';

        // Create renderer
        var width = container.offsetWidth;
        var height = container.offsetHeight;

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.right = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.pointerEvents = 'auto';
        container.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.z = 3.2;

        // Globe parameters
        var GLOBE_RADIUS = 1;
        var DOT_COUNT = 4500;
        var JAPAN_CENTER_LON = 138.0 * (Math.PI / 180);
        var JAPAN_CENTER_LAT = 36.0 * (Math.PI / 180);

        // Japan bounding regions (lat/lon in degrees)
        var japanRegions = [
            { latMin: 30, latMax: 46, lonMin: 128, lonMax: 146 },
            { latMin: 26, latMax: 30, lonMin: 126, lonMax: 132 },  // Okinawa area
            { latMin: 41, latMax: 46, lonMin: 139, lonMax: 146 },  // Hokkaido
        ];

        function isInJapan(latDeg, lonDeg) {
            for (var i = 0; i < japanRegions.length; i++) {
                var r = japanRegions[i];
                if (latDeg >= r.latMin && latDeg <= r.latMax && lonDeg >= r.lonMin && lonDeg <= r.lonMax) {
                    return true;
                }
            }
            return false;
        }

        // Approximate land mass detection (rough bounding boxes)
        var landRegions = [
            // Asia
            { latMin: 1, latMax: 55, lonMin: 60, lonMax: 150 },
            // Europe
            { latMin: 35, latMax: 72, lonMin: -10, lonMax: 60 },
            // Africa
            { latMin: -35, latMax: 37, lonMin: -18, lonMax: 52 },
            // North America
            { latMin: 15, latMax: 72, lonMin: -170, lonMax: -50 },
            // South America
            { latMin: -56, latMax: 13, lonMin: -82, lonMax: -34 },
            // Australia
            { latMin: -45, latMax: -10, lonMin: 112, lonMax: 155 },
        ];

        function isLand(latDeg, lonDeg) {
            for (var i = 0; i < landRegions.length; i++) {
                var r = landRegions[i];
                if (latDeg >= r.latMin && latDeg <= r.latMax && lonDeg >= r.lonMin && lonDeg <= r.lonMax) {
                    return true;
                }
            }
            return false;
        }

        // City data
        var cities = [
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503, isHQ: true, color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
            { name: 'Osaka', lat: 34.6937, lon: 135.5023, isHQ: false, color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
            { name: 'Nagoya', lat: 35.1815, lon: 136.9066, isHQ: false, color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
            { name: 'Fukuoka', lat: 33.5904, lon: 130.4017, isHQ: false, color: '#10b981', glow: 'rgba(16,185,129,0.5)' },
            { name: 'Sapporo', lat: 43.0618, lon: 141.3545, isHQ: false, color: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
            { name: 'Sendai', lat: 38.2682, lon: 140.8694, isHQ: false, color: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
            { name: 'Hiroshima', lat: 34.3853, lon: 132.4553, isHQ: false, color: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
        ];

        // ── Generate dot-matrix sphere ──
        var dotPositions = [];
        var dotColors = [];
        var dotSizes = [];
        var japanDotIndices = [];

        // Fibonacci sphere for even distribution
        var goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (var i = 0; i < DOT_COUNT; i++) {
            var theta = Math.acos(1 - 2 * (i + 0.5) / DOT_COUNT);
            var phi = 2 * Math.PI * i / goldenRatio;

            var x = GLOBE_RADIUS * Math.sin(theta) * Math.cos(phi);
            var y = GLOBE_RADIUS * Math.cos(theta);
            var z = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);

            // Convert to lat/lon for classification
            var latDeg = 90 - (theta * 180 / Math.PI);
            var lonDeg = phi * 180 / Math.PI;
            // Normalize lonDeg to -180..180
            lonDeg = ((lonDeg + 180) % 360) - 180;

            dotPositions.push(x, y, z);

            var inJapan = isInJapan(latDeg, lonDeg);
            var onLand = isLand(latDeg, lonDeg);

            if (inJapan) {
                japanDotIndices.push(i);
                dotColors.push(0.96, 0.62, 0.04); // gold
                dotSizes.push(3.5);
            } else if (onLand) {
                dotColors.push(0.4, 0.5, 0.7);
                dotSizes.push(1.8);
            } else {
                dotColors.push(0.2, 0.25, 0.35);
                dotSizes.push(1.0);
            }
        }

        var dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
        dotGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));
        dotGeometry.setAttribute('size', new THREE.Float32BufferAttribute(dotSizes, 1));

        var dotMaterial = new THREE.ShaderMaterial({
            vertexShader: [
                'attribute float size;',
                'attribute vec3 color;',
                'varying vec3 vColor;',
                'varying float vAlpha;',
                'void main() {',
                '  vColor = color;',
                '  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);',
                '  gl_PointSize = size * (200.0 / -mvPos.z);',
                '  vAlpha = clamp(position.z * 0.5 + 0.5, 0.0, 1.0);',
                '  gl_Position = projectionMatrix * mvPos;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vColor;',
                'varying float vAlpha;',
                'void main() {',
                '  float dist = length(gl_PointCoord - vec2(0.5));',
                '  if (dist > 0.5) discard;',
                '  float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;',
                '  gl_FragColor = vec4(vColor, alpha);',
                '}'
            ].join('\n'),
            transparent: true,
            depthWrite: false,
        });

        var dotMesh = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dotMesh);

        // ── City markers ──
        var cityGroup = new THREE.Group();
        scene.add(cityGroup);

        var cityMeshes = [];
        cities.forEach(function (city) {
            var latR = city.lat * Math.PI / 180;
            var lonR = city.lon * Math.PI / 180;
            var cx = GLOBE_RADIUS * Math.cos(latR) * Math.sin(lonR);
            var cy = GLOBE_RADIUS * Math.sin(latR);
            var cz = GLOBE_RADIUS * Math.cos(latR) * Math.cos(lonR);

            // Marker sphere
            var markerGeo = new THREE.SphereGeometry(city.isHQ ? 0.035 : 0.022, 12, 12);
            var markerMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(city.color),
                transparent: true,
                opacity: 0.9,
            });
            var marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(cx, cy, cz);
            cityGroup.add(marker);

            // Glow ring
            var ringGeo = new THREE.RingGeometry(city.isHQ ? 0.04 : 0.03, city.isHQ ? 0.065 : 0.045, 32);
            var ringMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(city.color),
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
            });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(cx, cy, cz);
            ring.lookAt(0, 0, 0);
            cityGroup.add(ring);

            cityMeshes.push({ marker: marker, ring: ring, city: city, pos: new THREE.Vector3(cx, cy, cz) });
        });

        // ── Connection arcs from Tokyo to each city ──
        var arcGroup = new THREE.Group();
        scene.add(arcGroup);

        var tokyoCity = cities[0];
        var tokyoLatR = tokyoCity.lat * Math.PI / 180;
        var tokyoLonR = tokyoCity.lon * Math.PI / 180;
        var tokyoPos = new THREE.Vector3(
            GLOBE_RADIUS * Math.cos(tokyoLatR) * Math.sin(tokyoLonR),
            GLOBE_RADIUS * Math.sin(tokyoLatR),
            GLOBE_RADIUS * Math.cos(tokyoLatR) * Math.cos(tokyoLonR)
        );

        var arcData = [];
        for (var ci = 1; ci < cities.length; ci++) {
            var city = cities[ci];
            var latR = city.lat * Math.PI / 180;
            var lonR = city.lon * Math.PI / 180;
            var cityPos = new THREE.Vector3(
                GLOBE_RADIUS * Math.cos(latR) * Math.sin(lonR),
                GLOBE_RADIUS * Math.sin(latR),
                GLOBE_RADIUS * Math.cos(latR) * Math.cos(lonR)
            );

            // Create arc curve
            var mid = new THREE.Vector3().addVectors(tokyoPos, cityPos).multiplyScalar(0.5);
            var dist = tokyoPos.distanceTo(cityPos);
            mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.3);

            var curve = new THREE.QuadraticBezierCurve3(tokyoPos.clone(), mid, cityPos.clone());
            var arcPoints = curve.getPoints(40);
            var arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
            var arcMat = new THREE.LineBasicMaterial({
                color: new THREE.Color(city.color),
                transparent: true,
                opacity: 0.35,
            });
            var arcLine = new THREE.Line(arcGeo, arcMat);
            arcGroup.add(arcLine);

            // Traveling dot
            var dotGeo = new THREE.SphereGeometry(0.015, 8, 8);
            var dotMat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(city.color),
                transparent: true,
                opacity: 0.9,
            });
            var travelDot = new THREE.Mesh(dotGeo, dotMat);
            arcGroup.add(travelDot);

            arcData.push({
                curve: curve,
                dot: travelDot,
                speed: 0.3 + Math.random() * 0.2,
                offset: Math.random(),
                color: city.color,
            });
        }

        // ── Rotation & interaction ──
        var globeGroup = new THREE.Group();
        scene.remove(dotMesh);
        scene.remove(cityGroup);
        scene.remove(arcGroup);
        globeGroup.add(dotMesh);
        globeGroup.add(cityGroup);
        globeGroup.add(arcGroup);
        scene.add(globeGroup);

        // Center rotation on Japan
        var baseRotY = -(JAPAN_CENTER_LON - Math.PI / 2);
        var baseRotX = JAPAN_CENTER_LAT * 0.3;
        globeGroup.rotation.y = baseRotY;
        globeGroup.rotation.x = baseRotX;

        var isDragging = false;
        var lastMouse = { x: 0, y: 0 };
        var dragRotation = { x: 0, y: 0 };
        var idleTimer = 0;
        var IDLE_RESUME = 3000;

        renderer.domElement.addEventListener('mousedown', function (e) {
            isDragging = true;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
        });

        renderer.domElement.addEventListener('mousemove', function (e) {
            if (!isDragging) return;
            var dx = e.clientX - lastMouse.x;
            var dy = e.clientY - lastMouse.y;
            dragRotation.y += dx * 0.005;
            dragRotation.x += dy * 0.003;
            dragRotation.x = Math.max(-0.5, Math.min(0.5, dragRotation.x));
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
            idleTimer = Date.now();
        });

        window.addEventListener('mouseup', function () {
            isDragging = false;
            idleTimer = Date.now();
        });

        // Touch support
        renderer.domElement.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                isDragging = true;
                lastMouse.x = e.touches[0].clientX;
                lastMouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        renderer.domElement.addEventListener('touchmove', function (e) {
            if (!isDragging || e.touches.length !== 1) return;
            var dx = e.touches[0].clientX - lastMouse.x;
            var dy = e.touches[0].clientY - lastMouse.y;
            dragRotation.y += dx * 0.005;
            dragRotation.x += dy * 0.003;
            dragRotation.x = Math.max(-0.5, Math.min(0.5, dragRotation.x));
            lastMouse.x = e.touches[0].clientX;
            lastMouse.y = e.touches[0].clientY;
            idleTimer = Date.now();
        }, { passive: true });

        renderer.domElement.addEventListener('touchend', function () {
            isDragging = false;
            idleTimer = Date.now();
        });

        // ── Theme update ──
        function updateGlobeTheme() {
            var dark = isDark();
            // Update Japan dot colors
            var colorsAttr = dotGeometry.getAttribute('color');
            for (var i = 0; i < DOT_COUNT; i++) {
                var idx = i * 3;
                if (japanDotIndices.indexOf(i) !== -1) {
                    if (dark) {
                        colorsAttr.array[idx] = 0.96; colorsAttr.array[idx + 1] = 0.62; colorsAttr.array[idx + 2] = 0.04;
                    } else {
                        colorsAttr.array[idx] = 0.15; colorsAttr.array[idx + 1] = 0.39; colorsAttr.array[idx + 2] = 0.92;
                    }
                } else if (dotSizes[i] > 1.5) {
                    // Land
                    if (dark) {
                        colorsAttr.array[idx] = 0.4; colorsAttr.array[idx + 1] = 0.5; colorsAttr.array[idx + 2] = 0.7;
                    } else {
                        colorsAttr.array[idx] = 0.55; colorsAttr.array[idx + 1] = 0.6; colorsAttr.array[idx + 2] = 0.75;
                    }
                } else {
                    // Ocean
                    if (dark) {
                        colorsAttr.array[idx] = 0.2; colorsAttr.array[idx + 1] = 0.25; colorsAttr.array[idx + 2] = 0.35;
                    } else {
                        colorsAttr.array[idx] = 0.75; colorsAttr.array[idx + 1] = 0.78; colorsAttr.array[idx + 2] = 0.85;
                    }
                }
            }
            colorsAttr.needsUpdate = true;
        }

        // ── Animation loop ──
        var clock = new THREE.Clock();

        function animateGlobe() {
            requestAnimationFrame(animateGlobe);

            var elapsed = clock.getElapsedTime();

            // Auto-rotation: oscillate ±0.3 rad around Japan center
            if (!isDragging && Date.now() - idleTimer > IDLE_RESUME) {
                // Ease drag rotation back to zero
                dragRotation.x *= 0.97;
                dragRotation.y *= 0.97;
            }

            var oscillation = Math.sin(elapsed * 0.15) * 0.3;
            globeGroup.rotation.y = baseRotY + oscillation + dragRotation.y;
            globeGroup.rotation.x = baseRotX + dragRotation.x;

            // Animate city marker pulses
            for (var i = 0; i < cityMeshes.length; i++) {
                var cm = cityMeshes[i];
                var pulse = 0.3 + Math.sin(elapsed * 2 + i) * 0.2;
                cm.ring.material.opacity = pulse;
                var s = 1 + Math.sin(elapsed * 2 + i) * 0.15;
                cm.ring.scale.set(s, s, s);
            }

            // Animate traveling dots
            for (var i = 0; i < arcData.length; i++) {
                var ad = arcData[i];
                var t = ((elapsed * ad.speed + ad.offset) % 1);
                var pos = ad.curve.getPointAt(t);
                ad.dot.position.copy(pos);
                ad.dot.material.opacity = Math.sin(t * Math.PI) * 0.9;
            }

            renderer.render(scene, camera);
        }

        // ── Resize handler ──
        function onResize() {
            var w = container.offsetWidth;
            var h = container.offsetHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }

        window.addEventListener('resize', onResize);

        // Start
        animateGlobe();

        // Return control interface
        return {
            updateTheme: updateGlobeTheme,
            dispose: function () {
                window.removeEventListener('resize', onResize);
                renderer.dispose();
                container.removeChild(renderer.domElement);
                if (gifImg) gifImg.style.display = '';
            }
        };
    }


    // ── Feature 2: Enhanced Hero Background ──────
    function initHeroBackground() {
        if (typeof THREE === 'undefined') return;

        var canvas = document.getElementById('hero3d');
        if (!canvas) return;

        var hero = canvas.closest('.hero');
        if (!hero) return;

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        var width = hero.offsetWidth;
        var height = hero.offsetHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
        camera.position.z = 5;

        // Floating geometric shapes
        var shapes = [];
        var geometries = [
            new THREE.IcosahedronGeometry(0.4, 0),
            new THREE.TorusKnotGeometry(0.25, 0.08, 48, 8),
            new THREE.OctahedronGeometry(0.35, 0),
            new THREE.TetrahedronGeometry(0.35, 0),
            new THREE.DodecahedronGeometry(0.3, 0),
        ];

        var shapeCount = 8;
        for (var i = 0; i < shapeCount; i++) {
            var geo = geometries[i % geometries.length];
            var mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(accentColor()),
                transparent: true,
                opacity: 0.03 + Math.random() * 0.03,
                wireframe: true,
            });
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4 - 2
            );
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            scene.add(mesh);
            shapes.push({
                mesh: mesh,
                vx: (Math.random() - 0.5) * 0.002,
                vy: (Math.random() - 0.5) * 0.002,
                rotSpeed: (Math.random() - 0.5) * 0.003,
                baseX: mesh.position.x,
                baseY: mesh.position.y,
            });
        }

        // Mouse parallax
        var mouseX = 0, mouseY = 0;
        hero.addEventListener('mousemove', function (e) {
            var rect = hero.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        });

        var clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            var t = clock.getElapsedTime();

            for (var i = 0; i < shapes.length; i++) {
                var s = shapes[i];
                s.mesh.position.x = s.baseX + Math.sin(t * 0.3 + i) * 0.5 + mouseX * 0.15 * (i % 3 === 0 ? 1 : -0.5);
                s.mesh.position.y = s.baseY + Math.cos(t * 0.2 + i * 0.7) * 0.3 + mouseY * 0.1 * (i % 2 === 0 ? 1 : -0.5);
                s.mesh.rotation.x += s.rotSpeed;
                s.mesh.rotation.y += s.rotSpeed * 0.7;
            }

            renderer.render(scene, camera);
        }

        function onResize() {
            var w = hero.offsetWidth;
            var h = hero.offsetHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }

        window.addEventListener('resize', onResize);
        animate();

        return {
            updateTheme: function () {
                var color = new THREE.Color(accentColor());
                shapes.forEach(function (s) { s.mesh.material.color = color; });
            }
        };
    }


    // ── Feature 3: Enhanced Card Interactions ────
    function initCardEnhancements() {
        var cards = document.querySelectorAll('.card');
        if (!cards.length) return;

        cards.forEach(function (card) {
            card.classList.add('card-enhanced');

            // Parallax depth on mousemove
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;

                // Subtle parallax on card content
                var inner = card.querySelector('h3, p');
                if (inner) {
                    card.style.setProperty('--px', (x * 4) + 'px');
                    card.style.setProperty('--py', (y * 4) + 'px');
                }
            });

            card.addEventListener('mouseleave', function () {
                card.style.setProperty('--px', '0px');
                card.style.setProperty('--py', '0px');
            });
        });

        // Magnetic snap — cards pull subtly toward cursor when nearby
        var magnetStrength = 4;
        var magnetRange = 120;

        document.addEventListener('mousemove', function (e) {
            cards.forEach(function (card) {
                var rect = card.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var dx = e.clientX - cx;
                var dy = e.clientY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < magnetRange && dist > 0) {
                    var force = (1 - dist / magnetRange) * magnetStrength;
                    card.style.setProperty('--magX', (dx / dist * force) + 'px');
                    card.style.setProperty('--magY', (dy / dist * force) + 'px');
                } else {
                    card.style.setProperty('--magX', '0px');
                    card.style.setProperty('--magY', '0px');
                }
            });
        });
    }


    // ── Feature 4: Micro-Interactions ────────────

    // 4a. Stats counter glow
    function initStatGlow() {
        var statNums = document.querySelectorAll('.stat-number');
        if (!statNums.length) return;

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                if (m.type === 'characterData' || m.type === 'childList') {
                    var el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
                    if (el && el.classList && el.classList.contains('stat-number')) {
                        el.classList.add('stat-glow');
                        setTimeout(function () { el.classList.remove('stat-glow'); }, 600);
                    }
                }
            });
        });

        statNums.forEach(function (el) {
            observer.observe(el, { childList: true, characterData: true, subtree: true });
        });
    }

    // 4b. Logo bar hover pause
    function initLogoBarPause() {
        var track = document.querySelector('.logo-track');
        if (!track) return;

        var wrapper = track.closest('.logo-track-wrapper');
        if (!wrapper) return;

        wrapper.addEventListener('mouseenter', function () {
            track.style.animationPlayState = 'paused';
        });
        wrapper.addEventListener('mouseleave', function () {
            track.style.animationPlayState = 'running';
        });
    }

    // 4c. Enhanced section reveal
    function initEnhancedReveal() {
        var sections = document.querySelectorAll('.section, .stats-section, .globe-section, .illustration-banner');
        if (!sections.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05 });

        sections.forEach(function (el) {
            el.classList.add('section-reveal');
            observer.observe(el);
        });
    }

    // 4d. Nav section indicator dots
    function initNavDots() {
        var sections = document.querySelectorAll('section[id]');
        if (sections.length < 2) return;

        var dotsContainer = document.createElement('div');
        dotsContainer.className = 'nav-section-dots';
        var dots = [];

        sections.forEach(function (sec) {
            var dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.setAttribute('data-section', sec.id);
            dot.addEventListener('click', function () {
                sec.scrollIntoView({ behavior: 'smooth' });
            });
            dotsContainer.appendChild(dot);
            dots.push({ el: dot, section: sec });
        });

        document.body.appendChild(dotsContainer);

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var dot = dotsContainer.querySelector('[data-section="' + entry.target.id + '"]');
                if (dot) {
                    dot.classList.toggle('active', entry.isIntersecting);
                }
            });
        }, { threshold: 0.3 });

        sections.forEach(function (sec) { observer.observe(sec); });
    }


    // ── Theme observer — watch for theme changes ──
    function watchTheme(globe3d, heroBg) {
        var observer = new MutationObserver(function () {
            if (globe3d && globe3d.updateTheme) globe3d.updateTheme();
            if (heroBg && heroBg.updateTheme) heroBg.updateTheme();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
    }


    // ── Init everything on DOM ready ─────────────
    function init() {
        var globe3d = initGlobe3D();
        var heroBg = initHeroBackground();

        initCardEnhancements();
        initStatGlow();
        initLogoBarPause();
        initEnhancedReveal();
        initNavDots();

        watchTheme(globe3d, heroBg);

        // Expose for debugging
        window._3dEnhancements = { globe: globe3d, hero: heroBg };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
