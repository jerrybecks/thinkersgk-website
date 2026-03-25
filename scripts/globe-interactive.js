/**
 * Interactive 3D Globe — Thinkers GK
 * Uses COBE library for WebGL globe rendering with overlay arcs and city labels.
 * Fallback: if WebGL or COBE fails, the existing GIF stays visible.
 */
(function () {
  'use strict';

  // ── City data ──────────────────────────────────────────────────────────
  var CITIES = [
    { name: 'Tokyo',     lat: 35.6762, lon: 139.6503, size: 0.08, color: [0.96, 0.62, 0.04], hex: 'rgba(245,158,10,', hq: true },
    { name: 'Osaka',     lat: 34.6937, lon: 135.5023, size: 0.05, color: [0.02, 0.71, 0.83], hex: 'rgba(5,181,212,' },
    { name: 'Nagoya',    lat: 35.1815, lon: 136.9066, size: 0.05, color: [0.55, 0.36, 0.96], hex: 'rgba(140,92,245,' },
    { name: 'Fukuoka',   lat: 33.5904, lon: 130.4017, size: 0.05, color: [0.06, 0.73, 0.50], hex: 'rgba(15,186,128,' },
    { name: 'Sapporo',   lat: 43.0618, lon: 141.3545, size: 0.05, color: [0.96, 0.25, 0.37], hex: 'rgba(245,64,94,' },
    { name: 'Sendai',    lat: 38.2682, lon: 140.8694, size: 0.05, color: [0.23, 0.51, 0.96], hex: 'rgba(59,130,245,' },
    { name: 'Hiroshima', lat: 34.3853, lon: 132.4553, size: 0.05, color: [0.93, 0.28, 0.60], hex: 'rgba(237,71,153,' }
  ];

  var BASE_PHI   = 2.4;
  var BASE_THETA = 0.3;

  // ── Helpers ────────────────────────────────────────────────────────────

  function isDark() {
    var el = document.documentElement;
    return el.getAttribute('data-theme') === 'dark' ||
           (!el.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function isMobile() {
    return window.innerWidth < 768;
  }

  function projectToScreen(lat, lon, phi, theta, cx, cy, radius) {
    var latR = lat * Math.PI / 180;
    var lonR = lon * Math.PI / 180;
    var x = Math.cos(latR) * Math.sin(lonR - phi);
    var y = Math.sin(latR) * Math.cos(theta) - Math.cos(latR) * Math.sin(theta) * Math.cos(lonR - phi);
    var z = Math.sin(latR) * Math.sin(theta) + Math.cos(latR) * Math.cos(theta) * Math.cos(lonR - phi);
    if (z < 0) return null;
    return { x: cx + x * radius, y: cy - y * radius };
  }

  // ── Main setup ─────────────────────────────────────────────────────────

  var container = document.querySelector('.globe-image-container');
  if (!container) return;

  var gifImage = container.querySelector('.globe-image');

  // Create COBE canvas
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;right:0;width:100%;height:100%;';
  container.style.position = 'relative';
  container.appendChild(canvas);

  // Create overlay canvas for arcs / labels
  var overlay = document.createElement('canvas');
  overlay.id = 'globe-overlay';
  overlay.style.cssText = 'position:absolute;top:0;right:0;width:100%;height:100%;pointer-events:none;';
  container.appendChild(overlay);
  var octx = overlay.getContext('2d');

  // ── State ──────────────────────────────────────────────────────────────
  var globeInstance = null;
  var animFrame     = null;
  var startTime     = Date.now();
  var currentPhi    = BASE_PHI;
  var currentTheta  = BASE_THETA;

  // Drag state
  var dragging      = false;
  var dragPhi       = 0;
  var dragTheta     = 0;
  var pointerX      = 0;
  var pointerY      = 0;
  var idleTimer     = null;
  var userControlled = false;

  // ── Drag handlers ──────────────────────────────────────────────────────

  function onPointerDown(e) {
    dragging = true;
    userControlled = true;
    var pt = e.touches ? e.touches[0] : e;
    pointerX = pt.clientX;
    pointerY = pt.clientY;
    dragPhi   = currentPhi;
    dragTheta = currentTheta;
    clearTimeout(idleTimer);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    e.preventDefault();
    var pt = e.touches ? e.touches[0] : e;
    var dx = pt.clientX - pointerX;
    var dy = pt.clientY - pointerY;
    currentPhi   = dragPhi   - dx * 0.005;
    currentTheta = dragTheta + dy * 0.005;
    currentTheta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentTheta));
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    idleTimer = setTimeout(function () {
      userControlled = false;
      startTime = Date.now() - ((currentPhi - BASE_PHI) / 0.25) / 0.15 * 1000;
    }, 3000);
  }

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  // ── Overlay rendering ─────────────────────────────────────────────────

  var dashOffset = 0;
  var mobile = isMobile();

  function drawOverlay() {
    var w = overlay.width;
    var h = overlay.height;
    if (w === 0 || h === 0) return;
    octx.clearRect(0, 0, w, h);

    var cx = w / 2;
    var cy = h / 2;
    var radius = Math.min(w, h) / 2 * 0.85;
    var dark = isDark();
    var elapsed = (Date.now() - startTime) / 1000;

    // Tokyo position
    var tokyo = CITIES[0];
    var tp = projectToScreen(tokyo.lat, tokyo.lon, currentPhi, currentTheta, cx, cy, radius);

    for (var i = 0; i < CITIES.length; i++) {
      var city = CITIES[i];
      var cp = projectToScreen(city.lat, city.lon, currentPhi, currentTheta, cx, cy, radius);
      if (!cp) continue;

      // ── Connection arcs from Tokyo ──
      if (i > 0 && tp) {
        var midX = (tp.x + cp.x) / 2;
        var midY = (tp.y + cp.y) / 2 - 30;
        octx.beginPath();
        octx.moveTo(tp.x, tp.y);
        octx.quadraticCurveTo(midX, midY, cp.x, cp.y);
        octx.strokeStyle = city.hex + '0.35)';
        octx.lineWidth = 1.5;
        if (mobile) {
          octx.setLineDash([4, 6]);
          octx.lineDashOffset = 0;
        } else {
          octx.setLineDash([4, 6]);
          octx.lineDashOffset = -dashOffset;
        }
        octx.stroke();
        octx.setLineDash([]);
      }

      // ── Pulsing beacon ──
      var pulse = Math.sin(elapsed * 2.5 + i) * 0.5 + 0.5;
      var beaconR = (city.hq ? 8 : 5) + pulse * 4;
      octx.beginPath();
      octx.arc(cp.x, cp.y, beaconR, 0, Math.PI * 2);
      octx.fillStyle = city.hex + (0.15 + pulse * 0.15).toFixed(2) + ')';
      octx.fill();

      // Inner dot
      octx.beginPath();
      octx.arc(cp.x, cp.y, city.hq ? 4 : 2.5, 0, Math.PI * 2);
      octx.fillStyle = city.hex + '0.9)';
      octx.fill();

      // ── Label ──
      var label = city.hq ? '\u2605 HQ' : city.name;
      octx.font = (city.hq ? 'bold 11px' : '10px') + ' -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      var tw = octx.measureText(label).width;
      var lx = cp.x + (city.hq ? 10 : 8);
      var ly = cp.y - 2;

      // Backdrop pill
      var pad = 4;
      var pillH = 14;
      octx.beginPath();
      var rr = 4;
      var px = lx - pad;
      var py = ly - pillH + 3;
      var pw = tw + pad * 2;
      var ph = pillH + 2;
      octx.moveTo(px + rr, py);
      octx.lineTo(px + pw - rr, py);
      octx.arcTo(px + pw, py, px + pw, py + rr, rr);
      octx.lineTo(px + pw, py + ph - rr);
      octx.arcTo(px + pw, py + ph, px + pw - rr, py + ph, rr);
      octx.lineTo(px + rr, py + ph);
      octx.arcTo(px, py + ph, px, py + ph - rr, rr);
      octx.lineTo(px, py + rr);
      octx.arcTo(px, py, px + rr, py, rr);
      octx.closePath();
      octx.fillStyle = dark ? 'rgba(10,12,20,0.65)' : 'rgba(255,255,255,0.7)';
      octx.fill();

      // Label text
      octx.fillStyle = city.hex + '1)';
      octx.fillText(label, lx, ly + 3);
    }
  }

  // ── Size canvases ──────────────────────────────────────────────────────

  function sizeCanvases() {
    var rect = container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    overlay.width  = w * dpr;
    overlay.height = h * dpr;
    overlay.style.width  = w + 'px';
    overlay.style.height = h + 'px';
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h, dpr: dpr };
  }

  // ── COBE init ──────────────────────────────────────────────────────────

  function buildMarkers() {
    return CITIES.map(function (c) {
      return { location: [c.lat, c.lon], size: c.size };
    });
  }

  function createGlobe() {
    if (globeInstance) {
      globeInstance.destroy();
      globeInstance = null;
    }
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }

    var dark = isDark();
    mobile = isMobile();
    var dims = sizeCanvases();

    var cobeSize = Math.min(dims.w, dims.h);

    import('https://esm.sh/cobe@0.6.3').then(function (mod) {
      var createGlobeFn = mod.default || mod;

      globeInstance = createGlobeFn(canvas, {
        devicePixelRatio: dims.dpr,
        width:  cobeSize * dims.dpr,
        height: cobeSize * dims.dpr,
        scale: 2.8,
        phi: currentPhi,
        theta: currentTheta,
        mapSamples: mobile ? 10000 : 16000,
        mapBrightness: dark ? 4 : 8,
        dark: dark ? 1 : 0,
        diffuse: 1.2,
        baseColor: dark ? [0.06, 0.07, 0.09] : [0.92, 0.93, 0.96],
        glowColor: dark ? [0.08, 0.12, 0.25] : [0.85, 0.88, 0.95],
        offset: [0, 80],
        markers: buildMarkers(),
        markerColor: [0.96, 0.62, 0.04],
        onRender: function (state) {
          var elapsed = (Date.now() - startTime) / 1000;

          if (!userControlled) {
            currentPhi = BASE_PHI + Math.sin(elapsed * 0.15) * 0.25;
          }

          state.phi   = currentPhi;
          state.theta = currentTheta;

          // Advance dash offset for traveling dots
          if (!mobile) {
            dashOffset += 0.15;
          }

          drawOverlay();
        }
      });

      // COBE loaded — hide the GIF
      if (gifImage) {
        gifImage.style.display = 'none';
      }

    }).catch(function (err) {
      // WebGL or network failure — keep the GIF visible
      console.warn('[globe-interactive] COBE failed to load, keeping GIF fallback.', err);
      canvas.style.display  = 'none';
      overlay.style.display = 'none';
      if (gifImage) {
        gifImage.style.display = '';
      }
    });
  }

  // ── Theme observer ─────────────────────────────────────────────────────

  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === 'data-theme') {
        createGlobe();
        break;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true });

  // ── Resize handling ────────────────────────────────────────────────────

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      createGlobe();
    }, 300);
  });

  // ── WebGL feature check then init ──────────────────────────────────────

  try {
    var testCanvas = document.createElement('canvas');
    var gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) throw new Error('No WebGL');
    createGlobe();
  } catch (e) {
    console.warn('[globe-interactive] WebGL not available, keeping GIF fallback.', e);
    canvas.style.display  = 'none';
    overlay.style.display = 'none';
  }

})();
