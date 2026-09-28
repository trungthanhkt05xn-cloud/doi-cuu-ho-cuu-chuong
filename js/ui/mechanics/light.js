// Mechanic E — LIGHT / POWER: night has fallen. Each lamp needs a × b little bulbs, hung as b clusters
// of a bulbs (a × b = "a được lấy b lần", same picture as the hint). A correct answer lights exactly
// those clusters one by one (a, 2a, 3a …), then powers the lamp — the whole scene brightens step by step.
import { THEMES, svgWrap, defs, sceneBackdrop, hero, emo, house, pine, roundTree, rock, crystal, lighthouse, spreadGroups } from '../art.js';
import { wait, svgBurst, tween, retrigger } from '../fx.js';
import { play } from '../../audio.js';

export function create({ root, mission, zone, P }) {
  const T = THEMES[zone.id];
  const N = mission.steps;
  const keypad = mission.answer === 'keypad';
  const DARK = 0.66;
  let s = defs(P, T) + sceneBackdrop(zone.id, P, T, { night: true });
  let lamps = '';      // drawn above the darkness
  const heads = [];    // lamp head centers

  if (zone.id === 'village') {
    s += `<rect x="-400" y="196" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += `<path d="M-400 236 L800 236 L800 270 L-400 270Z" fill="${T.path}"/>`;
    s += house(70, 204, 1.1) + house(200, 198, 0.95, '#6fa8ff') + house(330, 204, 1.1, '#ffb020') + roundTree(-20, 206, 1, T.leaf, T.leafDark) + roundTree(420, 206, 1, T.leaf, T.leafDark);
    for (let i = 0; i < N; i++) {
      const x = 40 + (i * 320) / (N - 1);
      s += `<rect x="${x - 3}" y="178" width="6" height="68" rx="2" fill="#39425a"/><rect x="${x - 9}" y="244" width="18" height="6" rx="2" fill="#39425a"/>`;
      heads.push({ x, y: 172 });
    }
  } else if (zone.id === 'forest') {
    s += `<rect x="-400" y="206" width="1200" height="400" fill="url(#${P}ground)"/>`;
    s += pine(10, 230, 1.5) + pine(390, 236, 1.6);
    s += `<path d="M-400 40 Q0 58 200 48 Q400 40 800 62" stroke="#4a2f16" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    s += `<rect x="300" y="120" width="54" height="112" rx="12" fill="#6b4524"/><circle id="${P}home" cx="327" cy="160" r="14" fill="#1c1208"/>`;
    for (let i = 0; i < N; i++) {
      const x = 40 + (i * 300) / (N - 1);
      const y = 104 + (i % 2) * 20;
      s += `<line x1="${x}" y1="${50 - (x > 200 ? -4 : 0)}" x2="${x}" y2="${y - 16}" stroke="#4a2f16" stroke-width="2"/>`;
      heads.push({ x, y });
    }
  } else {
    s += rock(200, 276, 2.4, T.stone, T.stoneDark) + rock(40, 290, 1.2, T.stone, T.stoneDark) + crystal(340, 290, 0.9, T.crystal, T.crystal2);
    s += `<path d="M180 262 L186 60 L214 60 L220 262Z" fill="#f2f2f2"/><path d="M200 60 L214 60 L220 262 L204 262Z" fill="#000" opacity=".08"/>`;
    s += `<rect x="176" y="50" width="48" height="10" rx="3" fill="#2e3f5c"/><path d="M182 32 L200 16 L218 32Z" fill="#ff5a5f"/><rect x="186" y="32" width="28" height="18" rx="3" fill="#44526b"/>`;
    const top = 62, bottom = 262;
    for (let i = 0; i < N; i++) {
      const y1 = bottom - ((i + 1) * (bottom - top)) / N;
      const y0 = bottom - (i * (bottom - top)) / N;
      s += `<rect x="${182 + (i * 4) / N}" y="${y1 + 2}" width="${36 - (i * 8) / N}" height="${y0 - y1 - 4}" fill="${i % 2 ? '#fff' : '#ff5a5f'}" opacity=".9"/>`;
      heads.push({ x: 200, y: (y0 + y1) / 2, band: [y1 + 2, y0 - y1 - 4, 182 + (i * 4) / N, 36 - (i * 8) / N] });
    }
    s += `<g transform="translate(330 176)"><g id="${P}npc" class="npc hidden-npc">${emo(0, 0, 36, mission.npc.e)}</g></g>`;
  }

  // NPC (village / forest)
  if (zone.id === 'village') s += `<g transform="translate(200 262)"><g id="${P}npc" class="npc wait">${emo(0, 0, 34, mission.npc.e)}</g></g>`;
  if (zone.id === 'forest') s += `<g transform="translate(327 158)"><g id="${P}npc" class="npc hidden-npc">${emo(0, 0, 26, mission.npc.e)}</g></g>`;
  s += hero(zone.id === 'cove' ? 90 : 118, zone.id === 'cove' ? 258 : 272, 0.56, `${P}hero`);

  // darkness layer
  s += `<rect id="${P}dark" x="-400" y="-300" width="1200" height="900" fill="#081232" opacity="${DARK}" pointer-events="none"/>`;
  s += `<g class="night-stars">${[[40, 30], [120, 18], [260, 26], [370, 40], [320, 12], [180, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('')}</g>`;

  // lamps above darkness
  heads.forEach((h, i) => {
    if (zone.id === 'cove') {
      const [y, hgt, x, w] = h.band;
      lamps += `<g class="lamp" id="${P}lamp${i}"><rect class="band-glow" x="${x}" y="${y}" width="${w}" height="${hgt}" fill="#ffe066"/>
        <circle class="lamp-glow" cx="200" cy="${h.y}" r="46" fill="url(#${P}glow)"/><rect class="lamp-target" x="${x}" y="${y}" width="${w}" height="${hgt}" fill="transparent"/></g>`;
    } else if (zone.id === 'forest') {
      lamps += `<g class="lamp lantern" id="${P}lamp${i}"><circle class="lamp-glow" cx="${h.x}" cy="${h.y}" r="40" fill="url(#${P}glow)"/>
        <rect class="lamp-body" x="${h.x - 11}" y="${h.y - 15}" width="22" height="28" rx="9"/><rect x="${h.x - 6}" y="${h.y - 19}" width="12" height="5" rx="2" fill="#4a2f16"/>
        <rect class="lamp-target" x="${h.x - 12}" y="${h.y - 16}" width="24" height="30" fill="transparent"/></g>`;
    } else {
      lamps += `<g class="lamp" id="${P}lamp${i}"><circle class="lamp-glow" cx="${h.x}" cy="${h.y}" r="44" fill="url(#${P}glow)"/>
        <path d="M${h.x - 12} ${h.y + 6} L${h.x + 12} ${h.y + 6} L${h.x + 8} ${h.y - 10} L${h.x - 8} ${h.y - 10}Z" fill="#39425a"/>
        <circle class="lamp-body" cx="${h.x}" cy="${h.y}" r="7"/><rect x="${h.x - 10}" y="${h.y - 14}" width="20" height="5" rx="2" fill="#39425a"/>
        <rect class="lamp-target" x="${h.x - 10}" y="${h.y - 10}" width="20" height="20" fill="transparent"/></g>`;
    }
  });
  if (zone.id === 'village') {
    // windows that light up with the lamps
    s += lamps + `<g id="${P}wins">${[[57, 180], [79, 180], [191, 177], [210, 177], [317, 180], [339, 180]].map(([x, y]) => `<rect class="win-lit" x="${x - 4}" y="${y - 4}" width="9" height="9" rx="2" fill="#ffe27a"/>`).join('')}</g>`;
  } else s += lamps;
  // bulb clusters for the current lamp (above the darkness, filled per question)
  s += `<g id="${P}garland" class="garland"></g>`;
  if (zone.id === 'cove') {
    s += `<g id="${P}beam" opacity="0"><g><path d="M200 41 L420 10 L420 72Z" fill="#fff6b0" opacity=".45"/><path d="M200 41 L-20 10 L-20 72Z" fill="#fff6b0" opacity=".3"/>
      <animateTransform attributeName="transform" type="rotate" values="-12 200 41;12 200 41;-12 200 41" dur="3.2s" repeatCount="indefinite"/></g>
      <circle cx="200" cy="41" r="14" fill="#fff6b0"/></g>`;
  }

  root.innerHTML = svgWrap(s, { cls: 'scene-svg', par: 'xMidYMax meet' });
  const svg = root.querySelector('svg');
  const dark = svg.querySelector(`#${P}dark`);
  const lamp = (i) => svg.querySelector(`#${P}lamp${i}`);
  let lit = 0;
  const garland = svg.querySelector(`#${P}garland`);
  const spans = zone.id === 'cove' ? [[14, 166], [234, 386]] : [[16, 384]];   // keep the lighthouse clear
  const bandY = 30;
  let cur = null;

  // b clusters × a bulbs on a wire; bulbs in a dice-like grid so small groups can be seen at a glance.
  function drawGarland(q) {
    const { xs, cell: room } = spreadGroups(q.b, spans, 64);
    const cols = q.a <= 4 ? 2 : 3;
    const rows = Math.ceil(q.a / cols);
    const cell = Math.max(8, Math.min(13, (room - 10) / cols));   // bigger bulbs when there are few clusters
    const r = cell * 0.4;
    const w = cols * cell + 6, h = rows * cell + 6;
    let g = `<path class="wire" d="M${spans[0][0] - 20} ${bandY - h / 2 - 8} ${xs.map((x) => `L${x} ${bandY - h / 2}`).join(' ')} L${spans[spans.length - 1][1] + 20} ${bandY - h / 2 - 8}"/>`;
    xs.forEach((x, k) => {
      let bulbs = '';
      for (let i = 0; i < q.a; i++) {
        // centre the last, shorter row
        const row = Math.floor(i / cols);
        const inRow = row === rows - 1 ? q.a - row * cols : cols;
        const bx = (i % cols - (inRow - 1) / 2) * cell;
        const by = (row - (rows - 1) / 2) * cell;
        bulbs += `<circle class="bulb" cx="${bx}" cy="${by}" r="${r}"/>`;
      }
      g += `<g class="cluster" transform="translate(${x} ${bandY})"><circle class="cluster-glow" r="${w * 0.9}" fill="url(#${P}glow)"/>
        <rect class="socket" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="7"/>${bulbs}
        <text class="cluster-count" y="${h / 2 + 11}" text-anchor="middle"></text></g>`;
    });
    const capX = spans.length > 1 ? (spans[0][0] + spans[0][1]) / 2 : 200;   // cove: beside the lighthouse
    g += `<g class="caption" transform="translate(${capX} ${bandY + h / 2 + 13})"><rect x="-80" y="-10" width="160" height="20" rx="10"/>
      <text text-anchor="middle" dy=".35em">Mỗi chùm ${q.a} bóng · ${q.b} chùm</text></g>`;
    garland.innerHTML = g;
    retrigger(garland, 'pop-in');
  }

  function brighten() {
    const from = +dark.getAttribute('opacity');
    const to = DARK * (1 - lit / N) * 0.9;
    return tween(420, (k) => dark.setAttribute('opacity', String(from + (to - from) * k)));
  }

  return {
    answerKind: keypad ? 'keypad' : 'choices', skin: 'bulb', optionCount: 4, floatAt: 0.66,
    icon: zone.id === 'cove' ? '⚡' : '💡',
    instruction: keypad ? 'Cần bao nhiêu bóng? Bấm số!' : 'Đèn cần bao nhiêu bóng nhỏ?',
    correctLine: ['Sáng rồi!', 'Rực rỡ quá!', 'Đủ bóng rồi!'],
    setQuestion(q, i) {
      cur = q;
      svg.querySelectorAll('.lamp.target').forEach((el) => el.classList.remove('target'));
      lamp(i).classList.add('target');
      drawGarland(q);
    },
    async onCorrect(i) {
      const l = lamp(i);
      const q = cur;
      const cap = garland.querySelector('.caption');
      if (cap) cap.classList.add('fade-out');
      // Light the clusters one by one, counting up a, 2a, 3a …
      const clusters = [...garland.querySelectorAll('.cluster')];
      const step = clusters.length > 6 ? 90 : 140;
      for (let k = 0; k < clusters.length; k++) {
        clusters[k].classList.add('on');
        clusters[k].querySelector('.cluster-count').textContent = String(q.a * (k + 1));
        play('count', k);
        await wait(step);
      }
      l.classList.remove('target');
      l.classList.add('lit');
      lit = i + 1;
      play('lamp');
      if (zone.id === 'village') {
        const wins = svg.querySelectorAll(`#${P}wins .win-lit`);
        const upto = Math.round((wins.length * lit) / N);
        wins.forEach((w, k) => { if (k < upto) w.classList.add('on'); });
      }
      await brighten();
    },
    async onWrong() { retrigger(garland, 'wobble'); },
    async onComplete() {
      if (zone.id === 'cove') {
        svg.querySelector(`#${P}beam`).setAttribute('opacity', '1');
        svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
        svgBurst(svg, 330, 140);
      } else if (zone.id === 'forest') {
        svg.querySelector(`#${P}home`).setAttribute('fill', '#ffcf5a');
        svg.querySelector(`#${P}npc`).classList.replace('hidden-npc', 'cheer');
        svgBurst(svg, 327, 130);
      } else {
        svg.querySelector(`#${P}npc`).classList.replace('wait', 'cheer');
        svgBurst(svg, 200, 226);
      }
      play('reveal');
      const from = +dark.getAttribute('opacity');
      const to = zone.id === 'cove' ? 0.22 : 0;   // keep a dusk tint so the lighthouse beam reads
      await tween(500, (k) => dark.setAttribute('opacity', String(from + (to - from) * k)));
      await wait(700);
    },
    destroy() {},
  };
}
