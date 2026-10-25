/* ============================================================
   demo-schedule.js — DEMO ONLY publishing scheduler
   ------------------------------------------------------------
   Mechanism (static-site friendly, GitHub Pages safe):
   - All demo post cards are rendered in the HTML with
     data-publish-at="<epoch-ms>" and data-published="false".
   - On first visit the epoch is stored in localStorage;
     every scheduled post publishes exactly 15 minutes later
     than the previous one (initial posts are always visible —
     their dates are in the past).
   - A 15-second ticker flips cards to visible when their time
     arrives and updates the status strip with a countdown.
   - "Reset schedule" clears the epoch so the whole 15-minute
     cycle can be watched again.
   - In production this file is removed; real scheduling is done
     at build time (67 posts / 8h batch pipeline).
   ============================================================ */
(function () {
  'use strict';
  var EPOCH_KEY = 'dtj_demo_epoch_v1';
  var TICK_MS = 15000;
  var strips = document.querySelectorAll('[data-demo-strip]');

  function epoch() {
    var v = window.localStorage.getItem(EPOCH_KEY);
    if (!v) {
      v = String(Date.now());
      try { window.localStorage.setItem(EPOCH_KEY, v); } catch (e) {}
    }
    return parseInt(v, 10);
  }

  function reset() {
    try { window.localStorage.removeItem(EPOCH_KEY); } catch (e) {}
    window.location.reload();
  }

  function fmtTime(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function fmtDate(d) {
    var M = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return M[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function tick() {
    var now = Date.now();
    var ep = epoch();
    var cards = document.querySelectorAll('[data-demo-card]');
    var published = 0, total = cards.length, nextIn = null;

    cards.forEach(function (card) {
      var off = card.getAttribute('data-publish-offset');
      var at = off !== null ? ep + parseInt(off, 10) : 0;  // no offset = already live
      var isPub = now >= at;
      card.setAttribute('data-published', isPub ? 'true' : 'false');
      if (isPub) {
        published++;
        // fill the displayed date once, at publish moment
        var dateEl = card.querySelector('[data-dynamic-date]');
        if (dateEl && !dateEl.textContent) {
          dateEl.textContent = fmtDate(new Date(at));
        }
      } else if (nextIn === null || at < nextIn) {
        nextIn = at;
      }
    });

    strips.forEach(function (strip) {
      var dot = strip.querySelector('[data-demo-dot]');
      var label = strip.querySelector('[data-demo-label]');
      if (!label) return;
      var pending = total - published;
      if (pending === 0) {
        if (dot) dot.className = 'demo-strip__dot';
        label.textContent = 'Demo schedule complete \u2014 all ' + total + ' articles published';
      } else {
        var wait = nextIn !== null ? fmtTime(nextIn - now) : '--:--';
        if (dot) dot.className = 'demo-strip__dot demo-strip__dot--waiting';
        label.textContent = published + ' of ' + total + ' articles published \u00b7 next article in ' + wait;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    epoch(); // lock the epoch on first visit
    tick();
    setInterval(tick, TICK_MS);
    document.querySelectorAll('[data-demo-reset]').forEach(function (btn) {
      btn.addEventListener('click', reset);
    });
  });
})();
