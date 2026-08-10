#!/usr/bin/env node
//
// Screenshot a section of the site, headlessly.
//
//   node scripts/shot.mjs --at .hear --out /tmp/hear.png
//   node scripts/shot.mjs --at .hear --mobile
//   node scripts/shot.mjs --url http://localhost:4321/prs.html --full
//
// Why this exists: every section on this site is invisible until its
// .reveal elements are marked .in by the IntersectionObserver, and most of
// them sit thousands of pixels down the page. A plain
// `chrome --headless --screenshot` therefore returns the hero, or a black
// rectangle. This drives Chrome over the DevTools Protocol instead, so it
// can scroll to a selector and force the reveals before capturing.
//
// Starts and stops its own Chrome. Needs a static server already running:
//
//   python3 -m http.server 4321
//
// No dependencies: Node's built-in fetch and WebSocket do the whole job.
//
// Options:
//   --url <url>       page to load          (default http://localhost:4321/)
//   --at <selector>   scroll this element to the top of the viewport
//   --out <path>      PNG destination       (default shot.png)
//   --width <px>      viewport width        (default 1440, or 390 with --mobile)
//   --height <px>     viewport height       (default 900, or 844 with --mobile)
//   --mobile          phone viewport at 2x
//   --full            capture the whole page instead of the viewport
//   --keep-reveals    leave the reveal animations alone (to check them)

import fs from 'node:fs';
import { spawn } from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;

// ── args ──────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = name => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const mobile = flag('mobile');
const cfg = {
  url: opt('url', 'http://localhost:4321/'),
  at: opt('at', null),
  out: opt('out', 'shot.png'),
  width: Number(opt('width', mobile ? 390 : 1440)),
  height: Number(opt('height', mobile ? 844 : 900)),
  full: flag('full'),
  reveals: !flag('keep-reveals'),
};

if (!fs.existsSync(CHROME)) {
  console.error(`no Chrome at ${CHROME}`);
  process.exit(1);
}

// ── chrome ────────────────────────────────────────────────────
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  // a throwaway profile keeps this out of the real browser's session
  `--user-data-dir=${fs.mkdtempSync('/tmp/jvs-shot-')}`,
  'about:blank',
], { stdio: 'ignore' });

const stop = () => { try { chrome.kill(); } catch {} };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });

// Chrome needs a moment before /json answers.
let target;
for (let tries = 0; tries < 40; tries++) {
  await new Promise(r => setTimeout(r, 250));
  try {
    target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
    break;
  } catch { /* not up yet */ }
}
if (!target) { console.error('Chrome never opened a debugging port'); process.exit(1); }

// ── CDP ───────────────────────────────────────────────────────
const ws = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let seq = 0;

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  const waiter = msg.id && pending.get(msg.id);
  if (!waiter) return;
  pending.delete(msg.id);
  msg.error ? waiter.reject(new Error(msg.error.message)) : waiter.resolve(msg.result);
};

await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: cfg.width,
  height: cfg.height,
  deviceScaleFactor: mobile ? 2 : 1,
  mobile,
});
await send('Page.navigate', { url: cfg.url });

// Fonts, the hero photo and the Bandcamp iframe all need to land first.
await new Promise(r => setTimeout(r, 3500));

// ── position and reveal ───────────────────────────────────────
// scroll-behavior:smooth would still be animating when the shot is taken,
// so it goes off first.
const script = `(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  ${cfg.reveals ? "document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));" : ''}
  ${cfg.at ? `
  const target = document.querySelector(${JSON.stringify(cfg.at)});
  if (!target) return 'no element matches ${cfg.at}';
  // clear the fixed nav so it does not sit on the section heading
  window.scrollTo(0, target.offsetTop - 90);
  ` : ''}
  return 'ok';
})()`;

const { result } = await send('Runtime.evaluate', { expression: script, returnByValue: true });
if (result.value !== 'ok') { console.error(result.value); stop(); process.exit(1); }

// let the reveal transitions settle
await new Promise(r => setTimeout(r, 1200));

// ── capture ───────────────────────────────────────────────────
const shot = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: cfg.full,
  ...(cfg.full ? { fromSurface: true } : {}),
});
fs.writeFileSync(cfg.out, Buffer.from(shot.data, 'base64'));
console.log(`${cfg.out}  ${cfg.width}x${cfg.height}${mobile ? ' @2x' : ''}${cfg.at ? `  at ${cfg.at}` : ''}`);

ws.close();
stop();
process.exit(0);
