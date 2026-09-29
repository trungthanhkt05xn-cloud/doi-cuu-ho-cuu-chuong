// Mechanic H (V1.1) — OCEAN RELAY. Sea Turtle waits on a far island. a × b = b rescue buoys × a energy packs.
// 1. ACTION: tap the buoys (any of them — the boat always sails to the next one in line). The boat drops
//    the same bundle of a packs at each buoy, and each buoy rings and lights up.
// 2. RECALL: how many energy packs in all?
// 3. CONSEQUENCE: the lit buoys relay a light toward the island (a, 2a, 3a …) and the boat sails one leg
//    closer. The last leg reaches Turtle.
import { THEMES, svgWrap, defs, sceneBackdrop, hero, emo, palm, crystal } from '../art.js';
import { wait, tween, moveG, place, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';
import { t, tList } from '../../i18n.js';
import { dotGrid, groupInput, handCue, caption } from './groups.js';

const START = { x: 40, y: 244 };

export function create({ root, mission, zone, P, grew, ready }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  let s = defs(P, T) + sceneBackdrop(zone.id, P, T);
  s += `<rect x="-400" y="170" width="1200" height="400" fill="#0c86b5" opacity=".35"/>`;
  s += `<g id="${P}island" transform="translate(356 150) scale(.5)"><ellipse cx="0" cy="0" rx="60" ry="13" fill="${T.ground}"/><ellipse cx="0" cy="4" rx="68" ry="10" fill="#fff" opacity=".4"/>
    ${palm(10, -2, 0.75)}${crystal(-34, -2, 0.5, T.crystal, T.crystal2)}<g id="${P}npc" class="npc hidden-npc">${emo(-10, -20, 40, mission.npc.e)}</g></g>`;
  s += `<g id="${P}beams" class="beams"></g><g id="${P}buoys"></g>`;
  s += `<g id="${P}boat" class="boat"><path d="M-30 -6 L30 -6 L22 10 L-22 10Z" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="3"/>
    <rect x="-2" y="-44" width="4" height="40" fill="${T.woodDark}"/><path d="M2 -42 L24 -16 L2 -14Z" fill="#fff"/>${hero(-10, -2, 0.5)}
    <g class="cargo" transform="translate(20 -12)"><rect x="-8" y="-8" width="16" height="12" rx="3" fill="#ffd23f" stroke="#c99a1a" stroke-width="1.5"/><path d="M-2 -6 L2 -6 L0 -1 L3 -1 L-2 3 L0 -2 L-3 -2Z" fill="#7a5a00"/></g></g>`;
  s += `<path class="wave-line" d="M-400 206 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none" pointer-events="none"/>`;

  root.innerHTML = svgWrap(s, { cls: 'scene-svg acting', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const buoysEl = svg.querySelector(`#${P}buoys`);
  const beams = svg.querySelector(`#${P}beams`);
  const boat = svg.querySelector(`#${P}boat`);
  const island = svg.querySelector(`#${P}island`);
  place(boat, START.x, START.y, 1);
  let q = null, claimed = 0, landed = 0, pts = [], r = 24, acting = false;
  let queue = Promise.resolve();

  function draw() {
    const b = q.b;
    pts = [];
    for (let k = 0; k < b; k++) {
      const x = b === 1 ? 200 : 96 + (k * (318 - 96)) / (b - 1);
      pts.push({ x, y: b === 1 ? 214 : k % 2 ? 234 : 188 });
    }
    r = b === 1 ? 26 : Math.max(16, Math.min(26, ((318 - 96) / (b - 1)) * 0.9));
    const { pts: dots, dr } = dotGrid(q.a, r * 0.5);
    let g = caption(186, 118, t('mech.rlCap', { a: q.a }));
    pts.forEach((c, k) => {
      g += `<g class="gt buoy" data-k="${k}" transform="translate(${c.x.toFixed(1)} ${c.y})">
        <circle class="hit" r="${r + 4}" fill="transparent"/>
        <circle class="by-glow" cy="${-r * 0.5}" r="${r * 1.3}" fill="url(#${P}glow)"/>
        <ellipse class="by-float" cy="${r * 0.35}" rx="${r * 0.75}" ry="${r * 0.3}"/>
        <rect class="by-mast" x="-2" y="${-r * 1.05}" width="4" height="${r * 0.9}"/>
        <circle class="by-lamp" cy="${-r * 1.1}" r="${Math.max(3, r * 0.2)}"/>
        <g transform="translate(0 ${-r * 0.2})"><circle class="by-rack" r="${r * 0.55}"/>
        ${dots.map((p, i) => `<circle class="pack" style="--i:${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('')}</g>
        <text class="by-n" y="${r * 0.35 + 16}" text-anchor="middle"></text></g>`;
    });
    buoysEl.innerHTML = g;
    retrigger(buoysEl, 'pop-in');
  }

  // Any tap claims the NEXT buoy in line; the boat serves claims one after another.
  function claim() {
    if (!acting || claimed >= q.b) return;
    const k = claimed;
    const g = buoysEl.querySelector(`.buoy[data-k="${k}"]`);
    g.classList.add('built');
    claimed += 1;
    grew(claimed);
    queue = queue.then(() => serve(g, k));
  }
  async function serve(g, k) {
    const c = pts[k];
    await moveG(boat, c.x - r - 18, c.y + r * 0.35, 260, { hop: 4 });
    g.classList.add('on');
    g.querySelector('.by-n').textContent = String(q.a);
    play('buoy', k);
    landed += 1;
    if (landed === q.b && acting) {
      acting = false;
      svg.classList.remove('acting');
      await wait(380);
      ready();
    }
  }
  const off = groupInput(svg, () => claim());

  return {
    action: true, answerKind: 'choices', skin: 'glow', optionCount: 4, floatAt: 0.3,
    icon: '⛵',
    actionInstruction: t('mech.rlAct'), actionHow: t('mech.rlHow'), actionNudge: t('mech.rlNudge'),
    instruction: t('mech.rl'),
    correctLine: tList('mech.rlOk'),
    setQuestion(question) {
      q = question;
      claimed = 0; landed = 0;
      acting = true;
      svg.classList.add('acting');
      draw();
    },
    actNext() { claim(); },
    actionHint() {
      const g = buoysEl.querySelector('.gt:not(.built)');
      if (!g) return;
      const c = pts[+g.dataset.k];
      handCue(svg, c.x + 6, c.y + r + 22);
      retrigger(g, 'nudge');
    },
    onHint(h) {
      if (h.level > 2) return;
      [...buoysEl.querySelectorAll('.buoy')].forEach((n, k) => setTimeout(() => retrigger(n, 'pulse'), k * 160));
    },
    async onCorrect(i) {
      const cap = buoysEl.querySelector('.caption');
      if (cap) cap.classList.add('fade-out');
      const bs = [...buoysEl.querySelectorAll('.buoy')];
      const step = bs.length > 6 ? 90 : 140;
      for (let k = 0; k < bs.length; k++) {
        bs[k].querySelector('.by-n').textContent = String(q.a * (k + 1));
        retrigger(bs[k], 'pulse');
        play('count', k);
        await wait(step);
      }
      // relay light from the last buoy to the island
      const last = pts[pts.length - 1];
      beams.innerHTML = `<path class="beam" d="M${last.x} ${last.y - r} Q 330 110 356 146" pathLength="100"/>`;
      play('whoosh');
      await wait(420);
      const sc0 = 0.5 + (0.5 * i) / N, sc1 = 0.5 + (0.5 * (i + 1)) / N;
      await Promise.all([
        tween(700, (e) => island.setAttribute('transform', `translate(356 ${150 + 6 * (i + e) / N}) scale(${sc0 + (sc1 - sc0) * e})`)),
        moveG(boat, 330, 230, 700, { hop: 6 }),
      ]);
      buoysEl.classList.add('fade-out');
      beams.innerHTML = '';
      await wait(250);
      buoysEl.innerHTML = '';
      buoysEl.classList.remove('fade-out');
      if (i < N - 1) place(boat, START.x, START.y, 1);
    },
    async onWrong() { retrigger(buoysEl, 'flicker'); },
    async onComplete() {
      await moveG(boat, 272, 190, 500, { hop: 4 });
      svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
      svgBurst(svg, 350, 110);
      play('reveal');
      await wait(900);
    },
    destroy() { off(); },
  };
}
