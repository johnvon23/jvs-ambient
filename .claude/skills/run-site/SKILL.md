---
name: Run Site
description: Serve the jvs-ambient site locally and screenshot a named section to verify a change. Use after editing HTML or CSS in this repo, or when John says "show me", "what does it look like", "screenshot the Hong Kong section", or asks whether a change worked.
allowed-tools:
  - Bash
  - Read
  - mcp__Claude_Browser__preview_start
  - mcp__Claude_Browser__navigate
  - mcp__Claude_Browser__javascript_tool
  - mcp__Claude_Browser__computer
  - mcp__Claude_Browser__tabs_create
  - mcp__Claude_Browser__tabs_context
  - mcp__Claude_Browser__tabs_close
  - mcp__Claude_Browser__read_console_messages
user-invocable: true
---

# Run Site

Get the site on screen and prove a change landed. The site is static HTML, so
"running" it is one python server, but four things reliably waste time without
this skill: the server dies between turns, `preview_start` looks in the wrong
repo, the browser serves stale CSS, and the pane sometimes wedges.

## The loop

**1. Server.** Always this, never a bare `python3 -m http.server`:

```bash
.claude/skills/run-site/serve.sh
```

Idempotent. Reuses a running server, restarts a dead one, and confirms it is
serving *this* repo. Port 4173, override with `SITE_PORT`.

**2. Open a tab.** Use the URL form:

```
preview_start { url: "http://localhost:4173/" }
```

Do **not** use `preview_start { name: "jvs-ambient" }` unless the session's
working directory is this repo. That form reads `.claude/launch.json` from the
session cwd, so from another checkout (the studio-assistant repo, usually) it
starts the wrong project or fails on a port conflict.

**3. Go to the section and shoot it.** Paste into `javascript_tool`, with the
target as an id, a CSS selector, or heading text:

```js
(() => {
  const q = 'Hong Kong';                    // <- id, selector, or heading text
  // stylesheet cache-bust: edits to site.css do NOT show up on reload alone
  const l = document.querySelector('link[href*="site.css"]');
  l.href = 'css/site.css?v=' + Math.floor(performance.now());
  const el =
    document.getElementById(q) ||
    document.querySelector(q) ||
    [...document.querySelectorAll('h1,h2,h3,.era-when')]
      .find(n => n.textContent.trim().toLowerCase().includes(q.toLowerCase()));
  if (!el) return 'NOT FOUND: ' + q;
  // 140px clears the fixed nav
  scrollTo({ top: el.getBoundingClientRect().top + scrollY - 140, behavior: 'instant' });
  return 'at: ' + el.textContent.trim().slice(0, 60);
})()
```

Then `computer { action: "screenshot" }`.

Wrap every snippet in an IIFE. The pane keeps one JS context per tab, so a
bare `const img = ...` throws "already declared" on the second call.

## Gotchas, each one learned the hard way

**Stale CSS is the default, not the exception.** A plain reload keeps the old
stylesheet, and `location.reload(true)` no longer bypasses cache. If a style
change does not show, do not go re-read the CSS looking for a mistake. Check
first:

```js
getComputedStyle(document.querySelector('YOUR_SELECTOR')).PROPERTY
```

If that disagrees with the file, it is cache. Use the cache-bust above.

**Lazy images report `naturalWidth: 0` until they decode.** Scroll to them,
wait, then measure. A `0` right after scrolling means "not yet", not "broken".
Confirm the file separately with `curl -o /dev/null -w "%{http_code}"`.

**A wedged pane looks like a broken site.** Symptoms: screenshots come back
solid black at a fixed size, `computer` times out with "Browser pane is
hidden", console and network reads return empty while the DOM answers fine.
The page is usually fine. Recovery, in order:

1. `tabs_context`, close stale tabs (they accumulate fast), `tabs_create`, navigate again.
2. If it stays wedged, **verify through the DOM instead** and say so plainly in
   the report. A measured assertion beats a picture that will not render:

```js
(() => {
  const el = document.querySelector('.era-video');
  const r = el.getBoundingClientRect();
  return JSON.stringify({
    section: el.closest('.era').querySelector('h3').textContent.trim(),
    w: Math.round(r.width), h: Math.round(r.height),
    caption: el.querySelector('figcaption')?.textContent,
  });
})()
```

Never report a visual as eyeballed when it was DOM-verified. Say which.

**Filenames with spaces** need percent-encoding in `src` (`Tom%20and%20John.jpeg`).
Confirm with curl before believing a 404 is a path bug.

## Before saying it looks right

```bash
node build.js --check
```

Copy lives in `copy/*.md`, not the HTML (see the repo CLAUDE.md). A page that
renders correctly but is out of sync gets silently overwritten on the next
build, so this check is part of verifying, not part of committing.

## Adding photos and video to the bio timeline

**`assets/img/` is gitignored.** It holds source photographs, this machine
only. A page that points there works perfectly in local preview and ships
three broken images, because the preview server reads the working tree and
the deploy only has what is committed. Process into `assets/web/img/` first
(`sips`, max edge 900, or 2x the display slot, whichever is smaller), and
never upscale past the source's own pixels. See README.md.

Local preview cannot catch this. The check is `git check-ignore`:

```bash
git check-ignore -v assets/img/other/FILE.jpeg   # prints a rule = do not ship it
```

The markup the timeline expects:

```html
<div class="era-photos">                    <!-- flex row, wraps, several ok -->
  <figure class="era-photo" style="--nat:296px">   <!-- --nat only if file < 300px wide -->
    <img src="assets/web/img/era-NAME.jpg" alt="..."
         width="W" height="H" loading="lazy" decoding="async">
    <figcaption>Sentence case caption</figcaption>
  </figure>
</div>
```

`width`/`height` are the **shipped file's** dimensions, not the source's.
They reserve the layout box before the image loads, so a 2304x2304 attribute
on a 600px file reserves the wrong space and shifts the page as it settles.

Stills render at 300px, video at 560px, both left-aligned to the text column.
`--nat` caps a small file at its own pixel width so it is never upscaled.
Captions are sentence case, not the uppercase used elsewhere on the site:
they are sentences with proper names in them.
