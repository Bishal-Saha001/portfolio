/* ══════════════════════════════════════════════════
   MOBILE PARTICLES — Subtle floating particles
   + Touch-interactive burst particles
   Only runs on mobile (≤768px)
   ══════════════════════════════════════════════════ */
(() => {
  'use strict';

  if (window.innerWidth > 768) return;

  const canvas = document.getElementById('mobile-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let w, h;
  let animId;

  function resize() {
    const hero = canvas.closest('.hero');
    w = hero ? hero.offsetWidth : window.innerWidth;
    h = hero ? hero.offsetHeight : window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      cancelAnimationFrame(animId);
      return;
    }
    resize();
  });

  // Detect dark mode
  function isDark() {
    return document.documentElement.classList.contains('dark-mode');
  }

  // ── Ambient particles ──
  const PARTICLE_COUNT = 40;
  const particles = [];

  function createParticle() {
    const size = Math.random() * 3.5 + 1;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      size: size,
      baseSize: size,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.25 - 0.1,
      opacity: Math.random() * 0.35 + 0.08,
      baseOpacity: Math.random() * 0.35 + 0.08,
      pulseSpeed: Math.random() * 0.008 + 0.003,
      pulseOffset: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.4 + 0.1,
      driftOffset: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }

  // ── Touch-burst particles ──
  const burstParticles = [];
  const BURST_COUNT = 6;        // particles per touch burst
  const BURST_LIFESPAN = 90;    // frames before fade out
  const BURST_MOVE_COUNT = 3;   // particles per move event

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.8 + 0.5;
      const size = Math.random() * 3 + 1.5;
      burstParticles.push({
        x: x,
        y: y,
        size: size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: Math.random() * 0.4 + 0.3,
        life: BURST_LIFESPAN,
        maxLife: BURST_LIFESPAN,
        friction: 0.97,
      });
    }
  }

  // Touch/pointer event handlers — enable interactive canvas
  let lastSpawnTime = 0;
  const SPAWN_THROTTLE = 60; // ms between spawns during drag

  // Make canvas accept pointer events for interaction
  canvas.style.pointerEvents = 'auto';
  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnBurst(x, y, BURST_COUNT);
    lastSpawnTime = Date.now();
  });

  canvas.addEventListener('pointermove', (e) => {
    // Only spawn if pointer is pressed (dragging)
    if (e.pressure === 0 && e.buttons === 0) return;
    const now = Date.now();
    if (now - lastSpawnTime < SPAWN_THROTTLE) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnBurst(x, y, BURST_MOVE_COUNT);
    lastSpawnTime = now;
  });

  // Connection lines between nearby particles (ambient + burst)
  function drawConnections(time) {
    const maxDist = 100;
    const dark = isDark();

    // Combine ambient and burst particles for connections
    const all = [...particles, ...burstParticles];

    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const dx = all[i].x - all[j].x;
        const dy = all[i].y - all[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.06;
          ctx.beginPath();
          ctx.moveTo(all[i].x, all[i].y);
          ctx.lineTo(all[j].x, all[j].y);
          ctx.strokeStyle = dark
            ? `rgba(180, 200, 255, ${alpha})`
            : `rgba(180, 140, 80, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let time = 0;

  function draw() {
    time += 1;
    ctx.clearRect(0, 0, w, h);

    const dark = isDark();

    drawConnections(time);

    // Draw ambient particles
    for (const p of particles) {
      // Gentle sine drift
      const driftX = Math.sin(time * 0.01 + p.driftOffset) * p.drift;
      const driftY = Math.cos(time * 0.012 + p.driftOffset) * p.drift * 0.6;

      p.x += p.vx + driftX * 0.05;
      p.y += p.vy + driftY * 0.05;

      // Pulse size & opacity
      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset);
      p.size = p.baseSize + pulse * 0.6;
      p.opacity = p.baseOpacity + pulse * 0.06;

      // Wrap around edges
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      // Draw particle with soft glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = dark
        ? `rgba(160, 190, 255, ${p.opacity})`
        : `rgba(200, 160, 90, ${p.opacity})`;
      ctx.fill();

      // Soft outer glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = dark
        ? `rgba(140, 170, 240, ${p.opacity * 0.15})`
        : `rgba(210, 170, 100, ${p.opacity * 0.15})`;
      ctx.fill();
    }

    // Draw & update touch-burst particles
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const bp = burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vx *= bp.friction;
      bp.vy *= bp.friction;
      bp.life--;

      // Fade out based on remaining life
      const lifeRatio = bp.life / bp.maxLife;
      const fadeOpacity = bp.opacity * lifeRatio;

      if (bp.life <= 0) {
        burstParticles.splice(i, 1);
        continue;
      }

      // Draw burst particle — brighter glow
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, bp.size * (0.5 + lifeRatio * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = dark
        ? `rgba(180, 210, 255, ${fadeOpacity})`
        : `rgba(230, 190, 110, ${fadeOpacity})`;
      ctx.fill();

      // Outer glow for burst
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, bp.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = dark
        ? `rgba(160, 190, 255, ${fadeOpacity * 0.2})`
        : `rgba(220, 180, 100, ${fadeOpacity * 0.2})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(draw);
  }

  // Start after a short delay to let the page settle
  setTimeout(() => {
    animId = requestAnimationFrame(draw);
  }, 500);
})();

