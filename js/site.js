/* ============================================================
   John von Seggern - ambient works
   No scroll event listeners. IntersectionObserver + one rAF canvas.
   ============================================================ */

(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveals ─────────────────────────────────────────────── */

  const targets = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        obs.unobserve(e.target);           // one-shot, keeps the observer cheap
      }
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(el => io.observe(el));
  }

  /* ── nav background ──────────────────────────────────────────
     A zero-height sentinel at the top of the document. When it leaves
     the viewport the nav has something behind it and needs a scrim. */

  const nav = document.getElementById('nav');
  if (nav) {
    const sentinel = document.createElement('div');
    Object.assign(sentinel.style, {
      position: 'absolute', top: '0', left: '0',
      width: '1px', height: '90px', pointerEvents: 'none'
    });
    document.body.prepend(sentinel);

    new IntersectionObserver(([e]) => {
      nav.classList.toggle('stuck', !e.isIntersecting);
    }).observe(sentinel);
  }

  /* ── inline video tiles ──────────────────────────────────────
     Muted loops that only run while on screen, so five videos cost
     roughly as much as one. Under reduced motion they stay posters. */

  const tileVideos = document.querySelectorAll('.tile video, .hero-tile video');

  if (!reduced && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver(entries => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting) {
          v.play().catch(() => {});        // autoplay can be denied; poster stands in
        } else {
          v.pause();
        }
      }
    }, { threshold: 0.25 });

    tileVideos.forEach(v => vio.observe(v));
  }

  /* ── lightbox: click a tile, watch it with sound ───────────── */

  const box   = document.getElementById('lightbox');
  const boxV  = document.getElementById('lightboxVideo');
  const boxT  = document.getElementById('lightboxTitle');

  if (box && boxV && typeof box.showModal === 'function') {
    document.querySelectorAll('[data-video]').forEach(btn => {
      btn.addEventListener('click', () => {
        boxV.src = btn.dataset.video;
        boxT.textContent = btn.dataset.title || '';
        box.showModal();
        boxV.play().catch(() => {});
      });
    });

    const shut = () => {
      boxV.pause();
      boxV.removeAttribute('src');         // stop the download, free the decoder
      boxV.load();
      if (box.open) box.close();
    };

    document.getElementById('lightboxClose').addEventListener('click', shut);
    box.addEventListener('close', shut);
    box.addEventListener('click', e => {   // click on the backdrop closes
      if (e.target === box) shut();
    });
  }

  /* ── atmosphere: slow drifting fog ───────────────────────────
     Rendered at a fraction of viewport size and stretched by CSS. The blur
     hides the upscale entirely and the canvas stays a few thousand pixels,
     so this costs almost nothing on a phone. */

  const cv = document.getElementById('fog');
  if (cv && !reduced) {
    const ctx = cv.getContext('2d', { alpha: true });
    const SCALE = 10;                     // 1 canvas px per 10 css px
    let w = 0, h = 0, raf = 0, t = 0;

    // near-black blues plus one warm ember, matching the CSS tokens
    const blobs = [
      { r: 0.55, hue: '18,26,42',  ox: 0.22, oy: 0.28, sx: 0.00021, sy: 0.00013, a: 0.55 },
      { r: 0.62, hue: '12,18,30',  ox: 0.78, oy: 0.62, sx: 0.00015, sy: 0.00019, a: 0.60 },
      { r: 0.34, hue: '74,44,18',  ox: 0.62, oy: 0.20, sx: 0.00011, sy: 0.00023, a: 0.34 },
      { r: 0.44, hue: '10,24,26',  ox: 0.30, oy: 0.80, sx: 0.00024, sy: 0.00010, a: 0.42 }
    ];

    const resize = () => {
      w = cv.width  = Math.max(1, Math.ceil(window.innerWidth  / SCALE));
      h = cv.height = Math.max(1, Math.ceil(window.innerHeight / SCALE));
    };

    const draw = () => {
      t += 16;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (const b of blobs) {
        const x = (b.ox + Math.sin(t * b.sx) * 0.16) * w;
        const y = (b.oy + Math.cos(t * b.sy) * 0.14) * h;
        const rad = b.r * Math.max(w, h);

        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(${b.hue},${b.a})`);
        g.addColorStop(1, `rgba(${b.hue},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      raf = requestAnimationFrame(draw);
    };

    const stop  = () => { cancelAnimationFrame(raf); raf = 0; };
    const start = () => { if (!raf) raf = requestAnimationFrame(draw); };

    resize();
    start();

    window.addEventListener('resize', resize, { passive: true });
    // don't burn battery painting a tab nobody is looking at
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
  }
})();
