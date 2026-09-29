// Mechanic G (V1.1) — FOREST SIGNAL. Green Frog is lost in the mist. a × b = b signal stations × a lights.
// 1. ACTION: connect the old signal tree to every station — tap a station, or drag from the tree across the
//    stations (the vine snaps on; no precise drawing). Each station switches on its a lights with a note.
// 2. RECALL (keypad): how many signal lights are on?
// 3. CONSEQUENCE: a pulse runs through the whole network (a, 2a, 3a …) and pushes the mist back; the last
//    pulse finds Frog.
import { THEMES, svgWrap, defs, sceneBackdrop, hero, emo, pine, mushroom, crystal, rock } from '../art.js';
import { wait, tween, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';
import { t, tList } from '../../i18n.js';
import { groupSlots, dotGrid, groupInput, handCue, caption } from './groups.js';

const HUB = { x: 62, y: 74 };

export function create({ root, mission, zone, P, grew, ready }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  let s = defs(P, T) + sceneBackdrop(zone.id, P, T);
  s += `<rect x="-400" y="224" width="1200" height="400" fill="url(#${P}ground)"/>`;
  s += pine(420, 250, 1.4) + mushroom(24, 270, 1.1) + rock(380, 262, 0.8, T.stone, T.stoneDark);
  // Frog's hiding place (top right) under a bank of mist
  s += `<ellipse cx="338" cy="100" rx="40" ry="10" fill="#2b6a55"/><ellipse cx="338" cy="98" rx="30" ry="6" fill="#3aa06f"/>
    <g transform="translate(338 84)"><g id="${P}npc" class="npc hidden-npc">${emo(0, 0, 30, mission.npc.e)}</g></g>
    <g id="${P}mist" class="mist" opacity=".92">${[[300, 70, 70, 34], [360, 96, 64, 30], [320, 118, 80, 24], [382, 60, 50, 30], [250, 96, 50, 26]]
      .map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#e8f3f5"/>`).join('')}</g>`;
  // The old signal tree (hub)
  s += `<path d="M40 226 L52 100 L72 100 L86 226Z" fill="#6b4524"/><path d="M62 100 L72 100 L86 226 L72 226Z" fill="#000" opacity=".15"/>`;
  s += `<circle id="${P}hubGlow" class="hub-glow" cx="${HUB.x}" cy="${HUB.y}" r="34" fill="url(#${P}glow)"/>` + crystal(HUB.x, 104, 0.72, '#9ff5d0', '#6fd8ff');
  s += `<g id="${P}links" class="links"></g><g id="${P}stations"></g>`;
  s += `<line id="${P}rubber" class="rubber" x1="${HUB.x}" y1="${HUB.y}" x2="${HUB.x}" y2="${HUB.y}" opacity="0"/>`;
  s += `<circle id="${P}hubHit" cx="${HUB.x}" cy="${HUB.y}" r="36" fill="transparent"/>`;
  s += hero(104, 226, 0.5, `${P}hero`);

  root.innerHTML = svgWrap(s, { cls: 'scene-svg acting', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const linksEl = svg.querySelector(`#${P}links`);
  const stEl = svg.querySelector(`#${P}stations`);
  const mist = svg.querySelector(`#${P}mist`);
  const rubber = svg.querySelector(`#${P}rubber`);
  let q = null, built = 0, landed = 0, lay = null, acting = false;

  function draw() {
    lay = groupSlots(q.b, { x0: 132, x1: 392, y0: 128, y1: 240 }, 26);
    const r = lay.r;
    const { pts, dr } = dotGrid(q.a, r * 0.7);
    let links = '';
    let st = caption(200, 22, t('mech.sgCap', { a: q.a }));
    lay.pts.forEach((c, k) => {
      const mx = (HUB.x + c.x) / 2, my = Math.min(HUB.y, c.y) - 24;
      links += `<path class="link" id="${P}link${k}" d="M${HUB.x} ${HUB.y} Q${mx.toFixed(1)} ${my.toFixed(1)} ${c.x.toFixed(1)} ${(c.y - r * 0.6).toFixed(1)}" pathLength="100" stroke-dasharray="0 100"/>
        <path class="link-pulse" id="${P}pulse${k}" d="M${HUB.x} ${HUB.y} Q${mx.toFixed(1)} ${my.toFixed(1)} ${c.x.toFixed(1)} ${(c.y - r * 0.6).toFixed(1)}" pathLength="100"/>`;
      st += `<g class="gt station" data-k="${k}" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})">
        <circle class="hit" r="${r + 4}" fill="transparent"/>
        <circle class="st-glow" r="${r * 1.5}" fill="url(#${P}glow)"/>
        <path class="st-mast" d="M-3 ${-r * 0.8} L0 ${-r * 1.15} L3 ${-r * 0.8}Z"/>
        <circle class="st-body" r="${r * 0.92}"/>
        ${pts.map((p, i) => `<circle class="sig" style="--i:${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('')}
        <text class="st-n" y="${r + 12}" text-anchor="middle"></text></g>`;
    });
    linksEl.innerHTML = links;
    stEl.innerHTML = st;
    retrigger(stEl, 'pop-in');
  }

  function build(g) {
    if (!acting) return;
    g.classList.add('built');
    built += 1;
    grew(built);
    play('signal', built - 1);
    const k = +g.dataset.k;
    const link = svg.querySelector(`#${P}link${k}`);
    tween(260, (e) => link.setAttribute('stroke-dasharray', `${e * 100} 100`)).then(() => {
      g.classList.add('on');
      g.querySelector('.st-n').textContent = String(q.a);
      landed += 1;
      if (landed === q.b && acting) {
        acting = false;
        svg.classList.remove('acting');
        rubber.setAttribute('opacity', '0');
        wait(380).then(ready);
      }
    });
  }
  const off = groupInput(svg, build);

  // Dragging from the tree draws a vine that follows the finger; crossing a station connects it.
  let dragging = false;
  const toSvg = (e) => {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(m.inverse());
  };
  const onDown = (e) => { if (acting && e.target.id === `${P}hubHit`) { dragging = true; rubber.setAttribute('opacity', '1'); onMove(e); } };
  const onMove = (e) => {
    if (!dragging) return;
    const p = toSvg(e);
    if (p) { rubber.setAttribute('x2', p.x.toFixed(1)); rubber.setAttribute('y2', p.y.toFixed(1)); }
  };
  const onUp = () => { dragging = false; rubber.setAttribute('opacity', '0'); };
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerup', onUp);
  svg.addEventListener('pointercancel', onUp);
  svg.addEventListener('pointerleave', onUp);

  const nextUnbuilt = () => stEl.querySelector('.gt:not(.built)');

  return {
    action: true, answerKind: 'keypad', floatAt: 0.3,
    icon: '📡',
    actionInstruction: t('mech.sgAct'), actionHow: t('mech.sgHow'), actionNudge: t('mech.sgNudge'),
    instruction: t('mech.sg'),
    correctLine: tList('mech.sgOk'),
    setQuestion(question) {
      q = question;
      built = 0; landed = 0;
      acting = true;
      svg.classList.add('acting');
      draw();
    },
    actNext() { const g = nextUnbuilt(); if (g) build(g); },
    actionHint() {
      const g = nextUnbuilt();
      if (!g) return;
      const c = lay.pts[+g.dataset.k];
      handCue(svg, c.x + 6, c.y + lay.r + 18);
      stEl.querySelectorAll('.gt:not(.built)').forEach((n) => retrigger(n, 'nudge'));
    },
    onHint(h) {
      if (h.level > 2) return;
      [...stEl.querySelectorAll('.station')].forEach((n, k) => setTimeout(() => retrigger(n, 'pulse'), k * 160));
    },
    async onCorrect(i) {
      const cap = stEl.querySelector('.caption');
      if (cap) cap.classList.add('fade-out');
      const sts = [...stEl.querySelectorAll('.station')];
      const step = sts.length > 6 ? 90 : 140;
      retrigger(svg.querySelector(`#${P}hubGlow`), 'pulse');
      for (let k = 0; k < sts.length; k++) {
        retrigger(svg.querySelector(`#${P}pulse${k}`), 'run');
        sts[k].querySelector('.st-n').textContent = String(q.a * (k + 1));
        retrigger(sts[k], 'pulse');
        play('count', k);
        await wait(step);
      }
      play('whoosh');
      const from = +mist.getAttribute('opacity');
      const to = 0.92 * (1 - (i + 1) / N);
      await tween(700, (e) => mist.setAttribute('opacity', String(from + (to - from) * e)));
      await wait(200);
      stEl.classList.add('fade-out');
      linksEl.classList.add('fade-out');
      await wait(300);
      stEl.innerHTML = ''; linksEl.innerHTML = '';
      stEl.classList.remove('fade-out'); linksEl.classList.remove('fade-out');
    },
    async onWrong() { retrigger(stEl, 'flicker'); },
    async onComplete() {
      mist.setAttribute('opacity', '0');
      svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
      play('ribbit');
      svgBurst(svg, 338, 60);
      await wait(300);
      play('reveal');
      await wait(900);
    },
    destroy() {
      off();
      svg.removeEventListener('pointerdown', onDown);
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerup', onUp);
      svg.removeEventListener('pointercancel', onUp);
      svg.removeEventListener('pointerleave', onUp);
    },
  };
}
