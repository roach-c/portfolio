# Caleb Roach — portfolio

My professional portfolio. Plain static HTML, no build step, no dependencies.
Open `index.html` directly, or serve the folder:

```
python3 -m http.server 8899
```

Live at <https://roach-c.github.io/portfolio/> (GitHub Pages, `main` branch, repo root).

## What is in here

```
index.html                 home page
about.html                 About Me page
assets/css/style.css       all styling, palette at the top, About page block near the end
assets/js/main.js          mobile menu, scroll reveals, footer year (shared by both pages)
assets/img/hero.jpg        hero banner (Pexels #30231780, Pexels License)
assets/img/about-road.jpg  About page story banner (Pexels #1094545)
assets/img/about-piano.jpg About page interests photo (Pexels #18464599)
assets/img/work-*.jpg      real screenshots of shipped projects
```

## Page structure

**index.html** — header with site title and nav, hero banner, short welcome that
links out to the About page, what I do, selected work, contact, footer.

**about.html** — page header, then seven numbered sections in the order the Week 3
brief lists them: introduction, how I got here, what I value, what motivates me,
outside the work, walk of faith, a brief look ahead.

Both pages share the header nav, the footer nav, `style.css` and `main.js`, so a
change to the chrome has to be made in two files. That is the tradeoff for having
no build step.

## Still to swap

1. **Headshot.** `assets/img/headshot-placeholder.svg` is a placeholder. Save a real
   photo as `assets/img/headshot.jpg` and point the `<img src>` at it in BOTH
   `index.html` (welcome) and `about.html` (introduction). It is displayed at a
   4:5 crop, so shoot or crop it portrait.
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
