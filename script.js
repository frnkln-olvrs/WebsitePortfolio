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

/* ── 4. NAVIGATION ───────────────────────────────────────── */
const NavManager = (() => {
  let lastScroll = 0;

  function initScrollStyle() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 20);
      lastScroll = y;
    }, { passive: true });
  }

  function initReadProgress() {
    const bar = document.getElementById('nav-progress');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const docH  = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      bar.style.width = `${Math.min(pct, 100)}%`;
    }, { passive: true });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });

        // Close mobile menu
        const navLinks = document.getElementById('nav-links');
        const hamburger = document.getElementById('nav-hamburger');
        if (navLinks) navLinks.classList.remove('open');
        if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
      });
    });
  }

  function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  function initHamburger() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks  = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function init() {
    initScrollStyle();
    initReadProgress();
    initSmoothScroll();
    initActiveSection();
    initHamburger();
  }

  return { init };
})();

/* ── 5. SCROLL REVEAL ────────────────────────────────────── */
const RevealManager = (() => {
  let observer;

  function init() {
    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom');
    if (!elements.length) return;

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  function triggerHero() {
    // Immediately reveal hero elements after skeleton fades
    document.querySelectorAll('.hero-section .reveal-left, .hero-section .reveal-right').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 120);
    });
  }

  return { init, triggerHero };
})();

/* ── 6. SKILL BAR ANIMATIONS ─────────────────────────────── */
const SkillAnimator = (() => {
  function init() {
    const fills = document.querySelectorAll('.skill-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.dataset.width || '0';
          // Small stagger based on position in parent
          const idx = Array.from(fill.closest('.skill-bars')?.children || []).indexOf(fill.closest('.skill-bar-item'));
          setTimeout(() => {
            fill.style.width = `${width}%`;
          }, Math.max(0, idx) * 100);
          observer.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach(f => observer.observe(f));
  }

  return { init };
})();

/* ── 7. COUNTER ANIMATIONS ───────────────────────────────── */
const CounterAnimator = (() => {
  function animateCount(el, target, duration = 1800) {
    const start = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function init() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCount(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  return { init };
})();

/* ── 8. PROJECT FILTER ───────────────────────────────────── */
const ProjectFilter = (() => {
  function init() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards   = document.querySelectorAll('.project-card');

    if (!buttons.length || !cards.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update button state
        buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;

        cards.forEach((card, idx) => {
          const match = filter === 'all' || card.dataset.category === filter;

          if (match) {
            card.classList.remove('hidden-card');
            // Stagger re-entry
            card.style.transitionDelay = `${idx * 0.04}s`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => card.classList.add('visible'));
            });
          } else {
            card.classList.remove('visible');
            card.classList.add('hidden-card');
            card.style.transitionDelay = '0s';
          }
        });
      });
    });
  }

  return { init };
})();

