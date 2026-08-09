# jvs-ambient

Static site: three hand-written HTML pages, one stylesheet, one JS file. No
framework, no dependencies.

## Copy lives in Markdown, not in the HTML

`copy/*.md` is the single source of truth for every word on the site. The HTML
owns structure only: which sections exist, which cards are in a grid, images,
links, classes.

**Never edit visible text directly in an HTML file — not even a typo fix.**
Edit the matching block in `copy/` and run:

```bash
node build.js
```

The build overwrites the page text, so an edit made in the HTML is silently
thrown away on the next build. `node build.js --check` exits non-zero when a
page is out of sync; run it before committing.

### How it wires up

Each text element carries `data-copy="some.key"`, matched to a `## some.key`
block in `copy/_shared.md` (nav, footer) plus `copy/<page>.md`. Page keys win
over shared keys.

- `copy/_shared.md` → all three pages
- `copy/index.md` → `index.html`
- `copy/prs.md` → `prs.html`
- `copy/fourth-world.md` → `fourth-world.html`

Markdown supported inside a block: `*italic*`, `**bold**`, `[text](url)`,
`{{ placeholder }}` (renders the accent-color `[ placeholder ]` TODO marker),
a trailing `\` for a line break, `%% comment %%` for notes that never ship,
and raw HTML entities like `&middot;`. Nothing else — one block is one
element, and anything structural belongs in the HTML.

`data-copy-attrs="content"` on an element also writes the flattened text into
that attribute; that is how `<title>` and the `<meta>` descriptions stay in
the copy files.

### Adding or removing text

New text element: add `data-copy="new.key"` in the HTML **and** a `## new.key`
block in the copy file. `build.js` warns about a key used in HTML with no
block, and about a block no page uses.

## Everything else

See README.md for layout, design tokens, asset processing, and deploy.
Outstanding content questions are tracked in CONTENT.md.
