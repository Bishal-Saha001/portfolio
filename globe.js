/* ══════════════════════════════════════════════════
   MOBILE GLOBE — Interactive orthographic globe
   Half-visible on right, touch-rotatable, Bangalore pin
   Only runs on mobile (≤768px)
   ══════════════════════════════════════════════════ */
(() => {
  'use strict';

  if (window.innerWidth > 768) return;

  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Bangalore coordinates
  const BANGALORE = [77.5946, 12.9716]; // [lng, lat]

  // Globe sizing
  let size, radius;

  function resize() {
    const container = canvas.parentElement;
    size = container.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    radius = size / 2 - 2;
    projection.translate([size / 2, size / 2]).scale(radius);
    draw();
  }

  // Orthographic projection centered on Bangalore
  const projection = {
    _rotate: [-BANGALORE[0], -BANGALORE[1]],
    _translate: [0, 0],
    _scale: 100,
    rotate(r) { if (!arguments.length) return this._rotate; this._rotate = r; return this; },
    translate(t) { if (!arguments.length) return this._translate; this._translate = t; return this; },
    scale(s) { if (!arguments.length) return this._scale; this._scale = s; return this; },
    project(coords) {
      const lambda = (coords[0] + this._rotate[0]) * Math.PI / 180;
      const phi = (coords[1] + this._rotate[1]) * Math.PI / 180;
      const cosP = Math.cos(phi);
      const x = cosP * Math.sin(lambda);
      const y = -Math.sin(phi);
      const z = cosP * Math.cos(lambda);
      if (z < 0) return null; // behind globe
      return [
        this._translate[0] + this._scale * x,
        this._translate[1] + this._scale * y
      ];
    }
  };

  // Simplified world — graticule lines + major landmass outlines
  function drawGraticule() {
    const dark = document.documentElement.classList.contains('dark-mode');
    const lineColor = dark ? 'rgba(100, 140, 200, 0.2)' : 'rgba(180, 150, 100, 0.2)';

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.5;

    // Meridians (longitude lines every 30°)
    for (let lng = -180; lng <= 180; lng += 30) {
      ctx.beginPath();
      let moved = false;
      for (let lat = -90; lat <= 90; lat += 2) {
        const p = projection.project([lng, lat]);
        if (p) {
          if (!moved) { ctx.moveTo(p[0], p[1]); moved = true; }
          else ctx.lineTo(p[0], p[1]);
        } else {
          moved = false;
        }
      }
      ctx.stroke();
    }

    // Parallels (latitude lines every 30°)
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let moved = false;
      for (let lng = -180; lng <= 180; lng += 2) {
        const p = projection.project([lng, lat]);
        if (p) {
          if (!moved) { ctx.moveTo(p[0], p[1]); moved = true; }
          else ctx.lineTo(p[0], p[1]);
        } else {
          moved = false;
        }
      }
      ctx.stroke();
    }
  }

  // Simplified continent outlines (key points)
  const CONTINENTS = [
    // India (simplified)
    [[68,8],[68,23],[72,22],[72,25],[77,28],[80,28],[85,27],[88,22],[88,27],[92,26],[97,28],[97,16],[93,18],[88,8],[85,12],[80,10],[77,8],[72,20],[68,22],[68,8]],
    // Africa (simplified)
    [[-17,15],[-12,15],[-8,10],[-5,5],[5,5],[10,2],[10,-5],[30,-5],[35,-12],[40,-16],[35,-25],[30,-34],[20,-35],[18,-30],[12,-18],[10,-5],[15,0],[20,10],[32,10],[35,12],[40,12],[43,12],[50,12],[42,15],[35,30],[32,37],[10,37],[0,36],[-5,36],[-10,35],[-17,22],[-17,15]],
    // Europe (very simplified)
    [[-10,36],[0,36],[5,44],[0,47],[-5,48],[3,51],[5,54],[10,55],[12,57],[18,60],[25,60],[30,60],[40,55],[42,42],[30,37],[25,38],[20,40],[15,38],[12,44],[5,44],[0,43],[-10,36]],
    // Asia (simplified)
    [[42,42],[50,40],[55,42],[60,40],[65,38],[68,23],[77,28],[85,27],[88,27],[97,28],[100,22],[105,22],[110,20],[115,22],[120,25],[125,30],[130,35],[132,35],[140,40],[145,45],[140,50],[135,55],[120,55],[100,50],[80,50],[70,55],[60,55],[50,50],[42,42]],
    // South America (simplified)
    [[-80,10],[-77,7],[-75,5],[-75,0],[-70,-5],[-70,-15],[-65,-18],[-60,-22],[-55,-23],[-50,-28],[-53,-33],[-58,-38],[-65,-42],[-68,-46],[-72,-50],[-75,-52],[-72,-45],[-70,-40],[-72,-35],[-71,-30],[-70,-18],[-75,-10],[-78,-5],[-80,0],[-80,10]],
    // North America (simplified)
    [[-170,65],[-165,60],[-160,55],[-150,60],[-140,60],[-130,55],[-125,50],[-125,40],[-117,33],[-110,30],[-105,25],[-100,20],[-95,18],[-90,20],[-85,22],[-83,10],[-80,8],[-77,18],[-80,25],[-82,30],[-78,35],[-75,40],[-70,42],[-68,45],[-65,48],[-60,47],[-55,50],[-60,55],[-65,60],[-70,60],[-80,63],[-95,65],[-110,65],[-130,70],[-145,70],[-160,70],[-170,65]],
    // Australia (simplified)
    [[115,-35],[117,-32],[120,-33],[125,-32],[130,-32],[135,-35],[138,-34],[140,-38],[145,-39],[150,-37],[153,-28],[148,-20],[145,-15],[142,-11],[136,-12],[130,-15],[128,-15],[122,-18],[115,-22],[114,-26],[115,-35]],
  ];

  function drawContinents() {
    const dark = document.documentElement.classList.contains('dark-mode');
    ctx.fillStyle = dark ? 'rgba(80, 120, 180, 0.15)' : 'rgba(170, 140, 90, 0.18)';
    ctx.strokeStyle = dark ? 'rgba(100, 150, 210, 0.3)' : 'rgba(160, 130, 80, 0.3)';
    ctx.lineWidth = 0.8;

    for (const continent of CONTINENTS) {
      ctx.beginPath();
      let started = false;
      let anyVisible = false;

      for (const coord of continent) {
        const p = projection.project(coord);
        if (p) {
          if (!started) { ctx.moveTo(p[0], p[1]); started = true; }
          else ctx.lineTo(p[0], p[1]);
          anyVisible = true;
        } else {
          started = false;
        }
      }

      if (anyVisible) {
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  function drawBangalorePin() {
    const p = projection.project(BANGALORE);
    if (!p) return;

    const time = Date.now() * 0.004;
    const blink = (Math.sin(time) + 1) / 2; // 0 → 1
    const pulse = Math.sin(time * 1.2) * 0.5 + 1;

    // Outer glow ring (expanding pulse)
    ctx.beginPath();
    ctx.arc(p[0], p[1], 14 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 40, 40, ${0.08 + blink * 0.1})`;
    ctx.fill();

    // Mid glow
    ctx.beginPath();
    ctx.arc(p[0], p[1], 9, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 30, 30, ${0.15 + blink * 0.2})`;
    ctx.fill();

    // Inner ring
    ctx.beginPath();
    ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 20, 20, ${0.5 + blink * 0.4})`;
    ctx.fill();

    // Bright core dot
    ctx.beginPath();
    ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, ${30 + blink * 50}, ${20 + blink * 30}, ${0.8 + blink * 0.2})`;
    ctx.fill();

    // White-hot center for brightness
    ctx.beginPath();
    ctx.arc(p[0], p[1], 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 180, ${0.4 + blink * 0.6})`;
    ctx.fill();
  }

  function drawGlobe() {
    const dark = document.documentElement.classList.contains('dark-mode');
    const cx = size / 2;
    const cy = size / 2;

    // Globe outline circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = dark ? 'rgba(10, 20, 40, 0.4)' : 'rgba(255, 248, 235, 0.4)';
    ctx.fill();
    ctx.strokeStyle = dark ? 'rgba(100, 150, 220, 0.15)' : 'rgba(180, 150, 100, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clip to globe circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    drawGraticule();
    drawContinents();
    drawBangalorePin();

    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    drawGlobe();
  }

  // Animate the Bangalore pin pulse + auto-rotate
  let animId;
  const AUTO_ROTATE_SPEED = 0.15; // degrees per frame (slow drift)

  function animate() {
    applyMomentum();
    // Auto-rotate when not dragging and momentum has settled
    if (!isDragging && Math.abs(velocityX) < 0.05 && Math.abs(velocityY) < 0.05) {
      const rot = projection.rotate();
      projection.rotate([rot[0] + AUTO_ROTATE_SPEED, rot[1]]);
    }
    draw();
    animId = requestAnimationFrame(animate);
  }

  // Touch/drag rotation with momentum
  let isDragging = false;
  let lastX, lastY;
  let velocityX = 0, velocityY = 0;
  const friction = 0.92;
  const sens = 0.35;

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    velocityX = 0;
    velocityY = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    velocityX = dx * sens;
    velocityY = dy * sens;

    const rot = projection.rotate();
    projection.rotate([rot[0] + velocityX, rot[1] - velocityY]);

    lastX = e.clientX;
    lastY = e.clientY;
  });

  function applyMomentum() {
    if (!isDragging && (Math.abs(velocityX) > 0.05 || Math.abs(velocityY) > 0.05)) {
      velocityX *= friction;
      velocityY *= friction;
      const rot = projection.rotate();
      projection.rotate([rot[0] + velocityX, rot[1] - velocityY]);
    }
  }

  canvas.addEventListener('pointerup', () => { isDragging = false; });
  canvas.addEventListener('pointercancel', () => { isDragging = false; });

  // Prevent page scroll while dragging globe
  canvas.addEventListener('touchmove', (e) => {
    if (isDragging) e.preventDefault();
  }, { passive: false });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      cancelAnimationFrame(animId);
      return;
    }
    resize();
  });

  resize();
  animate();
})();
