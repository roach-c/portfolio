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
resume.html                Resume, education and career, skills and certifications
experience.html            Class projects, work experience, awards
interests.html             Professional interests, affiliations, hobbies
faith.html                 My Walk of Faith (a DRAFT until Caleb has read it, see the TODO at the top)
media.html                 Web design reel, image gallery with a full size viewer, image credits
contact.html               Contact details and the contact form (posts to FormSubmit)
thanks.html                Where the form sends people after a message goes through
assets/video/web-reel.mp4  45 second screen recording of tetheredcrew.com and retailmark.com
assets/img/faith-road.jpg  Walk of Faith photo (Pexels #15645536)
assets/css/style.css       all styling, palette at the top, About and Resume blocks near the end
assets/resume/             the downloadable resume and the scripts that build it
assets/js/main.js          mobile menu, scroll reveals, footer year (shared by both pages)
assets/img/hero.jpg        hero banner (Pexels #30231780, Pexels License)
assets/img/about-road.jpg  About page story banner (Pexels #1094545)
assets/img/about-piano.jpg About page interests photo (Pexels #18464599)
assets/img/interests-hoop.jpg  Interests page hobbies photo (Pexels #12765522)
assets/img/work-*.jpg      real screenshots of shipped projects
```

## Page structure

**index.html** — header with site title and nav, hero banner, short welcome that
links out to the About page, what I do, selected work, contact, footer.

**about.html** — page header, then seven numbered sections in the order the Week 3
brief lists them: introduction, how I got here, what I value, what motivates me,
outside the work, walk of faith, a brief look ahead.

**resume.html** — page header, then the three parts the assignment asks for:
01 the full resume with download buttons, 02 education and career information,
03 skills and certifications. Closes on a download and contact CTA.

All three pages share the header nav, the footer nav, `style.css` and `main.js`, so
a change to the chrome has to be made in three files. That is the tradeoff for
having no build step.

## The downloadable resume

`assets/resume/resume-print.html` is the source of truth. It is a standalone light
theme document sized for US Letter and it is the only file to edit.

```
python3 assets/resume/build.py        # -> Caleb-Roach-Resume.pdf   (the main download)
python3 assets/resume/build_docx.py   # -> Caleb-Roach-Resume.docx  (editable copy)
```

The PDF is rendered by Playwright and the .docx is built by python-docx, so the two
are separate scripts and the content is duplicated in `build_docx.py`. Change the
wording in both, or the Word copy drifts. Never hand edit the PDF; it gets
overwritten.

Both files are committed to the repo on purpose, because GitHub Pages serves the
repo as is and there is no build step on deploy.

## Still to swap

0. **Coursework and certification dates.** `resume.html` has two HTML comments
   marked `TODO Caleb`: the relevant coursework list is a placeholder that needs
   the real course titles off the transcript, and the two Google certifications
   need the month and year they were earned. Everything else on that page is
   verified.
1. **Headshot.** `assets/img/headshot-placeholder.svg` is a placeholder. Save a real
   photo as `assets/img/headshot.jpg` and point the `<img src>` at it in BOTH
   `index.html` (welcome) and `about.html` (introduction). It is displayed at a
   4:5 crop, so shoot or crop it portrait.
3. **Affiliations.** `interests.html` has two `TODO Caleb` comments: add any
   missing memberships and say what you do in Salt & Senate.
2. **LinkedIn.** The contact section has the markup commented out. Paste the profile
   URL into the `href` and remove the two comment markers around that `<li>`.

4. **Contact form.** `contact.html` posts to FormSubmit. The first message sent
   from the live site triggers a one time activation email to
   caleb@tetheredcrew.com, and nothing is delivered until that link is clicked.
5. **A second video.** `media.html` has a `TODO Caleb` for a real video project
   (a Weekly News episode or a brand film) to sit beside the web reel.

## Notes for future me

- `[data-reveal]` elements are only hidden under `html.js`, and a tiny inline script
  in `<head>` adds that class. With JavaScript off the page renders complete rather
  than blank. Do not move that hiding rule out from under `.js`.
- The hero scrim is two stacked gradients tuned so white type clears WCAG AA while
  the photograph is still readable as a photograph. Darkening it further kills the image.
- The header still has eight nav items (Faith, Media and Contact replaced the
  What I Do and Work anchors, which are reachable from the home page), which stop fitting beside the brand at about
  1025px, so the menu collapses to the hamburger at 1060px instead of the 760px the
  rest of the phone layout uses. Those nav rules live in their own media query, and
  a ninth item means measuring it again.
- Project rows alternate sides. The even rows flip the grid template as well as the
  order, so the screenshot keeps the wider column on both sides.

## Palette

One line changes the whole site. In `assets/css/style.css`:

```css
--accent: #23C4B8;
```

`--ink` is the background and `--bone` is the type.
