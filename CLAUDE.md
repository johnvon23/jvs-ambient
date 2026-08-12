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

**Keep each `*italic*` or `**bold**` pair on a single line.** The matcher does
not cross a line break, so a wrapped pair silently eats the text between it and
the next marker. Rewrap the line instead.

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

## This repo pushes as a different GitHub account

This machine is signed in to two GitHub accounts. `futureproofmusicschool` is
the default everywhere; **this repo belongs to `johnvon23`**, so identity and
credentials are pinned per-repo. Both stay active at once, with no switching.

- **Identity** is already local config: `user.name John von Seggern`,
  `user.email 7612096+johnvon23@users.noreply.github.com`.
- **The remote carries the username**, which is what selects the account:
  `https://johnvon23@github.com/johnvon23/jvs-ambient.git`.
- **Credentials come from the macOS keychain here**, not from gh.

### Why a push can fail with "could not read Password"

Global config sets gh's helper for github.com
(`!/opt/homebrew/bin/gh auth git-credential`). That helper **only answers for
whichever account `gh` has marked active** — ask it for a different username
and it returns nothing, git falls back to prompting, and a non-interactive
shell dies with `Device not configured`. It is a credential miss, not a
permissions problem. Confirm the diagnosis without exposing anything:

```bash
printf 'protocol=https\nhost=github.com\nusername=johnvon23\n\n' | gh auth git-credential get
```

Blank output means the helper will not serve this repo's account.

### The fix (already applied here)

Repo-local config overrides the global helper. The empty value resets the
inherited list, so only `osxkeychain` is consulted:

```bash
git config --local --replace-all credential.https://github.com.helper ""
git config --local --add credential.https://github.com.helper osxkeychain
```

Then seed the keychain once with the personal token. **Run this yourself; an
agent should not be handling tokens:**

```bash
printf 'protocol=https\nhost=github.com\nusername=johnvon23\npassword=%s\n\n' \
  "$(gh auth token -u johnvon23)" | git credential-osxkeychain store
```

Verify with `git push --dry-run origin main`.

Gotchas: re-running `gh auth login` for johnvon23 rotates the token and the
keychain copy goes stale — re-run the store command, or store a fine-grained
PAT instead and forget about it. Do not "fix" this with `gh auth switch`; that
is global and silently repoints every other repo on the machine.

## Everything else

See README.md for layout, design tokens, asset processing, and deploy.
Outstanding content questions are tracked in CONTENT.md.
