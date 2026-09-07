# Caleb Roach — portfolio

Home page for my professional portfolio. One page, no build step, no dependencies.
Open `index.html` directly, or serve the folder:

```
python3 -m http.server 8899
```

Live at <https://roach-c.github.io/portfolio/> (GitHub Pages, `main` branch, repo root).

## What is in here

```
index.html                 the whole page
assets/css/style.css       all styling, palette at the top
assets/js/main.js          mobile menu, scroll reveals, footer year
assets/img/hero.jpg        hero banner (Pexels #30231780, Pexels License)
assets/img/work-*.jpg      real screenshots of shipped projects
```

## Page structure

Header with the site title and nav, hero banner, welcome and about, what I do,
selected work, contact, footer. That order matches the assignment brief.

## Still to swap

1. **Headshot.** `assets/img/headshot-placeholder.svg` is a placeholder. Save a real
   photo as `assets/img/headshot.jpg` and point the `<img src>` in the About section
   at it. It is displayed at a 4:5 crop, so shoot or crop it portrait.
2. **LinkedIn.** The contact section has the markup commented out. Paste the profile
   URL into the `href` and remove the two comment markers around that `<li>`.

## Notes for future me

- `[data-reveal]` elements are only hidden under `html.js`, and a tiny inline script
  in `<head>` adds that class. With JavaScript off the page renders complete rather
  than blank. Do not move that hiding rule out from under `.js`.
- The hero scrim is two stacked gradients tuned so white type clears WCAG AA while
  the photograph is still readable as a photograph. Darkening it further kills the image.
- Project rows alternate sides. The even rows flip the grid template as well as the
  order, so the screenshot keeps the wider column on both sides.

## Palette

One line changes the whole site. In `assets/css/style.css`:

```css
--accent: #23C4B8;
```

`--ink` is the background and `--bone` is the type.
