// Mechanic I (V1.1) — WAKE THE LIGHTHOUSE. a × b = b turns of the crank × a sparks per turn.
// 1. ACTION: turn the generator crank (tap it — or tap the meter). Every turn fills one battery cell with the
//    same bundle of a sparks; the equation grows a × 1, a × 2 … a × b.
// 2. RECALL (keypad): how many sparks for this floor?
// 3. CONSEQUENCE: the sparks run up the cable (a, 2a, 3a …) and wake one floor of the lighthouse. When every
//    floor is awake the beam sweeps the sea and Dolphin finds the way home.
import { THEMES, svgWrap, defs, sceneBackdrop, emo, hero, rock, crystal } from '../art.js';
import { wait, tween, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';
import { t, tList } from '../../i18n.js';
import { groupSlots, dotGrid, handCue, caption } from './groups.js';

const DARK = 0.55;
const GEN = { x: 60, y: 236 };
const CABLE = 'M82 232 C 120 262, 160 262, 184 254 L 186 70';

export function create({ root, mission, zone, P, grew, ready }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  let s = defs(P, T) + sceneBackdrop(zone.id, P, T, { night: true });
  s += rock(200, 276, 2.4, T.stone, T.stoneDark) + rock(46, 290, 1.4, T.stone, T.stoneDark) + crystal(372, 292, 0.8, T.crystal, T.crystal2);
  // lighthouse
  s += `<path d="M180 262 L186 60 L214 60 L220 262Z" fill="#f2f2f2"/><path d="M200 60 L214 60 L220 262 L204 262Z" fill="#000" opacity=".08"/>
    <rect x="176" y="50" width="48" height="10" rx="3" fill="#2e3f5c"/><path d="M182 32 L200 16 L218 32Z" fill="#ff5a5f"/><rect id="${P}lampRoom" x="186" y="32" width="28" height="18" rx="3" fill="#44526b"/>`;
  const top = 62, bottom = 262;
  const floors = [];
  for (let i = 0; i < N; i++) {
    const y1 = bottom - ((i + 1) * (bottom - top)) / N;
    const y0 = bottom - (i * (bottom - top)) / N;
    const x = 182 + (i * 4) / N, w = 36 - (i * 8) / N;
    s += `<rect x="${x}" y="${y1 + 2}" width="${w}" height="${y0 - y1 - 4}" fill="${i % 2 ? '#fff' : '#ff5a5f'}" opacity=".9"/>`;
    floors.push({ y: (y0 + y1) / 2, band: [x, y1 + 2, w, y0 - y1 - 4] });
  }
  s += `<g transform="translate(318 168)"><g id="${P}npc" class="npc hidden-npc">${emo(0, 0, 36, mission.npc.e)}</g></g>`;
  s += `<rect id="${P}dark" x="-400" y="-300" width="1200" height="900" fill="#081232" opacity="${DARK}" pointer-events="none"/>`;
  s += `<g class="night-stars">${[[40, 30], [120, 18], [260, 26], [370, 40], [320, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('')}</g>`;
  // above the darkness: floors, cable, generator, meter
  floors.forEach((f, i) => {
    const [x, y, w, h] = f.band;
    s += `<g class="lamp" id="${P}floor${i}"><rect class="band-glow" x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffe066"/>
      <circle class="lamp-glow" cx="200" cy="${f.y}" r="46" fill="url(#${P}glow)"/></g>`;
  });
  s += `<path id="${P}cable" d="${CABLE}" class="cable"/>`;
  s += `<g id="${P}sparks"></g>`;
  s += `<g id="${P}gen" class="gen" transform="translate(${GEN.x} ${GEN.y})">
    <rect x="-28" y="-20" width="56" height="34" rx="8" fill="#44526b" stroke="#263553" stroke-width="3"/>
    <path d="M-3 -14 L5 -14 L0 -4 L7 -4 L-4 10 L-1 0 L-7 0Z" fill="#ffd23f"/>
    <g transform="translate(0 -38)"><circle r="17" fill="none" stroke="#8fa0b8" stroke-width="5"/><g id="${P}wheel"><circle r="17" fill="none" stroke="#c5d2e3" stroke-width="2" stroke-dasharray="6 5"/>
      <rect x="-2.5" y="-2.5" width="20" height="5" rx="2.5" fill="#c5d2e3"/><circle cx="17" cy="0" r="6" fill="#ff8a1f" stroke="#fff" stroke-width="2"/></g><circle r="4" fill="#263553"/></g>
    <circle id="${P}crankHit" class="crank-hit" cy="-24" r="46" fill="transparent"/></g>`;
  s += `<g id="${P}meter"></g>`;
  s += hero(18, 252, 0.5, `${P}hero`);
  s += `<g id="${P}beam" opacity="0"><g><path d="M200 41 L420 10 L420 72Z" fill="#fff6b0" opacity=".45"/><path d="M200 41 L-20 10 L-20 72Z" fill="#fff6b0" opacity=".3"/>
    <animateTransform attributeName="transform" type="rotate" values="-12 200 41;12 200 41;-12 200 41" dur="3.2s" repeatCount="indefinite"/></g><circle cx="200" cy="41" r="14" fill="#fff6b0"/></g>`;

  root.innerHTML = svgWrap(s, { cls: 'scene-svg acting', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const dark = svg.querySelector(`#${P}dark`);
  const meter = svg.querySelector(`#${P}meter`);
  const wheel = svg.querySelector(`#${P}wheel`);
  const cable = svg.querySelector(`#${P}cable`);
  const sparks = svg.querySelector(`#${P}sparks`);
  let q = null, turns = 0, landed = 0, angle = 0, lay = null, acting = false, floorIdx = 0;
  let queue = Promise.resolve();

  function draw() {
    lay = groupSlots(q.b, { x0: 238, x1: 396, y0: 170, y1: 262 }, 20);
    const { pts, dr } = dotGrid(q.a, lay.r * 0.62);
    let g = caption(316, 152, t('mech.bcCap', { a: q.a }));
    lay.pts.forEach((c, k) => {
      const w = lay.r * 1.7, h = lay.r * 1.7;
      g += `<g class="cell" data-k="${k}" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})">
        <rect class="cell-body" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6"/><rect class="cell-tip" x="-4" y="${-h / 2 - 4}" width="8" height="4" rx="1.5"/>
        ${pts.map((p, i) => `<circle class="spark" style="--i:${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('')}
        <text class="cell-n" y="${h / 2 + 11}" text-anchor="middle"></text></g>`;
    });
    g += `<rect class="meter-hit" x="232" y="140" width="170" height="130" fill="transparent"/>`;
    meter.innerHTML = g;
    retrigger(meter, 'pop-in');
  }

  function turn() {
    if (!acting || turns >= q.b) return;
    const k = turns;
    turns += 1;
    grew(turns);
    queue = queue.then(async () => {
      play('crank', k);
      const a0 = angle;
      angle += 360;
      await tween(300, (e) => wheel.setAttribute('transform', `rotate(${a0 + 360 * e})`));
      const cell = meter.querySelector(`.cell[data-k="${k}"]`);
      cell.classList.add('on');
      cell.querySelector('.cell-n').textContent = String(q.a);
      landed += 1;
      if (landed === q.b && acting) {
        acting = false;
        svg.classList.remove('acting');
        await wait(380);
        ready();
      }
    });
  }
  const onDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const id = e.target.id || '';
    if (id === `${P}crankHit` || e.target.closest('.cell') || e.target.classList.contains('meter-hit')) turn();
  };
  svg.addEventListener('pointerdown', onDown);

  async function runSparks() {
    const L = cable.getTotalLength();
    const climb = 254 - 70;                                            // the straight part up the tower
    const endFrac = (L - climb + (254 - floors[floorIdx].y)) / L;      // stop at the floor being woken
    const NS = 'http://www.w3.org/2000/svg';
    const sp = document.createElementNS(NS, 'circle');
    sp.setAttribute('r', '5');
    sp.setAttribute('class', 'cable-spark');
    sparks.appendChild(sp);
    await tween(520, (e) => {
      const p = cable.getPointAtLength(Math.min(1, e * endFrac) * L);
      sp.setAttribute('cx', p.x.toFixed(1)); sp.setAttribute('cy', p.y.toFixed(1));
    });
    sp.remove();
  }

  return {
    action: true, answerKind: 'keypad', floatAt: 0.3,
    icon: '⚡',
    actionInstruction: t('mech.bcAct'), actionHow: t('mech.bcHow'), actionNudge: t('mech.bcNudge'),
    instruction: t('mech.bc'),
    correctLine: tList('mech.bcOk'),
    setQuestion(question, i) {
      q = question;
      floorIdx = i;
      turns = 0; landed = 0;
      acting = true;
      svg.classList.add('acting');
      svg.querySelectorAll('.lamp.target').forEach((el) => el.classList.remove('target'));
      svg.querySelector(`#${P}floor${i}`).classList.add('target');
      draw();
    },
    actNext() { turn(); },
    actionHint() {
      handCue(svg, GEN.x + 10, GEN.y + 10);
      retrigger(svg.querySelector(`#${P}gen`), 'nudge');
    },
    onHint(h) {
      if (h.level > 2) return;
      [...meter.querySelectorAll('.cell')].forEach((n, k) => setTimeout(() => retrigger(n, 'pulse'), k * 160));
    },
    async onCorrect(i) {
      const cap = meter.querySelector('.caption');
      if (cap) cap.classList.add('fade-out');
      const cells = [...meter.querySelectorAll('.cell')];
      const step = cells.length > 6 ? 90 : 140;
      for (let k = 0; k < cells.length; k++) {
        cells[k].querySelector('.cell-n').textContent = String(q.a * (k + 1));
        retrigger(cells[k], 'pulse');
        play('count', k);
        await wait(step);
      }
      play('charge');
      cells.forEach((c) => c.classList.add('drain'));
      await runSparks();
      const f = svg.querySelector(`#${P}floor${i}`);
      f.classList.remove('target');
      f.classList.add('lit');
      play('lamp');
      const from = +dark.getAttribute('opacity'), to = DARK * (1 - (i + 1) / N) * 0.85;
      await tween(420, (e) => dark.setAttribute('opacity', String(from + (to - from) * e)));
      meter.innerHTML = '';
    },
    async onWrong() { retrigger(meter, 'flicker'); },
    async onComplete() {
      svg.querySelector(`#${P}lampRoom`).setAttribute('fill', '#ffe27a');
      svg.querySelector(`#${P}beam`).setAttribute('opacity', '1');
      svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
      svgBurst(svg, 318, 130);
      play('reveal');
      const from = +dark.getAttribute('opacity');
      await tween(500, (e) => dark.setAttribute('opacity', String(from + (0.2 - from) * e)));
      await wait(700);
    },
    destroy() { svg.removeEventListener('pointerdown', onDown); },
  };
}
