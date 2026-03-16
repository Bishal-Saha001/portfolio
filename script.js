/* ══════════════════════════════════════════════════
   PORTFOLIO — SCRIPT
   ══════════════════════════════════════════════════ */

(() => {
  'use strict';

  const LOADING_DURATION = 3500;
  const STAGGER_BASE = 200;

  const loadingScreen = document.getElementById('loading-screen');
  const mainPage = document.getElementById('main-page');
  const heroElements = document.querySelectorAll('.hero-anim');

  /* ═══════════════════════════════════════════════
     1. PARTICLE "WELCOME" LOADING ANIMATION
     ═══════════════════════════════════════════════ */

  // Only show loading animation on first visit / refresh, not on internal navigation
  const hasSeenLoader = sessionStorage.getItem('loaderPlayed');

  if (!hasSeenLoader && loadingScreen) {
    sessionStorage.setItem('loaderPlayed', 'true');

    (function initParticleLoader() {
      const canvas = document.getElementById('particle-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;

      function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
      }
      resize();

      // Colors — vibrant palette
      const COLORS = [
        '#FF6B6B', '#4ECDC4', '#FFD93D', '#C084FC',
        '#60A5FA', '#F472B6', '#34D399', '#FBBF24',
        '#A78BFA', '#38BDF8', '#FB923C', '#E879F9'
      ];

      // Render "Welcome" to offscreen canvas to sample pixel positions
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      const textForDisplay = 'Welcome';
      const fontSize = Math.min(window.innerWidth * 0.12, 120);
      offCanvas.width = window.innerWidth;
      offCanvas.height = window.innerHeight;
      offCtx.fillStyle = '#fff';
      offCtx.font = `bold ${fontSize}px 'Outfit', sans-serif`;
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillText(textForDisplay, offCanvas.width / 2, offCanvas.height / 2);

      // Sample pixels to find target positions
      const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const targets = [];
      const gap = 4; // Sample every 4 pixels
      for (let y = 0; y < offCanvas.height; y += gap) {
        for (let x = 0; x < offCanvas.width; x += gap) {
          const i = (y * offCanvas.width + x) * 4;
          if (imageData.data[i + 3] > 128) {
            targets.push({ x, y });
          }
        }
      }

      // Limit particle count for performance
      const maxParticles = 800;
      const step = Math.max(1, Math.floor(targets.length / maxParticles));
      const selectedTargets = [];
      for (let i = 0; i < targets.length; i += step) {
        selectedTargets.push(targets[i]);
      }

      // Create particles with random starting positions
      const w = window.innerWidth;
      const h = window.innerHeight;
      const particles = selectedTargets.map(t => ({
        x: Math.random() * w,
        y: Math.random() * h,
        tx: t.x,
        ty: t.y,
        radius: 1.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.4,      // staggered start
        speed: 0.015 + Math.random() * 0.01,
        progress: 0
      }));

      let startTime = null;
      let animId;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000; // seconds
        const totalDuration = 2.2;

        ctx.clearRect(0, 0, w, h);

        particles.forEach(p => {
          const t = Math.max(0, Math.min(1, (elapsed - p.delay) / (totalDuration - p.delay)));
          const eased = easeInOutCubic(t);

          const cx = p.x + (p.tx - p.x) * eased;
          const cy = p.y + (p.ty - p.y) * eased;

          ctx.beginPath();
          ctx.arc(cx, cy, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.3 + eased * 0.7;
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        if (elapsed < totalDuration + 1) {
          animId = requestAnimationFrame(animate);
        }
      }

      animId = requestAnimationFrame(animate);
    })();

    /* ═══════════════════════════════════════════════
       2. LOADING → MAIN TRANSITION
       ═══════════════════════════════════════════════ */
    function finishLoading() {
      loadingScreen.classList.add('exit');
      loadingScreen.addEventListener('animationend', () => {
        loadingScreen.style.display = 'none';
        mainPage.classList.add('visible');
        revealHero();
        initD3Force();
      }, { once: true });
    }

    setTimeout(finishLoading, LOADING_DURATION);

  } else {
    // Skip loader — show content immediately
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (mainPage) {
      mainPage.classList.add('visible');
      revealHero();
      initD3Force();
    }
  }

  /* ═══════════════════════════════════════════════
     DARK MODE TOGGLE
     ═══════════════════════════════════════════════ */
  const darkToggle = document.getElementById('dark-mode-toggle');

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-mode');
  }

  darkToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
  });

  /* ═══════════════════════════════════════════════
     2. STAGGERED HERO ENTRANCE
     ═══════════════════════════════════════════════ */
  function revealHero() {
    heroElements.forEach((el) => {
      const delay = parseInt(el.dataset.delay, 10) || 0;
      setTimeout(() => el.classList.add('visible'), delay * STAGGER_BASE);
    });
  }

  /* ═══════════════════════════════════════════════
     3. D3 FORCE BUBBLE ANIMATION (white bubbles)
     ═══════════════════════════════════════════════ */
  function initD3Force() {
    if (window.innerWidth <= 768) return; // skip animation on mobile
    const container = document.getElementById('d3-force-container');
    const canvas = document.getElementById('d3-force-canvas');
    if (!container || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const context = canvas.getContext('2d');

    function resize() {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h };
    }

    let { w: width, h: height } = resize();

    /* Generate data — bigger bubbles for full-area */
    const k = Math.min(width, height) / 150;
    const r = d3.randomUniform(k * 1.2, k * 3);
    const n = 4;
    const data = Array.from({ length: 180 }, (_, i) => ({
      r: r(),
      group: i && (i % n + 1)
    }));

    const nodes = data.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .alphaTarget(0.3)
      .velocityDecay(0.1)
      .force('x', d3.forceX().strength(0.01))
      .force('y', d3.forceY().strength(0.01))
      .force('collide', d3.forceCollide().radius(d => d.r + 1.5).iterations(3))
      .force('charge', d3.forceManyBody().strength((d, i) => i ? 0 : -width * 2 / 3))
      .on('tick', ticked);

    canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    canvas.addEventListener('pointermove', pointermoved);

    function pointermoved(event) {
      const cRect = canvas.getBoundingClientRect();
      const x = event.clientX - cRect.left;
      const y = event.clientY - cRect.top;
      nodes[0].fx = x - width / 2;
      nodes[0].fy = y - height / 2;
    }

    /* ── Draw a single white bubble ── */
    function drawGlassBall(cx, cy, radius) {
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fillStyle = document.body.classList.contains('dark-mode') ? '#2a4a7f' : '#ffffff';
      context.fill();
    }

    function ticked() {
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);

      context.shadowColor = 'rgba(0, 0, 0, 0.06)';
      context.shadowBlur = 4;
      context.shadowOffsetY = 1;

      for (let i = 1; i < nodes.length; ++i) {
        const d = nodes[i];
        drawGlassBall(d.x, d.y, d.r);
      }

      context.shadowColor = 'transparent';
      context.shadowBlur = 0;
      context.restore();
    }

    /* Handle window resize */
    window.addEventListener('resize', () => {
      const dims = resize();
      width = dims.w;
      height = dims.h;
    });
  }

})();
