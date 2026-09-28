// Mechanic C — PATH FINDING: three trails, each signpost shows a number. The right one leads on;
// a wrong one gets gently blocked (bush / reef) and the hero tries again. The destination grows as you approach.
import { THEMES, svgWrap, defs, sceneBackdrop, hero as heroArt, emo, windmill, roundTree, pine, bush, rock, palm, mushroom, crystal, flower } from '../art.js';
import { tween, wait, place, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';

const START = { x: 200, y: 300 };
const ENDS = [{ x: 76, y: 160 }, { x: 200, y: 148 }, { x: 324, y: 160 }];
const CTRL = [{ x: 150, y: 228 }, { x: 200, y: 224 }, { x: 250, y: 228 }];

const qpt = (p0, c, p1, t) => ({
  x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x,
  y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y,
});

// Tapered ribbon along a quadratic curve (cheap perspective).
function ribbon(p0, c, p1, w0, w1) {
  const L = [], R = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const p = qpt(p0, c, p1, t);
    const n = qpt(p0, c, p1, Math.min(1, t + 0.01));
    const m = qpt(p0, c, p1, Math.max(0, t - 0.01));
    const dx = n.x - m.x, dy = n.y - m.y;
    const len = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push(`${(p.x - (dy / len) * w).toFixed(1)} ${(p.y + (dx / len) * w).toFixed(1)}`);
    R.push(`${(p.x + (dy / len) * w).toFixed(1)} ${(p.y - (dx / len) * w).toFixed(1)}`);
  }
  return `M${L.join(' L')} L${R.reverse().join(' L')}Z`;
}

