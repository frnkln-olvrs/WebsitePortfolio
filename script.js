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
