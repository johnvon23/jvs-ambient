# John von Seggern - ambient works

One-page site. Static HTML, CSS, and vanilla JS. No build step, no dependencies,
no framework. Edit the files, refresh the browser.

```
index.html      all the copy and structure
css/site.css    one stylesheet, design tokens at the top
js/site.js      reveals, nav scrim, video tiles, lightbox, fog canvas
assets/web/     processed web-weight images and videos (committed)
assets/img/     source photographs (gitignored, this machine only)
assets/video/   source videos (gitignored, this machine only)
```

Regenerate `assets/web/` derivatives with `sips` (images, max edge 900 to
2400px, JPEG ~80) and `ffmpeg` (H.264, 720 wide, crf 27, faststart). The
originals never ship: 211MB of source becomes about 20MB on the wire.

## Run it locally

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321

## Deploy

Any static host works. There is nothing to compile.

- **GitHub Pages:** push, then Settings > Pages > deploy from `main`, root.
  `.nojekyll` is already in place. Free tier requires the repo to be public.
- **Vercel:** import the repo; no framework, no build command, output = root.
  `vercel.json` turns on clean URLs (`/prs` instead of `/prs.html`).
- The site currently carries `noindex` on every page. Remove those meta tags
  at launch, once the placeholder content is gone (tracked in CONTENT.md).

Keep this repo under a personal GitHub account, not the school account: the
site is John's personal artist identity, and whichever host is used inherits
the account the repo lives in.

## Design notes

Modeled on the language of https://mengto.github.io/kage/ : near-black ground,
a single warm accent, oversized display type, full-bleed atmosphere, slow
scroll reveals.

Three things from that reference were deliberately left out. The custom cursor
is accessibility-hostile and hurts performance. The "scroll to enter" cue tells
people something they already know. The vertical script column belongs to that
project's subject, not to this one.

- **Palette:** cold near-black ground, bone text, one warm amber accent. Tokens
  live in `:root` at the top of `css/site.css`. Change `--amber` and the whole
  page follows.
- **Type:** Onest, one family across the page, weights 200 to 800.
- **Motion:** reveals run on IntersectionObserver. The progress rail, the
  wordmark parallax, and the gallery indicator run on native CSS scroll
  timelines. There is not a single scroll event listener in the project.
  Everything collapses to static under `prefers-reduced-motion: reduce`.
- **Dark only, on purpose.** This is a committed single-look design, not an
  oversight. There is no light mode.
- **Atmosphere:** the drifting fog is a canvas rendered at one tenth scale and
  blurred up by CSS, so it costs almost nothing. It pauses when the tab is
  hidden.

## What still needs real content

See `CONTENT.md`. Everything currently bracketed in amber on the page is a
placeholder and is meant to be obvious.
