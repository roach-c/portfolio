/* =========================================================
   Caleb Roach — portfolio
   Three small jobs: the mobile menu, the scroll reveals, and the year.
   Everything degrades to a perfectly readable page without it.
   ========================================================= */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile menu ---------- */

  var toggle = document.getElementById('nav-toggle');
  var menu   = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Tapping any link closes the menu again.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Escape closes it too.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- scroll reveal ----------
     The CSS only hides [data-reveal] under html.js, so a visitor with
     JavaScript off sees the finished page rather than a blank one. */

  var targets = document.querySelectorAll('[data-reveal]');

  function showAll() {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add('in');
  }

  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);

    // Safety net: if anything above never fires, show the page anyway.
    window.setTimeout(showAll, 4000);
  }

  /* ---------- footer year ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
