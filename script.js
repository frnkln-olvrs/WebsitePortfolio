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

/* ── 9. CONTACT FORM ─────────────────────────────────────── */
const ContactForm = (() => {
  function validate(data) {
    const errors = [];
    if (!data.name.trim() || data.name.trim().length < 2) {
      errors.push('Please enter your full name (at least 2 characters).');
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(data.email.trim())) {
      errors.push('Please enter a valid email address.');
    }
    if (!data.message.trim() || data.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters.');
    }
    return errors;
  }

  function showFeedback(el, type, message) {
    el.className = `form-feedback ${type}`;
    el.textContent = message;
    // Auto-clear success after 6 seconds
    if (type === 'success') {
      setTimeout(() => {
        el.className = 'form-feedback';
        el.textContent = '';
      }, 6000);
    }
  }

  function init() {
    const form     = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('form-submit');
    if (!form || !feedback) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const data = {
        name:    form.querySelector('#form-name')?.value    || '',
        email:   form.querySelector('#form-email')?.value   || '',
        subject: form.querySelector('#form-subject')?.value || '',
        message: form.querySelector('#form-message')?.value || '',
      };

      const errors = validate(data);
      if (errors.length) {
        showFeedback(feedback, 'error', errors[0]);
        return;
      }

      // Simulate async submission
      const btnText = submitBtn?.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Sending…';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.75'; }

      await new Promise(resolve => setTimeout(resolve, 1400));

      showFeedback(feedback, 'success', '✓ Message sent! I\'ll get back to you within 24 hours.');
      form.reset();
      if (btnText) btnText.textContent = 'Send Message';
      if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
    });
  }

  return { init };
})();

/* ── 10. FOOTER YEAR ─────────────────────────────────────── */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── 11. CURSOR GLOW (desktop only) ─────────────────────── */
const CursorGlow = (() => {
  let glow;

  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch devices

    glow = document.createElement('div');
    glow.id = 'cursor-glow';
    Object.assign(glow.style, {
      position:     'fixed',
      width:        '340px',
      height:       '340px',
      borderRadius: '50%',
      pointerEvents:'none',
      zIndex:       '0',
      opacity:      '0',
      background:   'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
      transform:    'translate(-50%,-50%)',
      transition:   'opacity 0.3s ease',
      willChange:   'transform',
    });
    document.body.appendChild(glow);

    let visible = false;
    let raf;

    document.addEventListener('mousemove', e => {
      if (!visible) { glow.style.opacity = '1'; visible = true; }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      });
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
      visible = false;
    });
  }

  return { init };
})();

/* ── 12. CARD TILT (subtle 3-D hover, desktop only) ─────── */
const CardTilt = (() => {
  const INTENSITY = 6; // degrees max

  function applyTilt(card, e) {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(900px) rotateX(${-dy * INTENSITY}deg) rotateY(${dx * INTENSITY}deg) translateY(-4px)`;
  }

  function init() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mousemove', e => applyTilt(card, e), { passive: true });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  return { init };
})();

/* ── 13. TIMELINE LINE DRAW ANIMATION ────────────────────── */
const TimelineDraw = (() => {
  function init() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const pseudoBefore = timeline;
    // We animate via a scoped CSS variable trick
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timeline.style.setProperty('--line-progress', '1');
          observer.unobserve(timeline);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(timeline);
  }

  return { init };
})();

/* ── 14. TYPING EFFECT (hero tagline) ────────────────────── */
const TypingEffect = (() => {
  const PHRASES = [
    'beautiful, performant digital experiences.',
    'fast & accessible web applications.',
    'scalable APIs and distributed systems.',
    'design systems that teams love.',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let isDeleting = false;
  let el;

  function tick() {
    const phrase = PHRASES[phraseIdx];
    const speed  = isDeleting ? 35 : 65;

    if (!isDeleting && charIdx <= phrase.length) {
      el.textContent = phrase.slice(0, charIdx++);
    } else if (isDeleting && charIdx >= 0) {
      el.textContent = phrase.slice(0, charIdx--);
    }

    if (!isDeleting && charIdx > phrase.length) {
      isDeleting = true;
      setTimeout(tick, 2200); // pause before deleting
      return;
    }

    if (isDeleting && charIdx < 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % PHRASES.length;
      charIdx    = 0;
      setTimeout(tick, 500);
      return;
    }

    setTimeout(tick, speed);
  }

  function init() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;

    // Replace content with a static + dynamic span
    const staticPart = 'I craft ';
    tagline.innerHTML = `${staticPart}<span class="text-accent" id="typing-target"></span><span class="typing-cursor" aria-hidden="true">|</span>`;

    // Inject cursor blink style
    const style = document.createElement('style');
    style.textContent = `.typing-cursor{display:inline-block;animation:cursorBlink 0.9s step-end infinite;color:var(--accent);font-weight:300;margin-left:1px;}@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}`;
    document.head.appendChild(style);

    el = document.getElementById('typing-target');
    setTimeout(tick, 1800); // start after skeleton fade
  }

  return { init };
})();

/* ── 15. ACCESSIBILITY: SKIP LINK ────────────────────────── */
function initSkipLink() {
  const skip = document.createElement('a');
  skip.href  = '#main-content';
  skip.textContent = 'Skip to main content';
  Object.assign(skip.style, {
    position:   'absolute',
    top:        '-100px',
    left:       '16px',
    zIndex:     '10000',
    background: 'var(--accent)',
    color:      '#fff',
    padding:    '8px 16px',
    borderRadius: 'var(--r-md)',
    fontWeight: '600',
    fontSize:   '0.9rem',
    transition: 'top 0.2s ease',
  });
  skip.addEventListener('focus', () => { skip.style.top = '16px'; });
  skip.addEventListener('blur',  () => { skip.style.top = '-100px'; });
  document.body.prepend(skip);
}

/* ── 16. LAZY LOAD IMAGES ────────────────────────────────── */
function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return; // native lazy loading
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        io.unobserve(img);
      }
    });
  });
  imgs.forEach(img => io.observe(img));
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  SkeletonLoader.init();
  ParticlesEngine.init();
  NavManager.init();
  RevealManager.init();
  SkillAnimator.init();
  CounterAnimator.init();
  ProjectFilter.init();
  ContactForm.init();
  CursorGlow.init();
  CardTilt.init();
  TimelineDraw.init();
  TypingEffect.init();
  initFooterYear();
  initSkipLink();
  initLazyImages();
});
