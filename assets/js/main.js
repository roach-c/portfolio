/* =========================================================
   Caleb Roach — portfolio
   Four small jobs: the mobile menu, the scroll reveals, the gallery
   viewer on the media page, and the year.
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

  /* ---------- gallery viewer (media page) ----------
     Each tile is a real link to its image, so with JavaScript off, or in a
     browser without <dialog>, it simply opens the picture. */

  var box   = document.getElementById('lightbox');
  var tiles = document.querySelectorAll('.gal__tile');

  if (box && tiles.length && typeof box.showModal === 'function') {
    var boxImg   = document.getElementById('lightbox-img');
    var boxTitle = document.getElementById('lightbox-title');
    var boxCap   = document.getElementById('lightbox-caption');
    var boxCount = document.getElementById('lightbox-count');
    var current  = 0;

    var show = function (i) {
      current = (i + tiles.length) % tiles.length;
      var tile  = tiles[current];
      var thumb = tile.querySelector('img');
      boxImg.src = tile.getAttribute('href');
      boxImg.alt = thumb ? thumb.alt : '';
      boxTitle.textContent = tile.getAttribute('data-title') || '';
      boxCap.textContent   = tile.getAttribute('data-caption') || '';
      boxCount.textContent = (current + 1) + ' of ' + tiles.length;
    };

    Array.prototype.forEach.call(tiles, function (tile, i) {
      tile.addEventListener('click', function (e) {
        e.preventDefault();
        show(i);
        box.showModal();
      });
    });

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('[data-lightbox-close]')) box.close();
      else if (e.target.closest('[data-lightbox-prev]')) show(current - 1);
      else if (e.target.closest('[data-lightbox-next]')) show(current + 1);
    });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- footer year ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
