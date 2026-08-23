# Caleb Roach — portfolio

A single page, no build step, no dependencies. Open `index.html` or serve the folder.

```
python3 -m http.server 8899
```

## What is in here

```
index.html
assets/css/style.css     all styling, palette at the top
assets/js/hero.js        the WebGL distortion hero
assets/js/main.js        curtain, cursor, ticker, reveals, reel, counters
assets/img/*.svg         placeholder art, replace every one
assets/video/            drop reel.mp4 here
```

## The hero effect

The name is drawn to an offscreen 2D canvas, uploaded as a WebGL texture, then
pushed through a fragment shader that applies a pointer driven ripple, a slow
ambient warp, a per channel colour offset and a procedural rotating ring. It
falls back to plain CSS type when WebGL is missing or when the visitor has
reduced motion turned on.

Tuning knobs are all in `assets/js/hero.js`:

| What | Where |
|---|---|
| Your name | `var NAME = ['CALEB', 'ROACH']` at the top |
| Ripple strength | `ripple = dir * wave * 0.013 * uPower` |
| Ambient warp | `drift = (vec2(n1, n2) - 0.5) * 0.0085` |
| Colour fringing | the `amt` line |
| Ring size and speed | `R`, `W`, and `uTime * 0.10` in the ring block |

## Things to swap before this goes live

1. `assets/img/*.svg` — real stills and screenshots, same aspect ratios.
2. `assets/video/reel.mp4` — the reel. The play button wires itself up.
3. `hello@example.com` in `index.html` — your real address, twice if you count the link.
4. The four social links at the bottom of the contact section.
5. The six project cards: titles, roles, years, and the `href` on each.
6. The stat numbers in the About section (`data-count` and the text both).
7. `<title>` and the meta description.

## Palette

One line changes the whole site. In `assets/css/style.css`:

```css
--accent: #0FB5AA;
```

`--ink` is the background, `--bone` is the type. The hero shader reads all three
straight out of the stylesheet, so the canvas follows whatever you set.
