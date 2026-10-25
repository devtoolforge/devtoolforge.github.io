/* DevTools Journal — main.js
   Minimal faithful re-implementation of the reference behaviors:
   site-actions (hamburger slide-out) + sticky header (>=1000px). */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* ---------- site-actions ---------- */
  var header = document.querySelector('.site-header');
  var actions = document.querySelector('.site-actions');
  if (header && actions) {
    var triggers = header.querySelectorAll('[data-site-action-trigger]');
    var closer = actions.querySelector('[data-close-site-actions]');
    var panel = actions.querySelector('.site-actions__panel, .site-actions__container');

    function open() {
      closeAll();
      document.body.style.overflow = 'hidden';
      document.documentElement.style.setProperty('--kutak--dvh', window.innerHeight + 'px');
      actions.style.setProperty('--kutak--site-actions--height', panel ? panel.scrollHeight + 'px' : '100%');
      header.style.setProperty('--kutak--site-header--offset', Math.max(0, header.getBoundingClientRect().top) + 'px');
      actions.setAttribute('data-state', 'navigation-opening');
      triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
      setTimeout(function () { actions.setAttribute('data-state', 'navigation-open'); }, 20);
    }
    function closeAll() {
      triggers.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      actions.removeAttribute('data-state');
      document.body.style.overflow = '';
    }
    triggers.forEach(function (t) { t.addEventListener('click', open); });
    if (closer) closer.addEventListener('click', closeAll);
    actions.addEventListener('click', function (e) { if (e.target.closest('.site-actions__backdrop')) closeAll(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  }

  /* ---------- sticky header (desktop only) ---------- */
  if (header && 'IntersectionObserver' in window) {
    var mq = window.matchMedia('(min-width: 1000px)');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        header.setAttribute('data-is-sticky', en.isIntersecting ? 'false' : 'true');
      });
    }, { root: document, threshold: [1] });
    function sync() { mq.matches ? io.observe(header) : (io.unobserve(header), header.removeAttribute('data-is-sticky')); }
    sync();
    mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync);
  }

  /* ---------- dvh refresh ---------- */
  window.addEventListener('resize', function () {
    document.documentElement.style.setProperty('--kutak--dvh', window.innerHeight + 'px');
  });
})();
