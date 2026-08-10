#!/usr/bin/env node
/*
 * Sync copy/*.md into the HTML pages.
 *
 * The Markdown files are the single source of truth for every word on the
 * site. The HTML owns structure: sections, grids, cards, images, links.
 * Each text element carries data-copy="some.key"; this script finds the
 * matching "## some.key" block in copy/_shared.md + copy/<page>.md and
 * writes the rendered text into the element.
 *
 *   node build.js          write the pages
 *   node build.js --check  exit 1 if any page is out of sync (nothing written)
 *
 * No dependencies. Node 14+.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const COPY_DIR = path.join(ROOT, 'copy');
const SHARED = '_shared';

// page file -> copy file basename
const PAGES = {
  'index.html': 'index',
  'prs.html': 'prs',
  'fourth-world.html': 'fourth-world',
};

const VOID_TAGS = new Set(['meta', 'link', 'img', 'input', 'br', 'hr', 'source']);
const CHECK = process.argv.includes('--check');

/* ── copy files ──────────────────────────────────────────────────────── */

// "## key" starts a block; everything until the next "## " is its text.
// Lines before the first "## " (a "# Title" and any prose) are ignored, so
// the files read like normal notes in Obsidian.
function parseCopy(file) {
  const out = new Map();
  if (!fs.existsSync(file)) return out;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let key = null;
  let buf = [];
  const flush = () => {
    if (key !== null) out.set(key, buf.join('\n').replace(/^\n+|\n+$/g, ''));
    buf = [];
  };
  for (const line of lines) {
    const m = /^##\s+([A-Za-z0-9._-]+)\s*$/.exec(line);
    if (m) {
      flush();
      key = m[1];
    } else if (key !== null) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

/* ── markdown -> html ────────────────────────────────────────────────── */

function stripComments(s) {
  // %% ... %% is Obsidian's comment syntax; notes to self never reach the page.
  return s.replace(/%%[\s\S]*?%%/g, '');
}

// Escapes markup but leaves real HTML entities (&middot;, &amp;, &#8212;) alone,
// so they can be typed straight into the copy files.
function esc(s) {
  return s
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#[xX][0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Deliberately tiny: emphasis, links, and {{ placeholder }}. Anything else
// you want on the page is structure, and structure lives in the HTML.
function inline(s) {
  return esc(s)
    // an absolute URL leaves the site, so it opens in a new tab like every
    // hand-written external link does
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, text, url) =>
      /^https?:\/\//.test(url)
        ? `<a href="${url}" target="_blank" rel="noopener">${text}</a>`
        : `<a href="${url}">${text}</a>`)
    .replace(/\{\{\s*([^}]+?)\s*\}\}/g, '<span class="todo">[ $1 ]</span>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

// A line ending in a backslash is a hard line break, as in normal Markdown.
function renderBlock(md, indent) {
  // One block is one element, so blank lines (usually left behind by a
  // stripped %% comment %%) carry no meaning and are dropped.
  const lines = stripComments(md)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const html = lines.map((l) =>
    l.endsWith('\\') ? inline(l.slice(0, -1).trimEnd()) + '<br>' : inline(l)
  );
  if (html.length <= 1) return html[0] || '';
  return '\n' + html.map((l) => indent + '  ' + l).join('\n') + '\n' + indent;
}

// Attribute values (title, aria-label, meta content) get the words with the
// markup flattened out.
function renderText(md) {
  return stripComments(md)
    .replace(/\{\{\s*([^}]+?)\s*\}\}/g, '[ $1 ]')
    .replace(/\[([^\]\n]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/\\$/gm, '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/"/g, '&quot;')
    .replace(/&(?!(?:[a-zA-Z]+|#\d+);)/g, '&amp;');
}

/* ── html rewriting ──────────────────────────────────────────────────── */

function findClose(html, tag, from) {
  const re = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'gi');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    if (m[0][1] === '/') {
      if (--depth === 0) return m.index;
    } else {
      depth++;
    }
  }
  return -1;
}

function indentOf(html, index) {
  const lineStart = html.lastIndexOf('\n', index) + 1;
  const line = html.slice(lineStart, index);
  return /^\s*$/.test(line) ? line : '';
}

function setAttr(openTag, name, value) {
  const re = new RegExp(`(\\s${name}=)"[^"]*"`, 'i');
  if (re.test(openTag)) return openTag.replace(re, `$1"${value}"`);
  return openTag.replace(/\s*\/?>$/, (end) => ` ${name}="${value}"${end.trim()}`);
}

function applyCopy(html, copy, page, report) {
  const open = /<([a-zA-Z][\w-]*)\b([^>]*\bdata-copy="([^"]+)"[^>]*)>/g;
  const edits = [];
  let m;
  while ((m = open.exec(html))) {
    const [full, rawTag, , key] = m;
    const tag = rawTag.toLowerCase();
    const md = copy.get(key);
    if (md === undefined) {
      report.missing.push(`${page}: data-copy="${key}" has no block in the copy files`);
      continue;
    }
    report.used.add(key);

    const openStart = m.index;
    const openEnd = m.index + full.length;
    let openTag = full;

    const attrsAttr = /\bdata-copy-attrs="([^"]+)"/.exec(full);
    if (attrsAttr) {
      const text = renderText(md);
      for (const name of attrsAttr[1].split(',').map((s) => s.trim()).filter(Boolean)) {
        openTag = setAttr(openTag, name, text);
      }
    }

    if (VOID_TAGS.has(tag)) {
      if (openTag !== full) edits.push({ start: openStart, end: openEnd, text: openTag });
      continue;
    }

    const closeStart = findClose(html, tag, openEnd);
    if (closeStart === -1) {
      report.missing.push(`${page}: no closing </${tag}> for data-copy="${key}"`);
      continue;
    }
    const body = renderBlock(md, indentOf(html, openStart));
    edits.push({ start: openStart, end: closeStart, text: openTag + body });
  }

  let out = html;
  for (const e of edits.reverse()) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

/* ── run ─────────────────────────────────────────────────────────────── */

const shared = parseCopy(path.join(COPY_DIR, `${SHARED}.md`));
const report = { missing: [], used: new Set(), changed: [] };
const allKeys = new Set();

for (const [pageFile, copyName] of Object.entries(PAGES)) {
  const pagePath = path.join(ROOT, pageFile);
  const copyPath = path.join(COPY_DIR, `${copyName}.md`);
  if (!fs.existsSync(copyPath)) {
    report.missing.push(`${pageFile}: copy/${copyName}.md does not exist`);
    continue;
  }
  const copy = new Map(shared);
  for (const [k, v] of parseCopy(copyPath)) copy.set(k, v);
  for (const k of copy.keys()) allKeys.add(k);

  const before = fs.readFileSync(pagePath, 'utf8');
  const after = applyCopy(before, copy, pageFile, report);
  if (after !== before) {
    report.changed.push(pageFile);
    if (!CHECK) fs.writeFileSync(pagePath, after);
  }
}

for (const k of allKeys) {
  if (!report.used.has(k)) report.missing.push(`copy: "${k}" is not used by any page`);
}

for (const w of report.missing) console.warn(`warning  ${w}`);

if (CHECK) {
  if (report.changed.length) {
    console.error(
      `\nOut of sync: ${report.changed.join(', ')}\n` +
        `The copy in these pages does not match copy/*.md. Markdown wins —\n` +
        `move the edit into copy/ and run: node build.js\n`
    );
    process.exit(1);
  }
  console.log('In sync.');
} else {
  console.log(
    report.changed.length ? `Updated ${report.changed.join(', ')}` : 'Nothing to update.'
  );
}
if (report.missing.length && CHECK) process.exit(1);
