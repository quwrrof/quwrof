/*
 * Starry background
 * Load it on any page with a script tag pointing to starry-snow.js.
 * It adds a fixed full-screen canvas behind your content.
 */
(function () {
  // ---- Settings you can tweak ----
  const CONFIG = {
    skyTop: '#050505',      // near black at the top
    skyMid: '#0c0c0c',      // mid sky
    skyHorizon: '#1c1c1c',  // soft grey near the bottom
    starDensity: 1 / 2600,  // stars per pixel² (higher = more stars)
    groundGlow: true,       // soft haze along the bottom
  };

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    zIndex: '-1', pointerEvents: 'none', display: 'block',
  });
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, stars = [], sky, ground;
  let t = 0;

  const STAR_TINTS = ['255,255,255', '225,225,225', '200,200,200'];

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, CONFIG.skyTop);
    sky.addColorStop(0.6, CONFIG.skyMid);
    sky.addColorStop(1, CONFIG.skyHorizon);

    ground = ctx.createLinearGradient(0, h * 0.82, 0, h);
    ground.addColorStop(0, 'rgba(230,230,230,0)');
    ground.addColorStop(1, 'rgba(230,230,230,0.10)');

    // Stars cluster toward the top of the sky
    const starCount = Math.round(w * h * CONFIG.starDensity);
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
      y: h * Math.pow(Math.random(), 1.6) * 0.9,
      r: Math.random() < 0.08 ? 1.2 + Math.random() * 0.8 : 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      tint: STAR_TINTS[(Math.random() * STAR_TINTS.length) | 0],
    }));

  }

  function drawStars() {
    for (const s of stars) {
      const twinkle = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      ctx.fillStyle = `rgba(${s.tint},${twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.r > 1.2) {
        // soft halo on the brightest stars
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        g.addColorStop(0, `rgba(${s.tint},${0.25 * twinkle})`);
        g.addColorStop(1, `rgba(${s.tint},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function frame() {
    t += 1 / 60;
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    drawStars();
    if (CONFIG.groundGlow) {
      ctx.fillStyle = ground;
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (reduceMotion) frame();
    }, 150);
  });

  build();
  frame();
})();