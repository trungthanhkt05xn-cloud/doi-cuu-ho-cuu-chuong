// Small animation helpers. Transforms/opacity only; everything self-cleans.
export const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? Math.min(ms, 120) : ms));

const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
export const easeOut = (k) => 1 - Math.pow(1 - k, 3);

export function tween(dur, onUpdate, ease = easeInOut) {
  if (reducedMotion()) dur = Math.min(dur, 120);
  return new Promise((resolve) => {
    const t0 = performance.now();
    let done = false;
    const finish = () => { if (!done) { done = true; onUpdate(1); resolve(); } };
    // Safety net: rAF pauses in background tabs — never leave the game stuck.
    const guard = setTimeout(finish, dur + 400);
    function frame(t) {
      if (done) return;
      const k = Math.min(1, (t - t0) / dur);
      onUpdate(ease(k));
      if (k < 1) requestAnimationFrame(frame); else { clearTimeout(guard); finish(); }
    }
    requestAnimationFrame(frame);
  });
}

// SVG group positioned by attribute transform; stores x/y/s in dataset.
export function place(g, x, y, s) {
  g.dataset.x = x; g.dataset.y = y;
  if (s != null) g.dataset.s = s;
  const sc = g.dataset.s ? ` scale(${g.dataset.s})` : '';
  g.setAttribute('transform', `translate(${x} ${y})${sc}`);
}

export function moveG(g, x, y, dur = 500, { hop = 0, scale = null, ease } = {}) {
  const x0 = +g.dataset.x || 0, y0 = +g.dataset.y || 0;
  const s0 = g.dataset.s ? +g.dataset.s : 1;
  const s1 = scale == null ? s0 : scale;
  return tween(dur, (k) => {
    const cx = x0 + (x - x0) * k;
    const cy = y0 + (y - y0) * k - Math.sin(Math.PI * k) * hop;
    const cs = s0 + (s1 - s0) * k;
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${cs})`);
  }, ease).then(() => { g.dataset.x = x; g.dataset.y = y; g.dataset.s = s1; });
}

// Fly a visual clone of `fromEl` onto `toEl` (screen space), with a small arc.
export function flyTo(fromEl, toEl, { duration = 560, scaleTo = 0.5, lift = 70 } = {}) {
  if (!fromEl || !toEl) return Promise.resolve();
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  const clone = fromEl.cloneNode(true);
  clone.removeAttribute('id');
  clone.classList.add('fly-clone');
  clone.setAttribute('aria-hidden', 'true');
  Object.assign(clone.style, {
    position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    margin: '0', zIndex: '60', pointerEvents: 'none', transition: 'none',
  });
  document.body.appendChild(clone);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const d = reducedMotion() ? 120 : duration;
  return tween(d, (k) => {
    const x = dx * k;
    const y = dy * k - Math.sin(Math.PI * k) * lift;
    const s = 1 + (scaleTo - 1) * k;
    clone.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    clone.style.opacity = String(k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1);
  }, easeInOut).then(() => clone.remove());
}

// Restart a one-shot CSS animation class (works for HTML and SVG elements).
export function retrigger(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.getBoundingClientRect();
  el.classList.add(cls);
}

const CONFETTI_COLORS = ['#ffc933', '#ff7a59', '#4cc3ff', '#57d68d', '#b98cff', '#ff8fc7'];

export function confetti(n = 36) {
  if (reducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    const x = Math.random() * 100;
    p.style.left = `${x}%`;
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
    p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    p.style.animationDelay = `${Math.random() * 0.35}s`;
    p.style.animationDuration = `${1.3 + Math.random() * 0.9}s`;
    if (i % 3 === 0) p.style.borderRadius = '50%';
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2800);
}

// Short floating label over an element ("+1", "Mở được rồi!").
export function floatText(anchorEl, text, cls = '') {
  if (!anchorEl) return;
  const r = anchorEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = `float-text ${cls}`;
  el.textContent = text;
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top + r.height * 0.35}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

// Hearts / sparkles rising from an SVG point (in the scene's own coordinates).
export function svgBurst(svg, x, y, { chars = ['💛', '✨', '💖'], n = 5 } = {}) {
  if (!svg || reducedMotion()) return;
  const NS = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'burst');
  svg.appendChild(g);
  for (let i = 0; i < n; i++) {
    const wrap = document.createElementNS(NS, 'g');
    wrap.setAttribute('transform', `translate(${x + (i - (n - 1) / 2) * 16} ${y})`);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('class', 'burst-item');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', String(16 + (i % 2) * 6));
    t.style.animationDelay = `${i * 0.08}s`;
    t.textContent = chars[i % chars.length];
    wrap.appendChild(t);
    g.appendChild(wrap);
  }
  setTimeout(() => g.remove(), 1700);
}
