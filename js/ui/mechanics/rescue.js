// Mechanic D — RESCUE: a friend is stuck down low. Each correct balloon (lantern / bubble) ties on and
// lifts them one level. Wrong balloons just drift away — nothing is lost.
import { THEMES, svgWrap, defs, sceneBackdrop, hero, emo, roundTree, pine, mushroom, crystal, rock, flower, fence } from '../art.js';
import { moveG, flyTo, wait, svgBurst, place } from '../fx.js';
import { play } from '../../audio.js';
import { t, tList } from '../../i18n.js';

const SLOTS = [[-24, -86], [24, -86], [0, -104], [-30, -120], [30, -120], [0, -140]];

export function balloonShape(kind, color) {
  if (kind === 'bubble') {
    return `<circle cx="0" cy="0" r="17" fill="${color}" fill-opacity=".28" stroke="#fff" stroke-width="2.5"/><ellipse cx="-6" cy="-7" rx="5" ry="3.5" fill="#fff" opacity=".85" transform="rotate(-30 -6 -7)"/>`;
  }
  if (kind === 'lantern') {
    return `<circle r="22" fill="#ffd84d" opacity=".25"/><rect x="-13" y="-17" width="26" height="32" rx="10" fill="${color}" stroke="#7a3b12" stroke-width="2"/><rect x="-7" y="-21" width="14" height="5" rx="2" fill="#7a3b12"/><rect x="-7" y="14" width="14" height="4" rx="2" fill="#7a3b12"/><ellipse cx="0" cy="-2" rx="6" ry="9" fill="#fff5b8" opacity=".65"/>`;
  }
  return `<ellipse cx="0" cy="0" rx="15" ry="18" fill="${color}"/><path d="M-3 17 L3 17 L0 22Z" fill="${color}"/><ellipse cx="-5" cy="-7" rx="4" ry="6" fill="#fff" opacity=".45"/>`;
}

