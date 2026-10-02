// WAKE THE FIREFLIES. V1.2: make a reusable group of a, then send it to each of b nests.
// Support fades from visible groups to remembering the structure to independent retrieval.
// 2. RECALL: "How many fireflies in all?"
// 3. CONSEQUENCE: the fireflies rise nest by nest (a, 2a, 3a …) and light the next stretch of the path home.
import { THEMES, svgWrap, defs, sceneBackdrop, hero, emo, pine, mushroom } from '../art.js';
import { wait, tween, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';
import { t, tList } from '../../i18n.js';
import { groupSlots, arraySlots, dotGrid, columnDots, groupInput, handCue, atPathPoint, caption } from './groups.js';

const DARK = 0.5;
const PATH = 'M22 266 C 100 282, 150 236, 214 248 S 318 240, 348 226';

export function create({ root, mission, zone, P, grew, ready }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  let s = defs(P, T) + sceneBackdrop(zone.id, P, T, { night: true });
  s += `<rect x="-400" y="206" width="1200" height="400" fill="url(#${P}ground)"/>`;
  s += pine(-8, 250, 1.4) + pine(410, 256, 1.5) + mushroom(300, 270, 1) + mushroom(120, 272, 0.8);
  // Little Squirrel's home tree
  s += `<path d="M330 236 L340 64 L378 64 L392 236Z" fill="#5b3a1e"/><path d="M362 64 L378 64 L392 236 L372 236Z" fill="#000" opacity=".15"/>
    <circle cx="344" cy="54" r="30" fill="#1f5a49"/><circle cx="378" cy="44" r="28" fill="#1a4d3f"/><circle cx="360" cy="30" r="22" fill="#236650"/>
    <ellipse id="${P}home" cx="360" cy="130" rx="11" ry="13" fill="#1c1208"/>
    <g transform="translate(360 132)"><g id="${P}npc" class="npc hidden-npc">${emo(0, 0, 22, mission.npc.e)}</g></g>`;
  s += `<path d="${PATH}" stroke="#2c4638" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  s += `<rect id="${P}dark" x="-400" y="-300" width="1200" height="900" fill="#06102a" opacity="${DARK}" pointer-events="none"/>`;
  // Above the darkness: the lit path, the nests, the hero with an empty lantern jar.
  s += `<path id="${P}pathGlow" d="${PATH}" pathLength="100" stroke="#fff3a0" stroke-opacity=".28" stroke-width="16" fill="none" stroke-linecap="round" stroke-dasharray="0 100"/>
    <path id="${P}pathLit" d="${PATH}" pathLength="100" stroke="#ffe98a" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="0 100"/>
    <path id="${P}pathRef" d="${PATH}" fill="none" stroke="none"/>`;
  s += `<g id="${P}nests" class="nests"></g><g id="${P}jar" class="group-jar"></g>`;
  s += `<g id="${P}heroWrap">${hero(0, 0, 0.5, `${P}hero`)}</g>`;

  root.innerHTML = svgWrap(s, { cls: 'scene-svg acting', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const nestsEl = svg.querySelector(`#${P}nests`);
  const jarEl = svg.querySelector(`#${P}jar`);
  const dark = svg.querySelector(`#${P}dark`);
  const lit = svg.querySelector(`#${P}pathLit`);
  const glow = svg.querySelector(`#${P}pathGlow`);
  const pathRef = svg.querySelector(`#${P}pathRef`);
  const heroEl = svg.querySelector(`#${P}hero`);
  atPathPoint(heroEl, pathRef, 0.02, 0.5, 2);
  let q = null;
  let built = 0, landed = 0, slots = null;
  let acting = false;
  let jar = 0, destroyed = false;
  let pathStart = 0;

  function drawJar() {
    const { pts, dr } = dotGrid(jar, 20);
    jarEl.innerHTML = `<g transform="translate(190 224)"><rect x="-31" y="-27" width="62" height="54" rx="13" fill="#203b38" stroke="#fff3a0" stroke-width="2"/>${pts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${dr}" fill="#ffe98a"/>`).join('')}<text class="nest-n" x="45" y="5">${jar}</text></g>`;
  }

  function drawNests() {
    const box = { x0: 20, x1: 324, y0: 58, y1: 176 };
    const lay = q.encounter.representation === 'array' ? arraySlots(q.b, box) : groupSlots(q.b, box, 30);
    slots = lay;
    const r = lay.r;
    const { pts, dr } = q.encounter.representation === 'array' ? columnDots(q.a, r * 0.72) : dotGrid(q.a, r * 0.72);
    let g = caption(172, 38, t('mech.ffCap', { a: q.a }));
    lay.pts.forEach((c, k) => {
      const dots = pts.map((p, i) => `<circle class="ff" style="--i:${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('');
      g += `<g class="gt nest" data-k="${k}" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})">
        <circle class="hit" r="${r + 4}" fill="transparent"/>
        <circle class="halo" r="${r * 1.6}" fill="url(#${P}glow)"/>
        <g class="bush"><circle cx="${-r * 0.45}" cy="${r * 0.15}" r="${r * 0.62}"/><circle cx="${r * 0.45}" cy="${r * 0.15}" r="${r * 0.62}"/><circle cy="${-r * 0.25}" r="${r * 0.72}"/></g>
        <g class="ffs">${dots}</g>
        <text class="nest-n" y="${r + 13}" text-anchor="middle"></text></g>`;
    });
    nestsEl.innerHTML = g;
    retrigger(nestsEl, 'pop-in');
  }

  function build(g) {
    if (!acting || g.classList.contains('built')) return;
    if (jar !== q.a) { retrigger(jarEl, 'nudge'); return; }
    g.classList.add('built');
    built += 1;
    const k = built;
    grew(k);
    play('firefly', k - 1);
    // The child's group flies from the jar into the nest; the path responds immediately.
    const NS = 'http://www.w3.org/2000/svg';
    const sw = document.createElementNS(NS, 'g');
    sw.setAttribute('class', 'swarm');
    sw.innerHTML = '<circle r="3" cx="-4"/><circle r="2.4" cx="4" cy="-3"/><circle r="2.2" cy="4"/>';
    svg.appendChild(sw);
    const x0 = 190, y0 = 224;
    const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
    const x1 = +m[1], y1 = +m[2];
    tween(300, (e) => sw.setAttribute('transform', `translate(${x0 + (x1 - x0) * e} ${y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * 30})`)).then(() => {
      sw.remove();
      if (destroyed) return;
      g.classList.add('awake');
      g.querySelector('.nest-n').textContent = String(q.a);
      landed += 1;
      const v = pathStart + (landed / q.b) * (100 / N) * 0.5;
      lit.setAttribute('stroke-dasharray', `${v} 100`);
      glow.setAttribute('stroke-dasharray', `${v} 100`);
      if (landed === q.b && acting) {
        acting = false;
        svg.classList.remove('acting');
        jarEl.innerHTML = '';
        if (q.encounter.support === 'structure') svg.classList.add('scaffold-faded');
        wait(380).then(() => { if (!destroyed) ready(); });
      }
    });
  }

  const off = groupInput(svg, build);

  function nextUnbuilt() { return nestsEl.querySelector('.gt:not(.built)'); }

  return {
    action: true, answerKind: 'choices', skin: 'glow', optionCount: 4, floatAt: 0.3,
    actsOn(i, question) { return question.encounter.support !== 'recall'; },
    actionControls() {
      return `<button class="world-adjust" data-act="world-remove" aria-label="${t('adaptive.remove')}">−</button><button class="world-adjust" data-act="world-add" aria-label="${t('adaptive.add')}">+ ✨</button><button class="world-send" data-act="world-send">${t('adaptive.fill')}</button>`;
    },
    handleAction(act) {
      if (!acting) return;
      if (act === 'world-add' || act === 'world-remove') {
        jar = Math.max(0, Math.min(9, jar + (act === 'world-add' ? 1 : -1)));
        drawJar(); play('count', jar);
      } else if (act === 'world-send') { const g = nextUnbuilt(); if (g) build(g); }
    },
    icon: '✨',
    actionInstruction: t('adaptive.ffAct'), actionHow: t('mech.ffHow'), actionNudge: t('adaptive.ffNudge'),
    instruction: t('mech.ff'),
    correctLine: tList('mech.ffOk'),
    setQuestion(question, i) {
      q = question;
      built = 0; landed = 0;
      acting = q.encounter.support !== 'recall';
      jar = 0; pathStart = (i / N) * 100;
      svg.classList.toggle('acting', acting);
      svg.classList.toggle('scaffold-faded', !acting);
      drawNests();
      if (acting) drawJar();
      else { jarEl.innerHTML = ''; nestsEl.querySelectorAll('.nest').forEach((n) => n.classList.add('built', 'awake')); }
    },
    actNext() { const g = nextUnbuilt(); if (g) build(g); },
    actionHint() {
      const g = nextUnbuilt();
      if (!g) return;
      const k = +g.dataset.k;
      handCue(svg, slots.pts[k].x + 6, slots.pts[k].y + slots.r + 16);
      nestsEl.querySelectorAll('.gt:not(.built)').forEach((n) => retrigger(n, 'nudge'));
    },
    // Math hint in the world: every nest pulses with the SAME number — the structure, not the answer.
    onHint(h) {
      svg.classList.remove('scaffold-faded');
      if (h.level > 2) return;
      [...nestsEl.querySelectorAll('.nest')].forEach((n, k) => setTimeout(() => retrigger(n, 'pulse'), k * 160));
    },
    async onCorrect(i) {
      const cap = nestsEl.querySelector('.caption');
      if (cap) cap.classList.add('fade-out');
      const nests = [...nestsEl.querySelectorAll('.nest')];
      const step = nests.length > 6 ? 90 : 140;
      for (let k = 0; k < nests.length; k++) {
        nests[k].querySelector('.nest-n').textContent = String(q.a * (k + 1));
        nests[k].classList.add('rise');
        play('count', k);
        await wait(step);
      }
      play('lamp');
      const from = parseFloat(lit.getAttribute('stroke-dasharray')), to = ((i + 1) / N) * 100;
      const fromO = +dark.getAttribute('opacity'), toO = DARK * (1 - (i + 1) / N) * 0.7 + 0.08;
      await tween(900, (e) => {
        const v = from + (to - from) * e;
        lit.setAttribute('stroke-dasharray', `${v} 100`);
        glow.setAttribute('stroke-dasharray', `${v} 100`);
        dark.setAttribute('opacity', String(fromO + (toO - fromO) * e));
        atPathPoint(heroEl, pathRef, Math.max(0.02, v / 100 - 0.04), 0.5, 2);
      });
      nestsEl.innerHTML = '';
    },
    async onWrong() { retrigger(nestsEl, 'flicker'); },
    async onComplete() {
      svg.querySelector(`#${P}home`).setAttribute('fill', '#ffcf5a');
      svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
      svgBurst(svg, 360, 110, { chars: ['✨', '💛', '✨'], n: 5 });
      svgBurst(svg, 200, 200, { chars: ['✨'], n: 4 });
      play('reveal');
      const fromO = +dark.getAttribute('opacity');
      await tween(600, (e) => dark.setAttribute('opacity', String(fromO * (1 - e))));
      await wait(800);
    },
    destroy() { destroyed = true; acting = false; off(); },
  };
}
