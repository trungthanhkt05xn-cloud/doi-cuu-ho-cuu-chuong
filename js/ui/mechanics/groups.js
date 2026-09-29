// Shared bits for the V1.1 "build the groups" scenes (fireflies, forest signal, ocean relay, lighthouse,
// night rescue). a × b is always b groups of a — the same picture as the hint — and the child builds
// those groups in the world before the question is asked.

/** Centres for `count` groups inside box {x0, x1, y0, y1}: one row up to 5, two rows above that. */
export function groupSlots(count, { x0, x1, y0, y1 }, maxR = 28) {
  const rows = count > 5 ? 2 : 1;
  const perRow = Math.ceil(count / rows);
  const cw = (x1 - x0) / perRow;
  const rh = (y1 - y0) / rows;
  const r = Math.max(10, Math.min(maxR, cw / 2 - 3, rh / 2 - 3));
  const pts = [];
  for (let k = 0; k < count; k++) {
    const row = Math.floor(k / perRow);
    const inRow = row === rows - 1 ? count - row * perRow : perRow;
    const col = k - row * perRow;
    pts.push({ x: (x0 + x1) / 2 + (col - (inRow - 1) / 2) * cw, y: y0 + rh * (row + 0.5) });
  }
  return { pts, r };
}

/** n dots packed dice-style around (0,0) inside radius r — small groups can be seen at a glance. */
export function dotGrid(n, r) {
  const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const cell = Math.min((r * 1.45) / cols, (r * 1.45) / rows);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const inRow = row === rows - 1 ? n - row * cols : cols;
    pts.push({ x: (i - row * cols - (inRow - 1) / 2) * cell, y: (row - (rows - 1) / 2) * cell });
  }
  return { pts, dr: Math.max(1.8, cell * 0.34) };
}

/**
 * Tap a group — or sweep a finger across several — to build it. Forgiving: any hit on a group that
 * is not built yet counts (the mechanic marks it `.built` right away, so a sweep never counts twice).
 * Returns a cleanup function.
 */
export function groupInput(svg, onHit, sel = '.gt') {
  const hit = (el) => {
    const g = el && el.closest ? el.closest(sel) : null;
    if (g && svg.contains(g) && !g.classList.contains('built')) onHit(g);
  };
  const down = (e) => { if (e.pointerType !== 'mouse' || e.button === 0) hit(e.target); };
  const move = (e) => {
    if (e.pointerType === 'mouse' && !(e.buttons & 1)) return;   // mouse: only while pressed; touch/pen move = contact
    hit(document.elementFromPoint(e.clientX, e.clientY));
  };
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  return () => {
    svg.removeEventListener('pointerdown', down);
    svg.removeEventListener('pointermove', move);
  };
}

/** Caption chip sized to its text (VI and EN lengths differ a lot), kept inside the 400-wide scene. */
export function caption(x, y, text, h = 24) {
  const w = Math.round(Array.from(text).length * 7.2 + 26);
  const cx = Math.min(398 - w / 2, Math.max(2 + w / 2, x));
  return `<g class="caption" transform="translate(${cx.toFixed(1)} ${y})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}"/><text text-anchor="middle" dy=".35em">${text}</text></g>`;
}

/** A pointing hand over a scene point (the 💡 during a world action: "tap here"). */
export function handCue(svg, x, y) {
  const NS = 'http://www.w3.org/2000/svg';
  svg.querySelectorAll('.hand-cue').forEach((n) => n.remove());
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'hand-cue');
  g.setAttribute('transform', `translate(${x} ${y})`);
  const tx = document.createElementNS(NS, 'text');
  tx.setAttribute('class', 'emo hand-emo');
  tx.setAttribute('font-size', '30');
  tx.setAttribute('text-anchor', 'middle');
  tx.textContent = '👆';
  g.appendChild(tx);
  svg.appendChild(g);
  setTimeout(() => g.remove(), 2200);
}

/** Put a thing's transform at a path point (feet on the path). */
export function atPathPoint(el, pathEl, frac, s = 1, dy = 0) {
  const L = pathEl.getTotalLength();
  const p = pathEl.getPointAtLength(Math.max(0, Math.min(1, frac)) * L);
  el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y + dy).toFixed(1)}) scale(${s})`);
  el.dataset.x = p.x; el.dataset.y = p.y + dy; el.dataset.s = s;
  return p;
}
