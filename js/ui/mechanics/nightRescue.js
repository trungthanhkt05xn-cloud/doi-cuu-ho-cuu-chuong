// Mechanic J (V1.1 signature) — NIGHT RESCUE: one short connected mini-adventure, reward only at the end.
//   A · FIND    (step 0) the forest signal flashes b groups of a → tap the hollow tree with that number.
//   B · REACH   (steps 1–2) light b glowing mushrooms of a spots → their light becomes stepping stones.
//   C · RESCUE  (step 3) light b lanterns of a fireflies → the basket lifts Owl down (keypad).
// The world the child already fixed helps: restored signal / fireflies change the story lines.
import { THEMES, svgWrap, defs, sceneBackdrop, hero, emo, pine, rock, crystal, spreadGroups } from '../art.js';
import { wait, tween, moveG, place, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';
import { t, tn, tList } from '../../i18n.js';
import { world } from '../../game/progression.js';
import { groupSlots, dotGrid, groupInput, handCue, caption } from './groups.js';

const TREES = [80, 200, 320];

export function create({ root, mission, zone, P, pick, grew, ready }) {
  const T = THEMES[zone.id];
  const w = world();
  const base = defs(P, T) + sceneBackdrop(zone.id, P, T);
  root.innerHTML = svgWrap(`${base}<g id="${P}stage"></g><g id="${P}groups"></g><g id="${P}actors"></g><g id="${P}story" class="story" opacity="0"></g>`,
    { cls: 'scene-svg', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const stage = svg.querySelector(`#${P}stage`);
  const groupsEl = svg.querySelector(`#${P}groups`);
  const actors = svg.querySelector(`#${P}actors`);
  const storyEl = svg.querySelector(`#${P}story`);
  let phase = '';
  let q = null, options = [], built = 0, landed = 0, lay = null, acting = false;
  let heroEl = null;

  const darkRect = (o) => `<rect class="nr-dark" x="-400" y="-300" width="1200" height="900" fill="#06102a" opacity="${o}" pointer-events="none"/>`;

  async function story(text, ms = 2600) {
    storyEl.innerHTML = `<g transform="translate(200 16)"><rect x="-172" y="-14" width="344" height="28" rx="14"/><text text-anchor="middle" dy=".35em">${text}</text></g>`;
    storyEl.setAttribute('opacity', '1');
    retrigger(storyEl, 'pop-in');
    clearTimeout(story.t);
    story.t = setTimeout(() => storyEl.setAttribute('opacity', '0'), ms);
  }

  // ── A · FIND ──
  function drawFind() {
    phase = 'find';
    let s = `<rect x="-400" y="244" width="1200" height="400" fill="url(#${P}ground)"/>`;
    if (w.signal) s += `<g class="sig-post">${crystal(24, 118, 0.6, '#9ff5d0', '#6fd8ff')}<circle cx="24" cy="92" r="26" fill="url(#${P}glow)" class="hub-glow"/></g>`;
    TREES.forEach((x, i) => {
      s += `<g class="tree" id="${P}tree${i}" data-idx="${i}">
        <path d="M${x - 16} 258 L${x - 10} 140 L${x + 10} 140 L${x + 16} 258Z" fill="#5b3a1e"/>
        <circle cx="${x - 20}" cy="136" r="22" fill="#1f5a49"/><circle cx="${x + 20}" cy="132" r="22" fill="#1a4d3f"/><circle cx="${x}" cy="120" r="22" fill="#236650"/>
        <ellipse class="hollow" cx="${x}" cy="180" rx="10" ry="13" fill="#1c1208"/>
        <g class="who" transform="translate(${x} 182)"></g>
        <rect class="tree-sign" x="${x - 25}" y="204" width="50" height="30" rx="9"/><text class="tree-num" x="${x}" y="219" dy=".35em" text-anchor="middle">?</text>
        <rect x="${x - 40}" y="98" width="80" height="162" fill="transparent"/></g>`;
    });
    s += darkRect(0.32);
    stage.innerHTML = s;
    actors.innerHTML = hero(140, 270, 0.46, `${P}hero`);
    heroEl = svg.querySelector(`#${P}hero`);
    stage.querySelectorAll('.tree').forEach((g) => g.addEventListener('click', () => {
      const i = +g.dataset.idx;
      if (phase === 'find' && options[i] != null && !g.classList.contains('empty')) pick(options[i], g);
    }));
    story(w.signal ? t('nr.findSig') : t('nr.find'));
  }

  function drawFindGroups() {
    // the signal flashes: b groups of a lights, in the sky (same picture as the hint)
    const { xs, cell } = spreadGroups(q.b, [[24, 376]], 52);
    const { pts, dr } = dotGrid(q.a, Math.min(16, cell / 2 - 3));
    let g = xs.map((x) => `<g class="flash" transform="translate(${x.toFixed(1)} 50)"><circle r="${Math.min(18, cell / 2 - 1)}" class="flash-bg"/>
      ${pts.map((p) => `<circle class="sig on" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('')}</g>`).join('');
    g += caption(200, 82, tn('mech.nrCap', q.b, q), 22);
    groupsEl.innerHTML = g;
    retrigger(groupsEl, 'pop-in');
    stage.querySelectorAll('.tree-num').forEach((n, i) => { n.textContent = options[i]; });
  }

  // ── B · REACH ──
  function drawReach(second) {
    phase = 'reach';
    let s = `<rect x="-400" y="236" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += `<path d="M118 236 Q140 300 124 420 L300 420 Q284 300 302 236Z" fill="#0e2a3a"/><path d="M150 262 q10 -3 20 0 M232 284 q10 -3 20 0 M190 300 q10 -3 20 0" stroke="#6fd8ff" stroke-opacity=".35" stroke-width="2" fill="none"/>`;
    s += pine(-10, 250, 1.3) + pine(410, 250, 1.2);
    // owl tree far on the right, owl eyes glowing
    s += `<path d="M338 238 L346 90 L372 90 L382 238Z" fill="#5b3a1e"/><circle cx="360" cy="80" r="30" fill="#1f5a49"/>
      <ellipse cx="360" cy="140" rx="9" ry="11" fill="#1c1208"/>${emo(360, 142, 16, '🦉')}`;
    for (let k = 0; k < 4; k++) s += `<ellipse class="stone" id="${P}stone${k}" cx="${148 + k * 42}" cy="${262 + (k % 2) * 10}" rx="17" ry="7"/>`;
    s += darkRect(second ? 0.24 : 0.3);
    stage.innerHTML = s;
    actors.innerHTML = hero(70, 250, 0.5, `${P}hero`);
    heroEl = svg.querySelector(`#${P}hero`);
    story(second ? t('nr.cross2') : t('nr.found'));
  }

  function drawMushrooms() {
    lay = groupSlots(q.b, { x0: 16, x1: 328, y0: 72, y1: 210 }, 26);
    const r = lay.r;
    const { pts, dr } = dotGrid(q.a, r * 0.62);
    let g = caption(180, 52, t('mech.nrMushCap', { a: q.a }));
    lay.pts.forEach((c, k) => {
      g += `<g class="gt mush" data-k="${k}" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})">
        <circle class="hit" r="${r + 4}" fill="transparent"/><circle class="halo" r="${r * 1.5}" fill="url(#${P}glow)"/>
        <rect class="m-stem" x="${-r * 0.22}" y="${-r * 0.05}" width="${r * 0.44}" height="${r * 0.8}" rx="${r * 0.15}"/>
        <path class="m-cap" d="M${-r} ${r * 0.05} Q${-r} ${-r * 0.95} 0 ${-r * 0.95} Q${r} ${-r * 0.95} ${r} ${r * 0.05}Z"/>
        <g transform="translate(0 ${-r * 0.42})">${pts.map((p, i) => `<circle class="spot" style="--i:${i}" cx="${(p.x * 1.2).toFixed(1)}" cy="${(p.y * 0.8).toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('')}</g>
        <text class="nest-n" y="${r + 12}" text-anchor="middle"></text></g>`;
    });
    groupsEl.innerHTML = g;
    retrigger(groupsEl, 'pop-in');
  }

  // ── C · RESCUE ──
  function drawRescue() {
    phase = 'rescue';
    let s = `<rect x="-400" y="244" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += `<path d="M300 250 L318 40 L352 40 L372 250Z" fill="#5b3a1e"/><path d="M336 40 L352 40 L372 250 L352 250Z" fill="#000" opacity=".15"/>
      <circle cx="320" cy="22" r="34" fill="#1f5a49"/><circle cx="362" cy="14" r="30" fill="#1a4d3f"/>
      <path d="M318 70 L270 64" stroke="#5b3a1e" stroke-width="7" stroke-linecap="round"/>
      <g transform="translate(284 52)"><g id="${P}owl" class="npc wait">${emo(0, 0, 28, mission.npc.e)}</g></g>`;
    s += rock(30, 262, 0.9, T.stone, T.stoneDark) + pine(-14, 256, 1.2);
    s += darkRect(0.2);
    stage.innerHTML = s;
    actors.innerHTML = `<g id="${P}basket" class="basket"><path d="M-18 -4 L18 -4 L13 12 L-13 12Z" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="2.5"/>
      <path d="M-15 3 H15" stroke="${T.woodDark}" stroke-width="1.5" opacity=".6"/><g class="basket-lights"></g></g>` + hero(64, 270, 0.5, `${P}hero`);
    heroEl = svg.querySelector(`#${P}hero`);
    place(svg.querySelector(`#${P}basket`), 200, 258, 1);
    story(w.fireflies ? t('nr.helpers') : t('nr.helpersNew'));
  }

  function drawLanterns() {
    lay = groupSlots(q.b, { x0: 20, x1: 290, y0: 96, y1: 226 }, 24);
    const r = lay.r;
    const { pts, dr } = dotGrid(q.a, r * 0.6);
    let g = caption(150, 76, t('mech.nrLiftCap', { a: q.a }));
    lay.pts.forEach((c, k) => {
      g += `<g class="gt lant" data-k="${k}" transform="translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})">
        <circle class="hit" r="${r + 4}" fill="transparent"/><circle class="halo" r="${r * 1.5}" fill="url(#${P}glow)"/>
        <rect class="l-top" x="${-r * 0.35}" y="${-r * 0.95}" width="${r * 0.7}" height="${r * 0.18}" rx="2"/>
        <rect class="l-body" x="${-r * 0.7}" y="${-r * 0.8}" width="${r * 1.4}" height="${r * 1.55}" rx="${r * 0.45}"/>
        ${pts.map((p, i) => `<circle class="ff" style="--i:${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr.toFixed(1)}"/>`).join('')}
        <text class="nest-n" y="${r + 12}" text-anchor="middle"></text></g>`;
    });
    groupsEl.innerHTML = g;
    retrigger(groupsEl, 'pop-in');
  }

  // ── building the groups (B and C) ──
  function build(g) {
    if (!acting) return;
    g.classList.add('built');
    built += 1;
    grew(built);
    play(phase === 'rescue' ? 'firefly' : 'signal', built - 1);
    setTimeout(() => {
      g.classList.add('awake');
      g.querySelector('.nest-n').textContent = String(q.a);
      landed += 1;
      if (landed === q.b && acting) {
        acting = false;
        svg.classList.remove('acting');
        wait(380).then(ready);
      }
    }, 220);
  }
  const off = groupInput(svg, build);
  const nextUnbuilt = () => groupsEl.querySelector('.gt:not(.built)');

  async function countUp(sel) {
    const gs = [...groupsEl.querySelectorAll(sel)];
    const step = gs.length > 6 ? 90 : 140;
    const cap = groupsEl.querySelector('.caption');
    if (cap) cap.classList.add('fade-out');
    for (let k = 0; k < gs.length; k++) {
      const n = gs[k].querySelector('.nest-n');
      if (n) n.textContent = String(q.a * (k + 1));
      retrigger(gs[k], 'pulse');
      play('count', k);
      await wait(step);
    }
  }

  async function fadeTo(draw) {
    const veil = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    Object.entries({ x: -400, y: -300, width: 1200, height: 900, fill: '#06102a', opacity: 0 }).forEach(([k, v]) => veil.setAttribute(k, v));
    svg.appendChild(veil);
    await tween(280, (e) => veil.setAttribute('opacity', String(e)));
    groupsEl.innerHTML = '';
    draw();
    await tween(320, (e) => veil.setAttribute('opacity', String(1 - e)));
    veil.remove();
  }

  drawFind();

  return {
    answerKind: 'choices', skin: 'glow', optionCount: 3, floatAt: 0.3, icon: '🦉',
    action: true,
    actsOn: (step) => step >= 1,
    kindFor: (step) => (step >= 3 ? 'keypad' : 'choices'),
    optionsFor: (step) => (step === 0 ? 3 : 4),
    get actionInstruction() { return t(phase === 'rescue' ? 'mech.nrLiftAct' : 'mech.nrMushAct'); },
    get actionHow() { return t(phase === 'rescue' ? 'mech.nrLiftHow' : 'mech.nrMushHow'); },
    get actionNudge() { return t(phase === 'rescue' ? 'mech.nrLiftNudge' : 'mech.nrMushNudge'); },
    get instruction() { return t(phase === 'find' ? 'mech.nrFind' : phase === 'rescue' ? 'mech.nrLift' : 'mech.nrMush'); },
    correctLine: tList('mech.nrOk'),
    setQuestion(question, i, opts) {
      q = question;
      options = opts || [];
      built = 0; landed = 0;
      if (i === 0) { drawFindGroups(); return; }
      acting = true;
      svg.classList.add('acting');
      if (i >= 3) drawLanterns(); else drawMushrooms();
    },
    actNext() { const g = nextUnbuilt(); if (g) build(g); },
    actionHint() {
      const g = nextUnbuilt();
      if (!g) return;
      const c = lay.pts[+g.dataset.k];
      handCue(svg, c.x + 6, c.y + lay.r + 16);
      groupsEl.querySelectorAll('.gt:not(.built)').forEach((n) => retrigger(n, 'nudge'));
    },
    onHint(h) {
      if (h.level > 2) return;
      [...groupsEl.querySelectorAll('.flash, .gt')].forEach((n, k) => setTimeout(() => retrigger(n, 'pulse'), k * 160));
    },
    async onCorrect(i, fromEl, value) {
      if (i === 0) {
        const idx = options.indexOf(value);
        const tree = svg.querySelector(`#${P}tree${idx}`);
        tree.querySelector('.who').innerHTML = emo(0, 0, 18, '🦉');
        tree.classList.add('found');
        play('hoot');
        svgBurst(svg, TREES[idx], 150, { chars: ['✨'], n: 3 });
        await wait(900);
        await fadeTo(() => drawReach(false));
        return;
      }
      if (i <= 2) {
        await countUp('.mush');
        // the mushrooms' light flows onto the stepping stones, then the hero hops across
        svg.querySelectorAll('.stone').forEach((st, k) => setTimeout(() => st.classList.add('lit'), k * 110));
        play('lamp');
        await wait(520);
        groupsEl.classList.add('fade-out');
        for (let k = 0; k < 4; k++) {
          await moveG(heroEl, 148 + k * 42, 258 + (k % 2) * 10, 260, { hop: 22 });
          play('step');
        }
        await moveG(heroEl, 330, 244, 320, { hop: 14 });
        groupsEl.classList.remove('fade-out');
        await fadeTo(() => (i === 1 ? drawReach(true) : drawRescue()));
        return;
      }
      // i === 3: the lanterns gather on the basket and lift it up to Owl
      await countUp('.lant');
      const basket = svg.querySelector(`#${P}basket`);
      basket.querySelector('.basket-lights').innerHTML = [-14, -5, 5, 14].map((x, k) => `<circle cx="${x}" cy="${-20 - (k % 2) * 6}" r="7" fill="#ffd84d" opacity=".9"/><line x1="${x}" y1="${-14 - (k % 2) * 6}" x2="${x * 0.6}" y2="-4" stroke="#fff" stroke-width="1"/>`).join('');
      groupsEl.classList.add('fade-out');
      play('whoosh');
      await moveG(basket, 280, 84, 1100);
      const owl = svg.querySelector(`#${P}owl`);
      owl.classList.remove('wait');
      owl.parentNode.setAttribute('transform', 'translate(280 70)');
      play('hoot');
      await wait(300);
      groupsEl.innerHTML = '';
      groupsEl.classList.remove('fade-out');
    },
    async onWrong(value) {
      if (phase === 'find') {
        const idx = options.indexOf(value);
        const tree = svg.querySelector(`#${P}tree${idx}`);
        if (tree) { tree.classList.add('empty'); tree.querySelector('.who').innerHTML = emo(0, 0, 16, '🍂'); retrigger(tree, 'wobble'); }
        return;
      }
      retrigger(groupsEl, 'flicker');
    },
    async onComplete() {
      const basket = svg.querySelector(`#${P}basket`);
      const owlWrap = svg.querySelector(`#${P}owl`).parentNode;
      await Promise.all([
        moveG(basket, 112, 258, 1100),
        tween(1100, (e) => owlWrap.setAttribute('transform', `translate(${280 + (112 - 280) * e} ${70 + (240 - 70) * e})`)),
      ]);
      svg.querySelector(`#${P}owl`).classList.add('cheer');
      const d = svg.querySelector('.nr-dark');
      if (d) tween(600, (e) => d.setAttribute('opacity', String(0.2 * (1 - e))));
      svgBurst(svg, 120, 200, { chars: ['💛', '✨', '🦉'], n: 5 });
      play('reveal');
      await wait(1000);
    },
    destroy() { off(); clearTimeout(story.t); },
  };
}
