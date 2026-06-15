(function () {
  'use strict';

  function seeded(seed) {
    let s = seed;
    return function () {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
  }

  function drawNetwork(svgId, width, height, count, seed, linkDist) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const rand = seeded(seed);
    const nodes = [];
    for (let i = 0; i < count; i += 1) {
      nodes.push({
        x: rand() * width,
        y: rand() * height,
        gold: rand() < 0.13
      });
    }

    const links = [];
    let lines = '';
    let dots = '';
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < linkDist) {
          links.push([a, b]);
          lines += '<line class="tgk-net-line" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"></line>';
        }
      }
    }

    nodes.forEach(function (node, index) {
      dots += '<circle class="tgk-net-node' + (node.gold ? ' tgk-net-node--gold' : '') + '" cx="' + node.x.toFixed(1) + '" cy="' + node.y.toFixed(1) + '" r="2.4" style="animation-delay:' + ((index % 11) * 0.34).toFixed(2) + 's"></circle>';
    });

    let travelers = '';
    const travelerCount = Math.min(6, links.length);
    for (let i = 0; i < travelerCount; i += 1) {
      travelers += '<circle class="tgk-net-traveler" data-link="' + Math.floor(rand() * links.length) + '" r="1.7"></circle>';
    }

    svg.innerHTML = lines + dots + travelers;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !links.length) return;

    const travelerEls = svg.querySelectorAll('.tgk-net-traveler');
    const start = Date.now();
    function tick() {
      const now = Date.now() - start;
      travelerEls.forEach(function (el, index) {
        const link = links[Number(el.dataset.link)];
        if (!link) return;
        const period = 5200 + index * 720;
        let progress = ((now + index * 980) % period) / period;
        if (Math.floor((now + index * 980) / period) % 2 === 1) progress = 1 - progress;
        el.setAttribute('cx', (link[0].x + (link[1].x - link[0].x) * progress).toFixed(1));
        el.setAttribute('cy', (link[0].y + (link[1].y - link[0].y) * progress).toFixed(1));
      });
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  function drawCircuit(groupId, width, height, count, seed) {
    const group = document.getElementById(groupId);
    if (!group) return;

    const rand = seeded(seed);
    let paths = '';
    let pads = '';
    for (let i = 0; i < count; i += 1) {
      let x = rand() * width;
      let y = rand() * height;
      let d = 'M' + x.toFixed(1) + ' ' + y.toFixed(1);
      pads += '<circle class="tgk-circuit-pad" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3"></circle>';
      let angle = Math.floor(rand() * 4) * Math.PI / 2;
      const segments = 4 + Math.floor(rand() * 3);
      for (let step = 0; step < segments; step += 1) {
        const length = 34 + rand() * 92;
        x = Math.max(12, Math.min(width - 12, x + Math.cos(angle) * length));
        y = Math.max(12, Math.min(height - 12, y + Math.sin(angle) * length));
        d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1);
        angle += (rand() < 0.5 ? 1 : -1) * Math.PI / 4 * (rand() < 0.72 ? 1 : 2);
      }
      paths += '<path class="tgk-circuit-trace" d="' + d + '"></path>';
      if (rand() < 0.55) {
        paths += '<path class="tgk-circuit-trace tgk-circuit-trace--live' + (rand() < 0.28 ? ' tgk-circuit-trace--gold' : '') + '" d="' + d + '" style="animation-delay:' + (rand() * 5).toFixed(2) + 's"></path>';
      }
      pads += '<circle class="tgk-circuit-pad" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3"></circle>';
    }
    group.innerHTML = paths + pads;
  }

  function drawHeadlineCircuit(groupId, width, height) {
    const group = document.getElementById(groupId);
    if (!group) return;

    const frame = [
      'M110 118',
      'L250 118',
      'L288 86',
      'L516 86',
      'L556 118',
      'L742 118',
      'L742 170',
      'L784 204',
      'L784 308',
      'L726 308',
      'L686 344',
      'L500 344',
      'L454 382',
      'L212 382',
      'L170 344',
      'L110 344',
      'L110 270',
      'L76 238',
      'L76 154',
      'L110 118'
    ].join(' ');

    const branchTop = 'M324 86 L324 48 L420 48 L456 78';
    const branchRight = 'M784 230 L828 230 L828 292 L782 292';
    const branchBottom = 'M292 382 L292 408 L410 408 L438 382';
    const branchLeft = 'M76 202 L40 202 L40 126 L116 126';

    const chips = [
      '<rect class="tgk-headline-chip" x="300" y="30" rx="12" ry="12" width="146" height="36"></rect>',
      '<rect class="tgk-headline-chip" x="804" y="214" rx="12" ry="12" width="32" height="94"></rect>',
      '<rect class="tgk-headline-chip" x="252" y="392" rx="12" ry="12" width="176" height="28"></rect>',
      '<rect class="tgk-headline-chip" x="24" y="110" rx="12" ry="12" width="30" height="106"></rect>'
    ].join('');

    const nodes = [
      [110, 118], [288, 86], [556, 118], [742, 170], [784, 308], [500, 344], [212, 382], [76, 238],
      [324, 48], [420, 48], [828, 230], [828, 292], [292, 408], [410, 408], [40, 202], [40, 126]
    ];

    const dots = nodes.map(function (node, index) {
      const gold = index % 5 === 0 ? ' tgk-headline-node--gold' : '';
      return '<circle class="tgk-headline-node' + gold + '" cx="' + node[0] + '" cy="' + node[1] + '" r="3.2" style="animation-delay:' + (index * 0.26).toFixed(2) + 's"></circle>';
    }).join('');

    const staticPaths = [
      '<path class="tgk-headline-trace" d="' + frame + '"></path>',
      '<path class="tgk-headline-trace" d="' + branchTop + '"></path>',
      '<path class="tgk-headline-trace" d="' + branchRight + '"></path>',
      '<path class="tgk-headline-trace" d="' + branchBottom + '"></path>',
      '<path class="tgk-headline-trace" d="' + branchLeft + '"></path>'
    ].join('');

    const livePaths = [
      '<path class="tgk-headline-trace tgk-headline-trace--live" d="' + frame + '"></path>',
      '<path class="tgk-headline-trace tgk-headline-trace--live tgk-headline-trace--gold" d="' + branchTop + '" style="animation-delay:1.2s"></path>',
      '<path class="tgk-headline-trace tgk-headline-trace--live" d="' + branchRight + '" style="animation-delay:2.4s"></path>',
      '<path class="tgk-headline-trace tgk-headline-trace--live" d="' + branchBottom + '" style="animation-delay:0.8s"></path>'
    ].join('');

    const travelers = [
      '<circle class="tgk-headline-traveler" data-path="0" r="2.4"></circle>',
      '<circle class="tgk-headline-traveler" data-path="1" r="2.2"></circle>',
      '<circle class="tgk-headline-traveler" data-path="2" r="2.2"></circle>'
    ].join('');

    group.innerHTML = chips + staticPaths + livePaths + dots + travelers;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const motionPaths = [frame, branchTop, branchBottom].map(function (d) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      return path;
    });

    const travelerEls = group.querySelectorAll('.tgk-headline-traveler');
    const start = Date.now();

    function tick() {
      const now = Date.now() - start;
      travelerEls.forEach(function (el, index) {
        const path = motionPaths[Number(el.dataset.path)] || motionPaths[0];
        const len = path.getTotalLength();
        const period = 5200 + index * 900;
        const progress = ((now + index * 700) % period) / period;
        const point = path.getPointAtLength(len * progress);
        el.setAttribute('cx', point.x.toFixed(1));
        el.setAttribute('cy', point.y.toFixed(1));
      });
      window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  }



  drawCircuit('homeHeroCircuitPattern', 1200, 760, 22, 212);
  drawHeadlineCircuit('homeHeroHeadlineCircuit', 860, 420);
}());