export function create({ root, mission, zone, P, pick }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  const cove = zone.id === 'cove';
  const horizon = cove ? 140 : 122;

  let s = defs(P, T) + sceneBackdrop(zone.id, P, T);
  if (!cove) s += `<rect x="-400" y="${horizon}" width="1200" height="400" fill="url(#${P}ground)"/>`;

  // destination (scales up with progress)
  let dest;
  if (zone.id === 'village') dest = windmill(0, 0, 1.1, true) + roundTree(-46, 2, 0.6, T.leaf, T.leafDark);
  else if (zone.id === 'forest') dest = `<rect x="-26" y="-40" width="52" height="40" rx="10" fill="#8d5a2b"/><ellipse cx="0" cy="-40" rx="28" ry="8" fill="#b67a42"/><path d="M-10 0 v-18 a10 10 0 0 1 20 0 v18Z" fill="#3b2412"/><circle cx="12" cy="-26" r="4" fill="#ffe27a"/>` + mushroom(34, 2, 1.1) + pine(-44, 2, 0.8);
  else dest = `<ellipse cx="0" cy="0" rx="58" ry="12" fill="${T.ground}"/><ellipse cx="0" cy="3" rx="64" ry="10" fill="#fff" opacity=".4"/>` + palm(8, -2, 0.7) + crystal(-30, -2, 0.5, T.crystal, T.crystal2);
  s += `<g id="${P}dest" transform="translate(200 ${horizon + 2}) scale(0.45)">${dest}<g class="npc hidden-npc" id="${P}npc">${emo(cove ? -8 : 44, -22, 40, mission.npc.e)}</g></g>`;

  // side scenery
  if (zone.id === 'village') s += roundTree(-10, 250, 1.2, T.leaf, T.leafDark) + roundTree(412, 262, 1.3, T.leaf, T.leafDark) + flower(40, 280) + flower(360, 290, '#ffd23f');
  else if (zone.id === 'forest') s += pine(-6, 262, 1.5) + pine(410, 270, 1.6) + pine(30, 190, 0.9) + pine(372, 196, 0.9) + mushroom(360, 292, 1.2);
  else s += rock(-10, 260, 1.2, T.stone, T.stoneDark) + rock(410, 276, 1.3, T.stone, T.stoneDark) + crystal(380, 200, 0.6, T.crystal, T.crystal2);

  // trails + signs + blockers
  for (let i = 0; i < 3; i++) {
    const E = ENDS[i], C = CTRL[i];
    if (cove) {
      s += `<path d="M${START.x} ${START.y} Q${C.x} ${C.y} ${E.x} ${E.y}" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-dasharray="3 9" stroke-linecap="round"/>`;
    } else {
      s += `<path d="${ribbon(START, C, E, 64, 18)}" fill="${T.pathEdge}"/><path d="${ribbon(START, C, E, 54, 12)}" fill="${T.path}"/>`;
    }
  }
  for (let i = 0; i < 3; i++) {
    const E = ENDS[i];
    const B = qpt(START, CTRL[i], E, 0.5);
    const blocker = cove ? rock(0, 0, 1, T.stone, T.stoneDark) + `<path d="M-26 0 q6 -5 12 0 t12 0 t12 0 t12 0" stroke="#fff" stroke-width="2" fill="none"/>`
      : bush(0, 4, 1.3, T.leaf, T.leafDark) + `<rect x="-20" y="-6" width="40" height="7" rx="3" fill="${T.woodDark}" transform="rotate(-8)"/>`;
    s += `<g transform="translate(${B.x} ${B.y})"><g class="blocker" id="${P}block${i}">${blocker}</g></g>`;
    s += `<g class="sign" id="${P}sign${i}" data-idx="${i}" transform="translate(${E.x} ${E.y})">
      <rect x="-3" y="-4" width="6" height="26" rx="2" fill="${T.woodDark}"/>
      <rect class="sign-board" x="-30" y="-40" width="60" height="36" rx="10"/>
      <text class="sign-num" x="0" y="-15" text-anchor="middle">?</text>
      <rect x="-36" y="-48" width="72" height="76" fill="transparent"/></g>`;
  }
  if (cove) {
    s += `<g id="${P}hero" data-x="200" data-y="276"><path d="M-30 -6 L30 -6 L22 10 L-22 10Z" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="3"/><rect x="-2" y="-44" width="4" height="40" fill="${T.woodDark}"/><path d="M2 -42 L24 -16 L2 -14Z" fill="#fff"/>${heroArt(-10, -2, 0.5)}</g>`;
  } else s += heroArt(200, 276, 0.62, `${P}hero`);
  s += `<rect id="${P}fade" x="-400" y="-300" width="1200" height="900" fill="#fff" opacity="0" pointer-events="none"/>`;

  root.innerHTML = svgWrap(s, { cls: 'scene-svg', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const hero = svg.querySelector(`#${P}hero`);
  const destEl = svg.querySelector(`#${P}dest`);
  const fade = svg.querySelector(`#${P}fade`);
  const baseScale = cove ? 1 : 0.62;
  place(hero, 200, 276, baseScale);
  let current = [];
  let chosen = -1;

  svg.querySelectorAll('.sign').forEach((g) => {
    g.addEventListener('click', () => {
      const i = +g.dataset.idx;
      if (current[i] != null && !g.classList.contains('blocked')) pick(current[i], g);
    });
  });

  function setDest(k) {
    const sc = 0.45 + 0.55 * k;
    destEl.setAttribute('transform', `translate(200 ${horizon + 2 + k * 8}) scale(${sc})`);
  }
  setDest(0);

  async function walk(i, tEnd = 0.86) {
    const x0 = +hero.dataset.x, y0 = +hero.dataset.y;
    const E = ENDS[i], C = CTRL[i];
    await tween(800, (k) => {
      const t = k * tEnd;
      const p = qpt({ x: x0, y: y0 }, C, E, t);
      const sc = baseScale * (1 - 0.45 * t);
      hero.setAttribute('transform', `translate(${p.x} ${p.y - Math.abs(Math.sin(k * Math.PI * 4)) * 4} ) scale(${sc})`);
    });
  }

  return {
    answerKind: 'choices', skin: 'sign', optionCount: 3,
    icon: '🧭', instruction: 'Chọn biển báo có số đúng!',
    correctLine: ['Đúng đường rồi!', 'Đi tiếp nào!', 'Chuẩn luôn!'],
    arrows: ['↖', '↑', '↗'],
    setQuestion(q, i, options) {
      current = options;
      svg.querySelectorAll('.sign').forEach((g, k) => {
        g.classList.remove('blocked', 'picked');
        g.querySelector('.sign-num').textContent = options[k];
      });
      svg.querySelectorAll('.blocker').forEach((b) => b.classList.remove('show'));
    },
    markByValue(v) { return current.indexOf(v); },
    async onCorrect(stepIdx, fromEl, value) {
      chosen = current.indexOf(value);
      svg.querySelector(`#${P}sign${chosen}`).classList.add('picked');
      play('step');
      await walk(chosen);
      if (stepIdx < N - 1) {
        await tween(220, (k) => fade.setAttribute('opacity', String(k * 0.9)));
        place(hero, 200, 276, baseScale);
        setDest((stepIdx + 1) / N);
        svg.querySelectorAll('.sign-num').forEach((t) => { t.textContent = '?'; });
        svg.querySelectorAll('.sign').forEach((g) => g.classList.remove('picked'));
        await tween(260, (k) => fade.setAttribute('opacity', String(0.9 * (1 - k))));
      }
    },
    async onWrong(value) {
      const i = current.indexOf(value);
      if (i < 0) return;
      svg.querySelector(`#${P}sign${i}`).classList.add('blocked');
      retrigger(svg.querySelector(`#${P}block${i}`), 'show');
      play('place');
    },
    async onComplete() {
      await tween(260, (k) => fade.setAttribute('opacity', String(k * 0.9)));
      svg.querySelectorAll('.sign, .blocker').forEach((g) => { g.style.display = 'none'; });
      setDest(1.25);
      place(hero, 150, 262, baseScale * 0.9);
      await tween(300, (k) => fade.setAttribute('opacity', String(0.9 * (1 - k))));
      svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
      svgBurst(svg, 230, 110);
      await wait(900);
    },
    destroy() {},
  };
}
