/* =========================================================
   main.js — curtain, cursor, ticker, reveals, hover warps
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lerp = function (a, b, n) { return a + (b - a) * n; };

  /* ---------------------------------------------------------
     1. Curtain
     --------------------------------------------------------- */
  (function curtain() {
    var el = document.getElementById('curtain');
    var num = document.getElementById('count');
    if (!el) return;
    if (reduced) { el.remove(); return; }

    document.documentElement.classList.add('is-locked');

    var v = 0, start = performance.now(), dur = 1500;
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      v = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      if (num) num.textContent = v;
      if (p < 1) { requestAnimationFrame(tick); }
      else {
        el.classList.add('done');
        document.documentElement.classList.remove('is-locked');
        setTimeout(function () { el.remove(); }, 1400);
      }
    })(start);
  })();

  /* ---------------------------------------------------------
     2. Cursor
     --------------------------------------------------------- */
  (function cursor() {
    var el = document.getElementById('cursor');
    if (!el || reduced || window.matchMedia('(hover: none)').matches) return;
    var label = el.querySelector('.cursor__label');

    var x = window.innerWidth / 2, y = window.innerHeight / 2, tx = x, ty = y;

    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function run() {
      x = lerp(x, tx, 0.2); y = lerp(y, ty, 0.2);
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      requestAnimationFrame(run);
    })();

    document.querySelectorAll('a, button, [data-magnet]').forEach(function (n) {
      var text = n.hasAttribute('data-cursor') ? n.getAttribute('data-cursor')
               : (n.closest('.card') ? 'View'
               : (n.closest('.practice__row') ? 'Open' : ''));
      n.addEventListener('pointerenter', function () {
        el.classList.add('is-big');
        if (label) label.textContent = text;
      });
      n.addEventListener('pointerleave', function () {
        el.classList.remove('is-big');
        if (label) label.textContent = '';
      });
    });
  })();

  /* ---------------------------------------------------------
     3. Ticker — duplicated until it overflows, then scrolled
     --------------------------------------------------------- */
  (function ticker() {
    var track = document.getElementById('ticker-track');
    if (!track) return;

    var unit = track.innerHTML;
    var guard = 0;
    while (track.scrollWidth < window.innerWidth * 2 && guard++ < 12) {
      track.innerHTML += unit;
    }
    if (reduced) return;

    var half = track.scrollWidth / 2, off = 0;
    (function run() {
      off -= 0.55;
      if (-off >= half) off += half;
      track.style.transform = 'translate3d(' + off + 'px,0,0)';
      requestAnimationFrame(run);
    })();
  })();

  /* ---------------------------------------------------------
     4. Line splitting

     Headings are measured, grouped into visual lines, then rebuilt so
     each line can rise independently. <mark> survives the round trip:
     every word carries a highlight flag and a "space before me" flag,
     and runs of highlighted words are re-wrapped per line. A phrase
     that wraps therefore gets one block per line, not one stretched
     box, which is what the effect is supposed to look like.
     --------------------------------------------------------- */
  (function split() {
    function esc(t) {
      return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    document.querySelectorAll('[data-split]').forEach(function (el) {

      // 1. flatten to words, remembering highlight state and spacing
      var items = [], gap = false;

      (function walk(node, hl) {
        Array.prototype.forEach.call(node.childNodes, function (n) {
          if (n.nodeType === 3) {
            var t = n.textContent;
            if (!t) return;
            if (/^\s/.test(t)) gap = true;
            t.split(/\s+/).filter(Boolean).forEach(function (w, i) {
              items.push({ w: w, hl: hl, pre: items.length ? (i ? true : gap) : false });
              gap = false;
            });
            if (/\s$/.test(t)) gap = true;
          } else if (n.nodeType === 1) {
            walk(n, hl || n.tagName === 'MARK');
          }
        });
      })(el, false);

      if (!items.length) return;

      // 2. lay the words out so the browser tells us where the lines fall.
      //    Words with pre:false are glued to the previous one (punctuation
      //    that sits outside a highlight) so they cannot be split apart.
      el.innerHTML = items.map(function (it) {
        return (it.pre ? ' ' : '') + '<span class="w">' + esc(it.w) + '</span>';
      }).join('');

      var spans = Array.prototype.slice.call(el.querySelectorAll('.w'));
      var lines = [], last = null;
      spans.forEach(function (s, i) {
        var top = s.offsetTop;
        if (last === null || Math.abs(top - last) > 4) { lines.push([]); last = top; }
        lines[lines.length - 1].push(i);
      });

      // 3. rebuild, reopening a <mark> on each line the run continues onto
      el.innerHTML = lines.map(function (idxs) {
        var html = '', open = false;
        idxs.forEach(function (i, k) {
          var it = items[i];
          if (it.hl !== open) {
            if (open) html += '</mark>';
            if (k && it.pre) html += ' ';
            if (it.hl) html += '<mark>';
            open = it.hl;
          } else if (k && it.pre) {
            html += ' ';
          }
          html += esc(it.w);
        });
        if (open) html += '</mark>';
        return '<span class="line"><i>' + html + '</i></span>';
      }).join('');
    });
  })();

  /* ---------------------------------------------------------
     5. Reveal on scroll
     --------------------------------------------------------- */
  (function reveal() {
    var targets = document.querySelectorAll('[data-reveal], [data-split], .line');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var kids = el.querySelectorAll ? el.querySelectorAll('.line') : [];
        if (kids.length) {
          Array.prototype.forEach.call(kids, function (k, i) {
            setTimeout(function () { k.classList.add('in'); }, i * 90);
          });
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(function (t) { io.observe(t); });

    // stagger the work cards
    document.querySelectorAll('.work__grid .card').forEach(function (c, i) {
      c.style.transitionDelay = (i % 3) * 90 + 'ms';
    });
  })();

  /* ---------------------------------------------------------
     6. Practice rows -> floating preview that follows the pointer
     --------------------------------------------------------- */
  (function practice() {
    var box = document.getElementById('practice-preview');
    var img = document.getElementById('practice-preview-img');
    var rows = document.querySelectorAll('.practice__row');
    if (!box || !img || !rows.length || reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    var x = 0, y = 0, tx = 0, ty = 0, on = false;

    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });

    (function run() {
      x = lerp(x, tx, 0.09); y = lerp(y, ty, 0.09);
      var skew = Math.max(-14, Math.min(14, (tx - x) * 0.35));
      box.style.left = x + 'px';
      box.style.top = y + 'px';
      box.style.rotate = skew * 0.35 + 'deg';
      requestAnimationFrame(run);
    })();

    rows.forEach(function (row) {
      row.addEventListener('pointerenter', function () {
        var src = row.getAttribute('data-img');
        if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        if (!on) { x = tx; y = ty; on = true; }
        box.classList.add('on');
      });
      row.addEventListener('pointerleave', function () {
        box.classList.remove('on');
        on = false;
      });
    });

    // drive the SVG displacement scale while a row is hovered
    var disp = document.querySelector('#warp feDisplacementMap');
    if (disp) {
      var cur = 0, want = 0;
      rows.forEach(function (row) {
        row.addEventListener('pointerenter', function () { want = 26; });
        row.addEventListener('pointerleave', function () { want = 0; });
      });
      (function run2() {
        cur = lerp(cur, want, 0.08);
        disp.setAttribute('scale', cur.toFixed(2));
        requestAnimationFrame(run2);
      })();
    }
  })();

  /* ---------------------------------------------------------
     7. Magnetic elements
     --------------------------------------------------------- */
  (function magnet() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-magnet]').forEach(function (el) {
      var raf = null, cx = 0, cy = 0, tx2 = 0, ty2 = 0;
      function run() {
        cx = lerp(cx, tx2, 0.18); cy = lerp(cy, ty2, 0.18);
        el.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
        if (Math.abs(cx - tx2) > 0.1 || Math.abs(cy - ty2) > 0.1) raf = requestAnimationFrame(run);
        else raf = null;
      }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx2 = (e.clientX - (r.left + r.width / 2)) * 0.18;
        ty2 = (e.clientY - (r.top + r.height / 2)) * 0.30;
        if (!raf) raf = requestAnimationFrame(run);
      });
      el.addEventListener('pointerleave', function () {
        tx2 = 0; ty2 = 0;
        if (!raf) raf = requestAnimationFrame(run);
      });
    });
  })();

  /* ---------------------------------------------------------
     8. Reel
     --------------------------------------------------------- */
  (function reel() {
    var frame = document.getElementById('reel-frame');
    var vid = document.getElementById('reel-video');
    var btn = document.getElementById('reel-play');
    if (!frame || !vid || !btn) return;

    var SRC = 'assets/video/reel.mp4';

    btn.addEventListener('click', function () {
      if (!vid.getAttribute('src')) {
        vid.setAttribute('src', SRC);
        vid.load();
      }
      vid.muted = false;
      var p = vid.play();
      if (p && p.catch) {
        p.then(function () {
          frame.classList.add('playing');
        }).catch(function () {
          // no file dropped in yet, or autoplay policy blocked it
          frame.classList.remove('playing');
          btn.querySelector('.reel__play-text').textContent = 'Add reel.mp4 to assets/video/';
        });
      } else {
        frame.classList.add('playing');
      }
    });

    vid.addEventListener('click', function () {
      if (vid.paused) { vid.play(); frame.classList.add('playing'); }
      else { vid.pause(); frame.classList.remove('playing'); }
    });

    // pause when it scrolls away
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting && !vid.paused) { vid.pause(); frame.classList.remove('playing'); }
      }, { threshold: 0 }).observe(frame);
    }
  })();

  /* ---------------------------------------------------------
     9. Counting stats
     --------------------------------------------------------- */
  (function counters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        if (reduced) return;
        var to = parseInt(el.getAttribute('data-count'), 10) || 0;
        var start = performance.now(), dur = 1100;
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * to);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });

    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* ---------------------------------------------------------
     10. Local clock in the footer
     --------------------------------------------------------- */
  (function clock() {
    var el = document.getElementById('clock');
    if (!el) return;
    function paint() {
      var d = new Date();
      el.textContent = d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'America/Chicago'
      }) + ' · Oklahoma';
    }
    paint();
    setInterval(paint, 30000);
  })();

  /* ---------------------------------------------------------
     11. Smooth anchor jumps
     --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
