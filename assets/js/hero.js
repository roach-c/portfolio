/* =========================================================
   hero.js — real time distortion hero
   Text is rasterised to an offscreen 2D canvas, uploaded as a
   texture, then pushed through a fragment shader that does:
     · a mouse driven ripple
     · a slow ambient liquid warp
     · per channel offset (chromatic aberration)
     · a procedural rotating ring behind the type
   No libraries. WebGL1 only, with a plain CSS fallback.
   ========================================================= */
(function () {
  'use strict';

  var NAME = ['CALEB', 'ROACH'];       // <- your name
  var cvs  = document.getElementById('hero-canvas');
  var hero = document.getElementById('hero');
  if (!cvs || !hero) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var gl = null;
  try {
    gl = cvs.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false })
      || cvs.getContext('experimental-webgl');
  } catch (e) { gl = null; }

  if (!gl || reduced) { hero.classList.add('no-gl'); return; }

  /* ---------- shaders ---------- */

  var VERT = [
    'attribute vec2 aPos;',
    'varying vec2 vUv;',
    'void main(){',
    '  vUv = aPos * 0.5 + 0.5;',
    '  gl_Position = vec4(aPos, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uTex;',
    'uniform vec2  uRes;',
    'uniform vec2  uMouse;',
    'uniform float uTime;',
    'uniform float uPower;',
    'uniform vec3  uBg;',
    'uniform vec3  uFg;',
    'uniform vec3  uAccent;',

    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }',
    'float noise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  vec2 u = f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x),',
    '             mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);',
    '}',

    'void main(){',
    '  float ar = uRes.x / max(uRes.y, 1.0);',
    '  vec2 uv = vUv;',
    // work in a square "aspect space" so the maths is not stretched by the viewport
    '  vec2 p  = vec2(uv.x * ar, uv.y);',
    '  vec2 m  = vec2(uMouse.x * ar, uMouse.y);',

    // --- ripple that radiates out from the pointer ---
    '  vec2  toM = p - m;',
    '  float d   = length(toM);',
    '  vec2  dir = toM / max(d, 0.0001);',
    '  float falloff = exp(-d * 4.6);',
    '  float wave = sin(d * 22.0 - uTime * 3.0) * falloff;',
    '  vec2  ripple = dir * wave * 0.013 * uPower;',

    // --- ambient liquid so it breathes when nothing is happening ---
    '  float n1 = noise(p * 2.2 + vec2(uTime * 0.10, uTime * 0.06));',
    '  float n2 = noise(p * 1.9 - vec2(uTime * 0.08, uTime * 0.12));',
    '  vec2  drift = (vec2(n1, n2) - 0.5) * 0.0085;',

    '  vec2 warp = ripple + drift;',
    // back into uv space before we touch the texture
    '  vec2 wuv  = vec2(warp.x / ar, warp.y);',

    // --- chromatic split, scaled by how disturbed the surface is ---
    '  float amt = 0.0010 + abs(wave) * 0.0090 * uPower + length(drift) * 0.22;',
    '  vec2  off = vec2(dir.x / ar, dir.y) * amt;',

    // --- procedural ring behind the type, sized off the short edge ---
    '  vec2  c  = (uv - 0.5 + wuv * 0.5) * vec2(ar, 1.0);',
    '  float rr = length(c);',
    '  float R  = min(0.300, ar * 0.42);',
    '  float W  = R * 0.115;',
    '  float ring = smoothstep(W, W - 0.005, abs(rr - R));',
    '  float ang  = atan(c.y, c.x) + uTime * 0.10;',
    '  float fa   = fract(ang / 6.2831853);',
    '  float gap  = smoothstep(0.010, 0.028, fa) * (1.0 - smoothstep(0.130, 0.148, fa));',
    '  ring *= 1.0 - gap;',

    // --- the type, one tap per colour channel ---
    '  float sr = texture2D(uTex, uv + wuv + off).a;',
    '  float sg = texture2D(uTex, uv + wuv).a;',
    '  float sb = texture2D(uTex, uv + wuv - off).a;',

    '  vec3 col = mix(uBg, uAccent, ring * 0.92);',
    '  col = mix(col, uFg, vec3(sr, sg, sb));',

    // --- grain ---
    '  float g = hash(gl_FragCoord.xy + fract(uTime) * 91.7);',
    '  col += (g - 0.5) * 0.022;',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('shader:', gl.getShaderInfoLog(s)); return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { hero.classList.add('no-gl'); return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { hero.classList.add('no-gl'); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ['uTex','uRes','uMouse','uTime','uPower','uBg','uFg','uAccent'].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  /* ---------- palette pulled from the stylesheet ---------- */
  function cssRGB(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
    var h = v.replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  var BG = cssRGB('--ink', '#0B0B0C');
  var FG = cssRGB('--bone', '#EFEDE6');
  var AC = cssRGB('--accent', '#0FB5AA');

  /* ---------- the type, rasterised ---------- */
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  var tc  = document.createElement('canvas');
  var tcx = tc.getContext('2d');

  function fitSize(text, maxW) {
    tcx.font = '400 100px Anton, Arial Narrow, sans-serif';
    var w = tcx.measureText(text).width || 1;
    return (maxW / w) * 100;
  }

  function paintType(w, h) {
    tc.width = w; tc.height = h;
    tcx.clearRect(0, 0, w, h);
    tcx.fillStyle = '#fff';
    tcx.textAlign = 'center';
    tcx.textBaseline = 'middle';

    var oneLine = (w / h) > 1.15;
    var pad = w * 0.055;
    var maxW = w - pad * 2;

    if (oneLine) {
      var t = NAME.join(' ');
      var s = Math.min(fitSize(t, maxW), h * 0.62);
      tcx.font = '400 ' + s + 'px Anton, Arial Narrow, sans-serif';
      tcx.fillText(t, w / 2, h / 2);
    } else {
      var s2 = Math.min(
        fitSize(NAME[0], maxW),
        fitSize(NAME[1], maxW),
        h * 0.34
      );
      tcx.font = '400 ' + s2 + 'px Anton, Arial Narrow, sans-serif';
      var lh = s2 * 0.86;
      tcx.fillText(NAME[0], w / 2, h / 2 - lh / 2);
      tcx.fillText(NAME[1], w / 2, h / 2 + lh / 2);
    }

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
  }

  /* ---------- sizing ---------- */
  var W = 0, H = 0;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width  * dpr));
    H = Math.max(1, Math.round(rect.height * dpr));
    cvs.width = W; cvs.height = H;
    gl.viewport(0, 0, W, H);
    var tw = Math.min(W, 2048);
    var th = Math.max(1, Math.round(tw * (H / W)));
    paintType(tw, th);
  }

  /* ---------- pointer ---------- */
  var mouse = { x: 0.5, y: 0.5 }, target = { x: 0.5, y: 0.5 };
  var power = 0, targetPower = 0, lastMove = 0;

  function onMove(cx, cy) {
    var r = hero.getBoundingClientRect();
    target.x = (cx - r.left) / r.width;
    target.y = 1 - (cy - r.top) / r.height;
    targetPower = 1;
    lastMove = performance.now();
  }
  window.addEventListener('pointermove', function (e) { onMove(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  /* ---------- loop ---------- */
  var t0 = performance.now();
  var visible = true;
  var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(hero);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;

    var t = (now - t0) / 1000;

    // idle drift so it never sits still
    if (now - lastMove > 1600) {
      target.x = 0.5 + Math.cos(t * 0.34) * 0.24;
      target.y = 0.5 + Math.sin(t * 0.27) * 0.18;
      targetPower = 0.55;
    }

    mouse.x += (target.x - mouse.x) * 0.075;
    mouse.y += (target.y - mouse.y) * 0.075;
    power   += (targetPower - power) * 0.05;

    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(U.uTex, 0);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uPower, power);
    gl.uniform3fv(U.uBg, BG);
    gl.uniform3fv(U.uFg, FG);
    gl.uniform3fv(U.uAccent, AC);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(resize, 140);
  });

  function boot() { resize(); requestAnimationFrame(frame); }

  if (document.fonts && document.fonts.load) {
    document.fonts.load('400 100px Anton').then(function () {
      return document.fonts.ready;
    }).then(boot, boot);
  } else {
    window.addEventListener('load', boot);
  }
})();
