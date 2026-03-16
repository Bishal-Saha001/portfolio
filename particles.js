/* ══════════════════════════════════════════════════
   MOBILE PARTICLES — Subtle floating particles
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

  // Particle config
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

  // Connection lines between nearby particles
  function drawConnections(time) {
    const maxDist = 100;
    const dark = isDark();

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
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

    animId = requestAnimationFrame(draw);
  }

  // Start after a short delay to let the page settle
  setTimeout(() => {
    animId = requestAnimationFrame(draw);
  }, 500);
})();
