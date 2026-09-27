// Mechanic A — UNLOCK: a combination lock. Typing the right product opens one lock; all locks open the gate.
import { THEMES, svgWrap, defs, sceneBackdrop, bip, emo, fence, roundTree, pine, mushroom, crystal, rock, flower, starPath } from '../art.js';
import { tween, wait, svgBurst, retrigger } from '../fx.js';
import { play } from '../../audio.js';

const RUNES = [
  (x, y) => `<path d="${starPath(x, y, 8)}"/>`,
  (x, y) => `<path d="M${x} ${y - 9} L${x + 8} ${y} L${x} ${y + 9} L${x - 8} ${y}Z"/>`,
  (x, y) => `<path d="M${x} ${y - 9} L${x + 9} ${y + 7} L${x - 9} ${y + 7}Z"/>`,
  (x, y) => `<circle cx="${x}" cy="${y}" r="7.5"/>`,
  (x, y) => `<path d="M${x - 8} ${y - 3} h16 v6 h-16z M${x - 3} ${y - 8} h6 v16 h-6z"/>`,
];

export function create({ root, mission, zone, P }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  const kind = zone.id; // village gate / forest stone door / cove chest
  const ground = 250;
  const lockY = kind === 'cove' ? 196 : 164;
  const spacing = kind === 'cove' ? 36 : 38;
  const lx = (i) => 200 + (i - (N - 1) / 2) * spacing;

  let s = defs(P, T) + sceneBackdrop(zone.id, P, T);
  let doors = '';
  let behind = '';

  if (kind === 'village') {
    s += `<rect x="-400" y="${ground - 4}" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += fence(-400, 108, ground) + fence(292, 800, ground) + roundTree(40, ground - 2, 0.9, T.leaf, T.leafDark) + roundTree(372, ground - 2, 1, T.leaf, T.leafDark) + flower(70, ground + 12) + flower(340, ground + 16, '#ffd23f');
    behind = `<rect x="112" y="92" width="176" height="${ground - 92}" fill="#bfe8a3"/><ellipse cx="200" cy="${ground}" rx="80" ry="14" fill="${T.groundDark}" opacity=".4"/>`;
    const door = (x, flip) => {
      let d = `<rect x="${x}" y="94" width="88" height="${ground - 96}" rx="4" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="3"/>`;
      for (let k = 1; k < 4; k++) d += `<line x1="${x + k * 22}" y1="96" x2="${x + k * 22}" y2="${ground - 4}" stroke="${T.woodDark}" stroke-width="2" opacity=".5"/>`;
      d += `<path d="M${x + (flip ? 84 : 4)} ${ground - 8} L${x + (flip ? 4 : 84)} 100" stroke="${T.woodDark}" stroke-width="7" opacity=".55"/>`;
      return d;
    };
    doors = `<g id="${P}doorL">${door(112, false)}</g><g id="${P}doorR">${door(200, true)}</g>
      <rect x="104" y="80" width="12" height="${ground - 78}" rx="3" fill="${T.woodDark}"/><rect x="284" y="80" width="12" height="${ground - 78}" rx="3" fill="${T.woodDark}"/>`;
  } else if (kind === 'forest') {
    s += `<rect x="-400" y="${ground - 4}" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += `<path d="M-400 ${ground} L-400 60 Q-100 30 60 50 Q200 10 340 50 Q520 30 800 60 L800 ${ground}Z" fill="${T.stoneDark}"/>`;
    s += `<path d="M-400 ${ground} L-400 90 Q-120 70 70 80 Q200 50 330 80 Q520 70 800 90 L800 ${ground}Z" fill="${T.stone}" opacity=".6"/>`;
    s += pine(20, ground, 1.2) + pine(385, ground, 1.3) + mushroom(70, ground + 6, 1.1) + mushroom(330, ground + 8, 0.9);
    s += `<path d="M110 ${ground} L110 130 Q110 70 200 70 Q290 70 290 130 L290 ${ground}Z" fill="#1c2f2c"/>`;
    behind = `<path d="M114 ${ground} L114 132 Q114 76 200 76 Q286 76 286 132 L286 ${ground}Z" fill="#2c5a45"/><circle cx="200" cy="170" r="60" fill="url(#${P}glow)" opacity=".5"/>`;
    const half = (x, w) => `<rect x="${x}" y="74" width="${w}" height="${ground - 74}" fill="${T.stone}"/>`;
    doors = `<clipPath id="${P}arch"><path d="M114 ${ground} L114 132 Q114 76 200 76 Q286 76 286 132 L286 ${ground}Z"/></clipPath>
      <g clip-path="url(#${P}arch)"><g id="${P}doorL">${half(114, 86)}<path d="M130 110 h50 M124 210 h60" stroke="${T.stoneDark}" stroke-width="3"/></g>
      <g id="${P}doorR">${half(200, 86)}<path d="M216 120 h54 M210 220 h60" stroke="${T.stoneDark}" stroke-width="3"/></g></g>
      <path d="M110 ${ground} L110 130 Q110 70 200 70 Q290 70 290 130 L290 ${ground}" stroke="#4a5e57" stroke-width="8" fill="none"/>`;
  } else {
    // crystal cave with a treasure chest
    s += `<rect x="-400" y="${ground - 10}" width="1200" height="400" fill="${T.ground}"/><ellipse cx="200" cy="${ground - 6}" rx="190" ry="16" fill="${T.groundDark}" opacity=".5"/>`;
    s += `<path d="M-400 -300 L800 -300 L800 ${ground} L360 ${ground} Q380 40 200 36 Q20 40 40 ${ground} L-400 ${ground}Z" fill="#35546b"/>`;
    s += `<path d="M-400 -300 L800 -300 L800 ${ground} L380 ${ground} Q400 20 200 18 Q0 20 20 ${ground} L-400 ${ground}Z" fill="#23394d"/>`;
    s += crystal(50, ground - 4, 1.1, T.crystal, T.crystal2) + crystal(356, ground - 4, 1.2, T.crystal2, T.crystal) + crystal(20, 120, 0.5) + rock(320, ground - 2, 0.7, T.stone, T.stoneDark);
    behind = `<g id="${P}treasure" opacity="0"><circle cx="200" cy="140" r="90" fill="url(#${P}glow)"/>
      ${[-26, -8, 12, 28].map((x, i) => `<circle cx="${200 + x}" cy="${150 - (i % 2) * 8}" r="9" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/>`).join('')}
      ${emo(188, 128, 22, '💎')}${emo(216, 132, 20, '👑')}</g>`;
    doors = `<rect x="118" y="148" width="164" height="${ground - 152}" rx="10" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="4"/>
      <rect x="118" y="168" width="164" height="10" fill="${T.woodDark}" opacity=".35"/>
      <rect x="134" y="148" width="12" height="${ground - 152}" fill="#e0a800"/><rect x="254" y="148" width="12" height="${ground - 152}" fill="#e0a800"/>
      <g id="${P}lid"><path d="M118 150 L118 128 Q118 100 200 100 Q282 100 282 128 L282 150Z" fill="${T.wood}" stroke="${T.woodDark}" stroke-width="4"/>
      <rect x="134" y="104" width="12" height="46" fill="#e0a800"/><rect x="254" y="104" width="12" height="46" fill="#e0a800"/></g>`;
  }

  // locks plate
  const plateW = N * spacing + 18;
  let locks = `<rect x="${200 - plateW / 2}" y="${lockY - 26}" width="${plateW}" height="52" rx="16" fill="${kind === 'forest' ? '#51665e' : kind === 'cove' ? '#2e3f5c' : '#4a4f5c'}" stroke="#263553" stroke-width="3"/>`;
  for (let i = 0; i < N; i++) {
    const x = lx(i);
    if (kind === 'forest') {
      locks += `<g class="lock rune" id="${P}lock${i}"><circle class="lock-ring" cx="${x}" cy="${lockY}" r="15"/>
        <g class="rune-glyph">${RUNES[i % RUNES.length](x, lockY)}</g></g>`;
    } else if (kind === 'cove') {
      locks += `<g class="lock gem" id="${P}lock${i}"><circle class="lock-ring" cx="${x}" cy="${lockY}" r="15"/>
        <path class="gem-body" d="M${x} ${lockY - 10} L${x + 9} ${lockY - 2} L${x} ${lockY + 11} L${x - 9} ${lockY - 2}Z"/></g>`;
    } else {
      locks += `<g class="lock pad" id="${P}lock${i}">
        <path class="shackle" d="M${x - 7} ${lockY - 4} v-7 a7 7 0 0 1 14 0 v7" fill="none" stroke-width="4" stroke-linecap="round"/>
        <rect class="lock-body" x="${x - 12}" y="${lockY - 5}" width="24" height="20" rx="5"/>
        <circle class="keyhole" cx="${x}" cy="${lockY + 4}" r="3"/></g>`;
    }
  }

  const npcX = kind === 'cove' ? 318 : 200;
  const npcY = kind === 'cove' ? ground - 22 : ground - 30;
  s += behind;
  if (kind !== 'cove') s += `<g transform="translate(${npcX} ${npcY})"><g id="${P}npc" class="npc wait">${emo(0, 0, 44, mission.npc.e)}</g></g>`;
  s += doors + `<g id="${P}locks">${locks}</g>`;
  if (kind === 'cove') s += `<g transform="translate(${npcX} ${npcY})"><g id="${P}npc" class="npc hidden-npc">${emo(0, 0, 40, mission.npc.e)}</g></g>`;
  s += bip(kind === 'cove' ? 80 : 60, ground + 4, 0.6, `${P}hero`);

  root.innerHTML = svgWrap(s, { cls: 'scene-svg', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const lock = (i) => svg.querySelector(`#${P}lock${i}`);

  return {
    answerKind: 'keypad', icon: kind === 'forest' ? '🔮' : kind === 'cove' ? '💎' : '🔒',
    instruction: 'Bấm số để mở khóa!',
    correctLine: ['Mở được rồi!', 'Cạch! Mở rồi!', 'Tuyệt!'],
    setQuestion(q, i) {
      svg.querySelectorAll('.lock.target').forEach((el) => el.classList.remove('target'));
      lock(i).classList.add('target');
    },
    async onCorrect(i) {
      const l = lock(i);
      l.classList.remove('target');
      l.classList.add('solved');
      play('unlock');
      svgBurst(svg, lx(i), lockY - 20, { chars: ['✨'], n: 2 });
      await wait(450);
    },
    async onWrong() {
      const l = svg.querySelector('.lock.target');
      if (l) retrigger(l, 'wobble');
    },
    async onComplete() {
      play('whoosh');
      svg.querySelector(`#${P}locks`).classList.add('fade-out');
      if (kind === 'cove') {
        const lid = svg.querySelector(`#${P}lid`);
        svg.querySelector(`#${P}treasure`).setAttribute('opacity', '1');
        await tween(650, (k) => lid.setAttribute('transform', `translate(0 ${-58 * k}) rotate(${-14 * k} 118 150)`));
        const npc = svg.querySelector(`#${P}npc`);
        npc.classList.replace('hidden-npc', 'cheer');
      } else {
        const L = svg.querySelector(`#${P}doorL`), R = svg.querySelector(`#${P}doorR`);
        if (kind === 'forest') {
          await tween(700, (k) => { L.setAttribute('transform', `translate(${-84 * k} 0)`); R.setAttribute('transform', `translate(${84 * k} 0)`); });
        } else {
          await tween(650, (k) => {
            L.setAttribute('transform', `translate(112 0) scale(${1 - 0.82 * k} 1) translate(-112 0)`);
            R.setAttribute('transform', `translate(288 0) scale(${1 - 0.82 * k} 1) translate(-288 0)`);
          });
        }
        svg.querySelector(`#${P}npc`).classList.replace('wait', 'cheer');
      }
      svgBurst(svg, npcX, npcY - 40);
      await wait(800);
    },
    destroy() {},
  };
}
