// Mechanic B — REPAIR: each bridge section needs a × b planks, delivered as b bundles of a planks
// (a × b = "a được lấy b lần", same picture as the hint). A correct answer sends exactly those bundles
// into the gap, counting up as they land (a, 2a, 3a …), and the section is built with the total on it.
import { THEMES, svgWrap, defs, sceneBackdrop, hero as heroArt, emo, roundTree, house, pine, mushroom, rock, cloud, palm, crystal, flower, spreadGroups } from '../art.js';
import { moveG, wait, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';
import { t, tn, tList } from '../../i18n.js';

export function create({ root, mission, zone, P }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  const gapL = 104, gapR = 296, deckY = 196;
  const slotW = (gapR - gapL) / N;
  const forest = zone.id === 'forest', cove = zone.id === 'cove';

  let s = defs(P, T) + sceneBackdrop(zone.id, P, T);
  // below the bridge: river / chasm / sea
  if (forest) {
    s += `<rect x="${gapL - 10}" y="${deckY - 6}" width="${gapR - gapL + 20}" height="400" fill="url(#${P}chasm)"/>`;
  } else if (!cove) {
    s += `<rect x="-400" y="${deckY + 8}" width="1200" height="400" fill="url(#${P}water)"/>`;
    s += `<path class="wave-line" d="M-40 ${deckY + 40} q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" fill="none"/>`;
  }
  // banks
  const bank = (x1, x2, side) => {
    const edge = side === 'L' ? x2 : x1;
    const pts = side === 'L'
      ? `M-400 ${deckY + 2} L${edge} ${deckY + 2} L${edge - 8} ${deckY + 120} L-400 ${deckY + 200}Z`
      : `M${edge} ${deckY + 2} L800 ${deckY + 2} L800 ${deckY + 200} L${edge + 8} ${deckY + 120}Z`;
    const top = cove ? T.ground : T.ground;
    return `<path d="${pts}" fill="${cove ? T.woodDark : forest ? '#5a4a3a' : '#a0703f'}"/>
      <rect x="${side === 'L' ? -400 : edge}" y="${deckY - 8}" width="${side === 'L' ? edge + 400 : 800 - edge}" height="14" rx="4" fill="${top}"/>`;
  };
  if (cove) {
    // pier posts in the sea
    for (let i = 0; i <= N; i++) s += `<rect x="${gapL + i * slotW - 4}" y="${deckY}" width="8" height="140" fill="${T.woodDark}"/>`;
    s += `<rect x="-400" y="${deckY + 8}" width="1200" height="400" fill="url(#${P}water)" opacity=".75"/>`;
  }
  s += bank(-400, gapL, 'L') + bank(gapR, 800, 'R');

  // scenery on banks
  if (zone.id === 'village') {
    s += roundTree(20, deckY - 6, 0.9, T.leaf, T.leafDark) + house(370, deckY - 6, 0.9) + flower(60, deckY - 2) + flower(330, deckY - 1, '#ffd23f');
  } else if (forest) {
    s += pine(10, deckY - 6, 1.1) + pine(390, deckY - 6, 1.2) + mushroom(80, deckY - 4, 1) + mushroom(318, deckY - 3, 0.8);
    // vine ropes
    s += `<path d="M${gapL} ${deckY - 46} Q200 ${deckY - 20} ${gapR} ${deckY - 46}" stroke="#4f8a3a" stroke-width="4" fill="none"/>`;
  } else {
    s += palm(22, deckY - 6, 0.9) + crystal(380, deckY - 6, 0.8, T.crystal, T.crystal2) + rock(330, deckY - 4, 0.6, T.stone, T.stoneDark);
  }
  // posts + rope rail
  s += `<rect x="${gapL - 6}" y="${deckY - 48}" width="10" height="56" rx="3" fill="${T.woodDark}"/><rect x="${gapR - 4}" y="${deckY - 48}" width="10" height="56" rx="3" fill="${T.woodDark}"/>`;
  if (!forest) s += `<path d="M${gapL} ${deckY - 44} Q200 ${deckY - 18} ${gapR} ${deckY - 44}" stroke="${T.woodDark}" stroke-width="3" fill="none" stroke-dasharray="2 5" stroke-linecap="round"/>`;

  // slots
  for (let i = 0; i < N; i++) {
    const x = gapL + i * slotW + 2;
    s += `<g class="slot" id="${P}slot${i}">
      <rect class="slot-empty" x="${x}" y="${deckY - 6}" width="${slotW - 4}" height="14" rx="4"/>
      <g class="plank" opacity="0"><rect x="${x}" y="${deckY - 7}" width="${slotW - 4}" height="16" rx="4" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="2"/>
      <circle cx="${x + 5}" cy="${deckY + 1}" r="1.6" fill="${T.woodDark}"/><circle cx="${x + slotW - 9}" cy="${deckY + 1}" r="1.6" fill="${T.woodDark}"/></g>
      <text class="plank-num" x="${x + (slotW - 4) / 2}" y="${deckY + 1}" dy=".35em" text-anchor="middle"></text>
      <text class="slot-q" x="${x + (slotW - 4) / 2}" y="${deckY - 18}" text-anchor="middle">?</text></g>`;
  }
  // NPC waiting on the far bank + hero
  s += `<g transform="translate(346 ${deckY - 26})"><g id="${P}npc" class="npc wait">${emo(0, 0, 42, mission.npc.e)}</g></g>`;
  s += `<g transform="translate(346 ${deckY - 64})"><g class="call-bubble" id="${P}call"><rect x="-16" y="-14" width="32" height="24" rx="10" fill="#fff"/><text x="0" y="3" text-anchor="middle" font-size="16" font-weight="800" fill="#ff7a2a">!</text></g></g>`;
  s += heroArt(58, deckY - 2, 0.62, `${P}hero`);
  // supply of plank bundles for the current section (filled per question)
  s += `<g id="${P}supply" class="supply"></g>`;
  if (zone.id === 'village') s += cloud(200, 20, 0.5, 0.7);

  root.innerHTML = svgWrap(s, { cls: 'scene-svg', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const hero = svg.querySelector(`#${P}hero`);
  const slot = (i) => svg.querySelector(`#${P}slot${i}`);
  const supply = svg.querySelector(`#${P}supply`);
  const baseY = 126;   // bundles stand on this line, above the rope rail and the hero's head
  let cur = null;

  // b bundles × a planks, with a short caption; the target section shows "?".
  function drawSupply(q) {
    const { xs, cell } = spreadGroups(q.b, [[30, 370]], 62);
    const pw = Math.min(38, cell - 7);
    const ph = 6, gap = 1.8;
    let g = `<g class="caption" transform="translate(200 ${baseY - q.a * (ph + gap) - 16})"><rect x="-80" y="-12" width="160" height="24" rx="12"/>
      <text text-anchor="middle" dy=".35em">${tn('mech.repairCap', q.b, q)}</text></g>`;
    xs.forEach((x, k) => {
      let planks = '';
      for (let i = 0; i < q.a; i++) {
        planks += `<rect x="${-pw / 2}" y="${-(i + 1) * (ph + gap)}" width="${pw}" height="${ph}" rx="1.8" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="1.1"/>`;
      }
      const h = q.a * (ph + gap);
      planks += `<rect x="${-pw / 4 - 1}" y="${-h - 1}" width="2.4" height="${h + 1}" fill="#6b3f1a" opacity=".75"/><rect x="${pw / 4 - 1}" y="${-h - 1}" width="2.4" height="${h + 1}" fill="#6b3f1a" opacity=".75"/>`;
      g += `<g class="bundle" style="--k:${k}" transform="translate(${x} ${baseY})" data-x="${x}" data-y="${baseY}" data-s="1">${planks}</g>`;
    });
    supply.innerHTML = g;
  }

  return {
    answerKind: 'choices', skin: 'plank', optionCount: 3, floatAt: 0.8,
    icon: '🔨', instruction: t('mech.repair'),
    correctLine: tList('mech.repairOk'),
    setQuestion(q, i) {
      cur = q;
      svg.querySelectorAll('.slot.target').forEach((el) => el.classList.remove('target'));
      slot(i).classList.add('target');
      drawSupply(q);
    },
    async onCorrect(i) {
      const sl = slot(i);
      const q = cur;
      const tx = gapL + slotW * (i + 0.5);
      const label = sl.querySelector('.slot-q');
      supply.querySelector('.caption').classList.add('fade-out');
      // Bundles drop into the gap one after another; the section counts up a, 2a, 3a …
      const bundles = [...supply.querySelectorAll('.bundle')];
      const step = bundles.length > 6 ? 70 : 110;
      await Promise.all(bundles.map((b, k) => wait(k * step).then(() => moveG(b, tx, deckY + 2, 340, { hop: 26, scale: 0.35 })).then(() => {
        b.style.opacity = '0';
        label.textContent = String(q.a * (k + 1));
        retrigger(label, 'tick');
        play('count', k);
      })));
      sl.classList.remove('target');
      sl.classList.add('filled');
      sl.querySelector('.plank').setAttribute('opacity', '1');
      sl.querySelector('.plank-num').textContent = String(q.answer);
      supply.innerHTML = '';
      play('place');
      await moveG(hero, gapL + slotW * (i + 0.5), deckY - 4, 420, { hop: 16 });
      play('step');
    },
    async onWrong() {
      const sl = svg.querySelector('.slot.target');
      if (sl) retrigger(sl, 'wobble');
      retrigger(supply, 'wobble');   // nudge the eye back to the bundles: count them!
    },
    async onComplete() {
      await moveG(hero, 318, deckY - 4, 500, { hop: 12 });
      svg.querySelector(`#${P}call`).style.display = 'none';
      svg.querySelector(`#${P}npc`).classList.replace('wait', 'cheer');
      svgBurst(svg, 346, deckY - 70);
      await wait(700);
    },
    destroy() {},
  };
}