export function create({ root, mission, zone, P }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  const kind = zone.id === 'cove' ? 'bubble' : zone.id === 'forest' ? 'lantern' : 'balloon';
  const cove = zone.id === 'cove';
  const rimY = cove ? 999 : zone.id === 'forest' ? 214 : 208;
  const yStart = cove ? 256 : 262;
  const yEnd = cove ? 168 : 150;
  const levelY = (k) => yStart - ((yStart - yEnd) * k) / N;

  let s = defs(P, T) + sceneBackdrop(zone.id, P, T);
  if (zone.id === 'village') {
    s += `<rect x="-400" y="196" width="1200" height="400" fill="url(#${P}ground)"/>` + fence(-400, 110, 200) + fence(290, 800, 200);
    s += roundTree(30, 206, 1, T.leaf, T.leafDark) + roundTree(376, 210, 1.1, T.leaf, T.leafDark) + flower(330, 270) + flower(60, 280, '#ffd23f');
    s += `<ellipse cx="200" cy="${rimY}" rx="62" ry="14" fill="#1f2c40"/>`;
  } else if (zone.id === 'forest') {
    s += `<rect x="-400" y="190" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += pine(10, 214, 1.3) + pine(392, 220, 1.4) + mushroom(84, 262, 1.2) + mushroom(330, 268, 1);
    s += `<ellipse cx="200" cy="${rimY}" rx="70" ry="17" fill="#0e1f1a"/><path d="M134 ${rimY} q20 18 40 4 M230 ${rimY + 6} q20 10 34 -4" stroke="#5c3b1c" stroke-width="4" fill="none"/>`;
  } else {
    // under the sea: seabed + seaweed + crystals, surface line at the top
    s += `<rect x="-400" y="150" width="1200" height="400" fill="url(#${P}water)"/><rect x="-400" y="150" width="1200" height="400" fill="#063f5c" opacity=".25"/>`;
    s += `<path d="M-400 272 Q-100 256 100 270 Q260 280 420 264 Q600 256 800 270 L800 600 L-400 600Z" fill="${T.ground}"/>`;
    s += `<path d="M40 272 q-10 -20 0 -40 q10 -20 0 -40" stroke="#2fb36e" stroke-width="6" fill="none" stroke-linecap="round" class="sway"/><path d="M360 270 q10 -24 0 -48 q-10 -18 0 -36" stroke="#39c27a" stroke-width="6" fill="none" stroke-linecap="round" class="sway"/>`;
    s += crystal(90, 276, 0.8, T.crystal, T.crystal2) + crystal(318, 276, 0.9, T.crystal2, T.crystal) + emo(330, 200, 18, '🐟') + emo(60, 186, 14, '🐠');
  }

  // the stuck friend in a basket / cage + balloon cluster
  let cluster = '';
  SLOTS.slice(0, N).forEach(([x, y], i) => {
    cluster += `<line class="string" id="${P}str${i}" x1="0" y1="-8" x2="${x}" y2="${y + 18}" stroke="#fff" stroke-width="1.5" opacity="0"/>`;
  });
  SLOTS.slice(0, N).forEach(([x, y], i) => {
    cluster += `<g transform="translate(${x} ${y})"><g class="tied" id="${P}bal${i}" opacity="0"></g><rect id="${P}anchor${i}" x="-10" y="-10" width="20" height="20" fill="transparent"/></g>`;
  });
  const carrier = cove
    ? `<rect x="-26" y="-34" width="52" height="42" rx="6" fill="none" stroke="#5a6b80" stroke-width="3"/>${emo(0, -12, 34, mission.npc.e)}
       <g id="${P}bars">${[-16, -6, 4, 14].map((x) => `<rect x="${x}" y="-34" width="3" height="42" fill="#5a6b80"/>`).join('')}</g><rect x="-28" y="6" width="56" height="6" rx="3" fill="#43536b"/>`
    : `${emo(0, -14, 34, mission.npc.e)}<path d="M-24 -6 L24 -6 L18 16 L-18 16Z" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="2.5"/>
       <path d="M-20 2 H20 M-19 9 H19" stroke="${T.woodDark}" stroke-width="1.5" opacity=".6"/>`;
  const clip = cove ? '' : `<clipPath id="${P}clip"><rect x="-400" y="-300" width="1200" height="${rimY + 300 + 4}"/></clipPath>`;
  s += `${clip}<g ${cove ? '' : `clip-path="url(#${P}clip)"`}><g id="${P}carrier"><g transform="scale(${cove ? 1.25 : 1.1})"><g class="npc-inner" id="${P}npc">${carrier}</g></g>${cluster}</g></g>`;

  if (zone.id === 'village') {
    // well front wall (drawn over the basket)
    s += `<path d="M138 ${rimY} L138 262 Q200 282 262 262 L262 ${rimY} Q200 ${rimY + 16} 138 ${rimY}Z" fill="${T.stone}"/>`;
    s += `<path d="M138 232 Q200 250 262 232 M170 ${rimY + 12} v22 M230 ${rimY + 12} v22 M200 ${rimY + 36} v24" stroke="${T.stoneDark}" stroke-width="2.5" fill="none"/>`;
    s += `<path d="M138 ${rimY} Q200 ${rimY + 16} 262 ${rimY}" stroke="#e7dfd2" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    s += hero(84, 266, 0.6, `${P}hero`);
  } else if (zone.id === 'forest') {
    s += `<path d="M130 ${rimY} Q200 ${rimY + 22} 270 ${rimY}" stroke="${T.groundDark}" stroke-width="6" fill="none"/>`;
    s += rock(128, rimY + 10, 0.6, T.stone, T.stoneDark) + rock(276, rimY + 12, 0.7, T.stone, T.stoneDark);
    s += hero(78, 264, 0.6, `${P}hero`);
  } else {
    s += `<g transform="translate(76 150)"><path d="M-30 -6 L30 -6 L22 10 L-22 10Z" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="3"/>${hero(0, -4, 0.5, `${P}hero`)}</g>`;
    s += `<path class="wave-line" d="M-400 150 q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#fff" stroke-opacity=".8" stroke-width="3" fill="none"/>`;
  }

  root.innerHTML = svgWrap(s, { cls: 'scene-svg', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const carrierEl = svg.querySelector(`#${P}carrier`);
  place(carrierEl, 200, yStart);

  return {
    answerKind: 'choices', skin: kind, optionCount: 4,
    icon: kind === 'bubble' ? '🌊' : kind === 'lantern' ? '🏮' : '🎈',
    instruction: t(`mech.${kind}`),
    correctLine: tList('mech.rescueOk'),
    setQuestion(q, i) {
      svg.querySelectorAll('.tied.target').forEach((el) => el.classList.remove('target'));
      svg.querySelector(`#${P}anchor${i}`).classList.add('target');
    },
    async onCorrect(i, fromEl) {
      const color = (fromEl && fromEl.dataset.color) || '#ff6b6b';
      await flyTo(fromEl, svg.querySelector(`#${P}anchor${i}`), { scaleTo: 0.55, lift: 20 });
      const b = svg.querySelector(`#${P}bal${i}`);
      b.innerHTML = balloonShape(kind, color);
      b.setAttribute('opacity', '1');
      b.classList.add('pop-in');
      svg.querySelector(`#${P}str${i}`).setAttribute('opacity', '0.8');
      play(cove ? 'pop' : 'whoosh');
      await moveG(carrierEl, 200, levelY(i + 1), 560);
    },
    async onWrong() {
      play('deflate');
    },
    async onComplete() {
      await moveG(carrierEl, 200, yEnd - 26, 600);
      if (cove) svg.querySelector(`#${P}bars`).style.opacity = '0';
      svg.querySelector(`#${P}npc`).classList.add('cheer');
      svgBurst(svg, 200, yEnd - 60);
      play('reveal');
      await wait(900);
    },
    destroy() {},
  };
}
