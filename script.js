/* ============================================================
   FRAANKLIN OLIVEROS — PORTFOLIO  |  script.js
   Theme · Skeleton · Particles · Scroll · Nav · Form · Stats
   ============================================================ */

'use strict';

/* ── 1. THEME SYSTEM ─────────────────────────────────────── */
const ThemeManager = (() => {
  const KEY = 'portfolio-theme';
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  function getSystemPref() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    if (btn) btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }

  function init() {
    const saved = localStorage.getItem(KEY);
    apply(saved || getSystemPref());

    if (btn) {
      btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        apply(current === 'dark' ? 'light' : 'dark');
      });
    }

    // React to OS preference changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
      if (!localStorage.getItem(KEY)) apply(e.matches ? 'light' : 'dark');
    });
  }

  return { init };
})();

/* ── 2. SKELETON LOADER ──────────────────────────────────── */
const SkeletonLoader = (() => {
  function init() {
    const overlay = document.getElementById('skeleton-overlay');
    if (!overlay) return;

    const DURATION = 1400 + Math.random() * 400; // 1.4s – 1.8s

    setTimeout(() => {
      overlay.classList.add('hidden');
      document.body.classList.remove('loading');
      // Trigger entrance animations after skeleton fades
      setTimeout(() => RevealManager.triggerHero(), 300);
    }, DURATION);
  }

  return { init };
})();

/* ── 3. PARTICLES CANVAS ─────────────────────────────────── */
const ParticlesEngine = (() => {
  let canvas, ctx, particles = [], animId, W, H;

  const COUNT_DESKTOP = 55;
  const COUNT_MOBILE  = 22;

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 10;
      this.r    = 0.6 + Math.random() * 1.6;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = -(0.15 + Math.random() * 0.35);
      this.life = 0;
      this.maxLife = 220 + Math.random() * 160;
      this.alpha = 0;
    }

    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life += 1;
      const progress = this.life / this.maxLife;
      this.alpha = progress < 0.15
        ? progress / 0.15
        : progress > 0.85
          ? (1 - progress) / 0.15
          : 1;
      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99,102,241,${this.alpha * 0.55})`;
      ctx.fill();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    const count = window.innerWidth < 640 ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({ length: count }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  function init() {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    spawn();
    loop();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); spawn(); }, 200);
    });

    // Pause when tab hidden (save CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        loop();
      }
    });
  }

  return { init };
})();