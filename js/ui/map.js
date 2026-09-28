// Adventure map: one tall illustrated SVG (village → forest → cove), missions along a winding trail.
// Locked zones sit under clouds that clear when the zone opens.
import { ZONES, MISSIONS, zoneMissions } from '../game/catalog.js';
import { missionStatus, currentMission, starsOf, zoneUnlocked, totalStars, allDone } from '../game/progression.js';
import { getState, save, nickname } from '../state.js';
import { play, unlockAudio } from '../audio.js';
import {
  THEMES, hero as heroArt, emo, cloud, roundTree, pine, bush, mushroom, flower, house, windmill, palm, crystal, rock, lighthouse, fence, starPath,
} from './art.js';
import { tween, place, wait, floatText, retrigger, confetti } from './fx.js';

const W = 400, H = 1580;
const HOME = { x: 70, y: 124 };
const POS = {
  v1: [150, 196], v2: [292, 256], v3: [118, 334], v4: [276, 414], v5: [192, 486],
  f1: [100, 626], f2: [292, 696], f3: [108, 786], f4: [286, 866], f5: [196, 966],
  c1: [100, 1142], c2: [286, 1212], c3: [108, 1302], c4: [272, 1392], c5: [186, 1488],
};
const ZONE_Y = { village: [0, 556], forest: [556, 1066], cove: [1066, H] };
const ICON = { repair: '🔨', unlock: '🔐', path: '🧭', light: '💡', rescue: '🎈' };

// Catmull-Rom → cubic Bézier through all points; also returns one sub-path per segment.
function smoothPath(pts) {
  let d = `M${pts[0].x} ${pts[0].y}`;
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    const c = ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x} ${p2.y}`;
    d += c;
    segs.push(`M${p1.x} ${p1.y}${c}`);
  }
  return { d, segs };
}

function scenery() {
  const V = THEMES.village, F = THEMES.forest, C = THEMES.cove;
  let s = `<defs>
    <linearGradient id="mp-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc4f4"/><stop offset="1" stop-color="#c9ecff"/></linearGradient>
    <linearGradient id="mp-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3cc6ea"/><stop offset="1" stop-color="#0b7fb0"/></linearGradient>
    <radialGradient id="mp-sun"><stop offset="0" stop-color="#fff8c2"/><stop offset=".55" stop-color="#ffe066"/><stop offset=".56" stop-color="#ffe066" stop-opacity=".3"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <radialGradient id="mp-fog" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#f4f8ff" stop-opacity=".97"/><stop offset="1" stop-color="#dfe9f7" stop-opacity=".93"/></radialGradient>
  </defs>`;
  // ── Village ──
  s += `<rect x="-200" y="0" width="${W + 400}" height="580" fill="#9edb74"/>`;
  s += `<rect x="-200" y="0" width="${W + 400}" height="84" fill="url(#mp-sky)"/><path d="M-200 84 Q-60 64 60 84 Q180 100 280 78 Q360 64 600 86 L600 100 L-200 100Z" fill="#9edb74"/>`;
  s += `<circle cx="352" cy="38" r="36" fill="url(#mp-sun)"/>` + cloud(80, 36, 0.8) + cloud(230, 24, 0.6, 0.9) + cloud(-30, 60, 0.9);
  s += `<ellipse cx="220" cy="150" rx="70" ry="22" fill="#b2e68a"/><ellipse cx="60" cy="430" rx="80" ry="30" fill="#b2e68a"/><ellipse cx="330" cy="310" rx="70" ry="26" fill="#8fd064"/>`;
  // fields
  s += `<g transform="translate(300 470) rotate(-8)"><rect x="-44" y="-26" width="88" height="52" rx="10" fill="#f5d36b"/>${[0, 1, 2, 3].map((i) => `<rect x="-40" y="${-22 + i * 12}" width="80" height="5" rx="2" fill="#e2b94a"/>`).join('')}</g>`;
  s += `<g transform="translate(46 520) rotate(6)"><rect x="-40" y="-20" width="80" height="40" rx="10" fill="#7fca5a"/>${[0, 1, 2].map((i) => `<rect x="-36" y="${-15 + i * 12}" width="72" height="5" rx="2" fill="#63b046"/>`).join('')}</g>`;
  // river with small bridge where the trail crosses
  s += `<path d="M-200 348 Q40 342 150 368 Q250 392 330 386 Q380 382 600 396 L600 426 Q380 412 330 416 Q240 422 146 398 Q40 372 -200 380Z" fill="#5cc0ec"/>`;
  s += `<path d="M-10 360 q12 -4 24 0 M90 372 q12 -4 24 0 M250 398 q12 -4 24 0 M350 396 q12 -4 24 0" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".7"/>`;
  s += `<g transform="translate(196 384) rotate(28)"><rect x="-16" y="-20" width="32" height="40" rx="4" fill="#cf8b4c"/>${[0, 1, 2, 3].map((i) => `<rect x="-16" y="${-18 + i * 10}" width="32" height="3" fill="#8d5629" opacity=".5"/>`).join('')}</g>`;
  s += house(338, 176, 0.9) + house(372, 212, 0.7, '#6fa8ff') + house(36, 262, 0.8, '#ffb020') + windmill(356, 360, 0.9);
  s += roundTree(24, 190, 0.8, V.leaf, V.leafDark) + roundTree(214, 324, 0.6, V.leaf, V.leafDark) + roundTree(372, 262, 0.7, V.leaf, V.leafDark) + roundTree(22, 348, 0.7, V.leaf, V.leafDark) + roundTree(372, 520, 0.8, V.leaf, V.leafDark) + roundTree(120, 470, 0.6, V.leaf, V.leafDark);
  s += fence(210, 262, 170) + flower(236, 140) + flower(252, 150, '#ffd23f') + flower(222, 156, '#b98cff') + flower(60, 470) + flower(320, 520, '#ffd23f') + flower(240, 470);
  // rescue HQ (start)
  s += `<g transform="translate(${HOME.x} ${HOME.y})"><ellipse cx="0" cy="4" rx="34" ry="7" fill="#000" opacity=".12"/><rect x="-24" y="-30" width="48" height="32" rx="6" fill="#fff"/>
    <path d="M-30 -28 L0 -50 L30 -28Z" fill="#ff8a3d"/><rect x="-8" y="-16" width="16" height="18" rx="4" fill="#4a90d9"/><circle cx="0" cy="-36" r="6" fill="#fff"/>
    <path d="M-3 -39 L3 -33 M3 -39 L-3 -33" stroke="#ff7a2a" stroke-width="2.2" stroke-linecap="round"/><rect x="26" y="-58" width="3" height="60" fill="#8d5629"/><path class="flag" d="M29 -58 L50 -52 L29 -46Z" fill="#ff5a5f"/></g>`;

  // ── Forest ──
  s += `<path d="M-200 548 Q60 530 200 548 Q330 562 600 544 L600 1090 L-200 1090Z" fill="#3e8f5b"/>`;
  s += `<ellipse cx="200" cy="700" rx="120" ry="40" fill="#46a066" opacity=".6"/><ellipse cx="190" cy="900" rx="130" ry="40" fill="#357f50" opacity=".6"/>`;
  for (let i = 0; i < 11; i++) s += bush(i * 40 - 10, 556 + (i % 2) * 6, 1.1, '#4fb165', '#37904f');
  s += `<ellipse cx="344" cy="770" rx="44" ry="20" fill="#3aa6a0"/><ellipse cx="336" cy="766" rx="30" ry="10" fill="#7fd6cf" opacity=".6"/>`;
  s += `<g transform="translate(350 912)"><rect x="-26" y="-34" width="14" height="34" fill="#8fa39a"/><rect x="12" y="-34" width="14" height="34" fill="#8fa39a"/><rect x="-30" y="-44" width="60" height="12" rx="3" fill="#a9bab2"/></g>`;
  const pines = [[20, 640], [372, 620], [30, 720], [380, 720], [16, 860], [370, 830], [34, 950], [384, 980], [200, 610], [206, 820], [60, 1010], [330, 1020], [180, 1040], [120, 900]];
  pines.forEach(([x, y], i) => { s += pine(x, y, 0.8 + (i % 3) * 0.15, F.leaf, F.leafDark); });
  s += mushroom(60, 670, 1.2) + mushroom(250, 760, 1) + mushroom(330, 690, 1.1) + mushroom(150, 1000, 1) + mushroom(250, 930, 0.9);
  s += `<g class="fireflies">${[[70, 600], [240, 650], [340, 860], [60, 820], [220, 1000], [150, 700], [300, 960], [120, 880]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')}</g>`;

  // ── Cove ──
  s += `<path d="M-200 1066 Q40 1052 200 1070 Q330 1082 600 1062 L600 ${H + 40} L-200 ${H + 40}Z" fill="#f6e1a8"/>`;
  s += `<path d="M-200 1066 Q40 1052 200 1070 Q330 1082 600 1062" stroke="#e7cc86" stroke-width="6" fill="none"/>`;
  s += `<path d="M600 1080 Q370 1100 352 1170 Q340 1250 372 1300 Q396 1360 350 1432 Q300 1520 180 1548 Q60 1570 -200 1560 L-200 ${H + 40} L600 ${H + 40}Z" fill="url(#mp-sea)"/>`;
  s += `<path d="M352 1170 Q340 1250 372 1300 Q396 1360 350 1432 Q300 1520 180 1548 Q60 1570 -200 1560" stroke="#fff" stroke-width="4" fill="none" opacity=".75"/>`;
  s += `<path d="M380 1200 q8 -4 16 0 M390 1360 q8 -4 16 0 M300 1540 q8 -4 16 0 M120 1568 q8 -4 16 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += lighthouse(384, 1276, 0.62) + palm(36, 1114, 0.8) + palm(330, 1100, 0.7) + crystal(36, 1216, 0.8, C.crystal, C.crystal2) + crystal(62, 1400, 0.7, C.crystal2, C.crystal);
  s += crystal(200, 1350, 0.5, C.crystal, C.crystal2) + crystal(24, 1480, 0.8, C.crystal, C.crystal2) + rock(220, 1250, 0.6, C.stone, C.stoneDark) + rock(380, 1470, 0.7, C.stone, C.stoneDark);
  s += `<g transform="translate(360 1510)"><path d="M-18 -4 L18 -4 L13 6 L-13 6Z" fill="#bf8d5c"/><rect x="-1" y="-26" width="2" height="22" fill="#7a5433"/><path d="M1 -26 L14 -10 L1 -8Z" fill="#fff"/></g>`;
  s += emo(160, 1180, 16, '🐚') + emo(220, 1440, 16, '⭐') + emo(40, 1300, 14, '🦀');
  return s;
}

function zoneBanner(z, x, y) {
  const w = 190;
  return `<g class="zone-banner" transform="translate(${x} ${y})">
    <path d="M${-w / 2 - 14} 4 L${-w / 2} -12 L${-w / 2} 20Z M${w / 2 + 14} 4 L${w / 2} -12 L${w / 2} 20Z" fill="${z.color}" opacity=".7"/>
    <rect x="${-w / 2}" y="-16" width="${w}" height="36" rx="12" fill="${z.color}" stroke="#fff" stroke-width="3"/>
    <text x="0" y="2" text-anchor="middle" dy=".35em" class="banner-text">${z.name}</text>
    <g transform="translate(0 30)"><rect x="-42" y="-9" width="84" height="18" rx="9" fill="#fff" opacity=".92"/><text x="0" y="0" dy=".35em" text-anchor="middle" class="banner-sub">×${z.tables.join(' ×')}</text></g></g>`;
}

function nodeSvg(m, status, isCurrent) {
  const [x, y] = POS[m.id];
  const r = m.finale ? 31 : 25;
  const stars = starsOf(m.id);
  let inner = '';
  if (status === 'locked') {
    inner = `<circle r="${r}" class="node-base locked"/><text class="emo" y="1" dy=".35em" text-anchor="middle" font-size="${m.finale ? 24 : 20}">🔒</text>`;
  } else {
    inner = `<circle r="${r}" class="node-base ${status}" style="--zc:${m.finale ? '#ff7a59' : ''}"/>
      <text class="emo" y="0" dy=".35em" text-anchor="middle" font-size="${m.finale ? 30 : 24}">${m.npc.e}</text>
      <g transform="translate(${r - 5} ${-r + 5})"><circle r="10" fill="#fff" stroke="#263553" stroke-width="1.5"/><text class="emo" dy=".35em" text-anchor="middle" font-size="11">${status === 'done' ? '✅' : ICON[m.type]}</text></g>`;
  }
  let starsRow = '';
  if (status === 'done') {
    starsRow = `<g class="node-stars" transform="translate(0 ${r + 8})">${[-15, 0, 15].map((dx, i) => `<path class="nstar ${i < stars ? 'on' : ''}" d="${starPath(dx, 0, 8)}"/>`).join('')}</g>`;
  }
  const label = `<g transform="translate(0 ${r + (status === 'done' ? 26 : 14)})"><rect x="-42" y="-9" width="84" height="19" rx="9.5" class="node-label-bg ${status}"/><text class="node-label" text-anchor="middle" dy=".35em" y="0.5">${m.short}</text></g>`;
  const crown = m.finale ? `<text class="emo" y="${-r - 8}" text-anchor="middle" font-size="18">${status === 'done' ? '🏅' : '⭐'}</text>` : '';
  const pulse = isCurrent ? `<circle r="${r + 6}" class="pulse-ring"/><circle r="${r + 6}" class="pulse-ring d2"/>` : '';
  const arrow = isCurrent ? `<g transform="translate(0 ${-r - (m.finale ? 30 : 16)})"><g class="bounce-arrow"><path d="M-9 -14 h18 v8 h8 l-17 16 l-17 -16 h8z" fill="#ff7a2a" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></g></g>` : '';
  return `<g class="map-node ${status} ${isCurrent ? 'current' : ''}" data-id="${m.id}" transform="translate(${x} ${y})" role="button" tabindex="0" aria-label="${m.title}${status === 'locked' ? ' (chưa mở)' : ''}"${status === 'locked' ? ' aria-disabled="true"' : ''}>
    <circle r="${r + 14}" fill="transparent"/>${pulse}<g class="node-body"><ellipse cy="${r - 2}" rx="${r}" ry="6" fill="#000" opacity=".15"/>${inner}${crown}</g>${starsRow}${label}${arrow}</g>`;
}

function fogSvg(z, i) {
  const [y0, y1] = ZONE_Y[z.id];
  const prev = ZONES[i - 1];
  const finale = zoneMissions(prev.id).find((m) => m.finale);
  const cy = (y0 + y1) / 2;
  let clouds = '';
  for (let k = 0; k < 7; k++) clouds += cloud(30 + k * 58, y0 + 30 + (k % 2) * 30, 1.8, 1) + cloud(10 + k * 64, y1 - 40 - (k % 2) * 20, 1.6, 1);
  return `<g class="fog" id="fog-${z.id}"><rect x="-200" y="${y0}" width="${W + 400}" height="${y1 - y0 + 10}" fill="url(#mp-fog)"/>${clouds}
    <g transform="translate(200 ${cy - 20})"><circle r="44" fill="#fff" stroke="${z.color}" stroke-width="5"/><text class="emo" dy=".35em" text-anchor="middle" font-size="40">🔒</text></g>
    <g transform="translate(200 ${cy + 50})"><rect x="-120" y="-20" width="240" height="40" rx="20" fill="#fff" stroke="${z.color}" stroke-width="3"/>
    <text class="fog-text" text-anchor="middle" dy=".35em">${finale.npc.e} ${finale.title} để mở</text></g>
    <g transform="translate(200 ${y0 + 34})"><text class="fog-title" text-anchor="middle" dy=".35em">${z.name}</text></g></g>`;
}

export function renderMap(host, { onPlay, onHome, onAlbum, onSettings }, params = {}) {
  const st = getState();
  const cur = currentMission();
  const order = MISSIONS.map((m) => m.id);
  const pts = [{ x: HOME.x, y: HOME.y }, ...order.map((id) => ({ x: POS[id][0], y: POS[id][1] }))];
  const { d, segs } = smoothPath(pts);

  let trailDone = '';
  segs.forEach((sd, i) => {
    const m = MISSIONS[i];
    if (missionStatus(m) === 'done') trailDone += `<path d="${sd}" class="trail-done"/>`;
  });

  let nodes = '';
  MISSIONS.forEach((m) => { nodes += nodeSvg(m, missionStatus(m), cur && cur.id === m.id); });

  let fogs = '';
  ZONES.forEach((z, i) => {
    const unlocked = zoneUnlocked(z.id);
    const revealed = st.progress.revealedZones.includes(z.id);
    if (i > 0 && (!unlocked || !revealed)) fogs += fogSvg(z, i);
  });

  const heroAt = params.justCompleted && POS[params.justCompleted] ? POS[params.justCompleted] : cur ? POS[cur.id] : [HOME.x, HOME.y];

  const svg = `<svg class="map-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg">
    ${scenery()}
    <path d="${d}" class="trail-edge"/><path d="${d}" class="trail"/><path d="${d}" class="trail-dash"/>${trailDone}
    ${zoneBanner(ZONES[0], 240, 104)}${zoneBanner(ZONES[1], 226, 590)}${zoneBanner(ZONES[2], 228, 1098)}
    ${nodes}
    <g id="map-hero-wrap">${heroArt(heroAt[0] - 40, heroAt[1] + 20, 0.42, 'map-hero', 'happy')}</g>
    ${fogs}
    <path id="walk-path" d="" fill="none" stroke="none"/>
  </svg>`;

  host.innerHTML = `
  <div class="map-screen">
    <header class="topbar map-top">
      <button class="icon-btn" data-act="home" aria-label="Trang chủ">🏠</button>
      <div class="pill stars-pill" aria-label="Tổng số sao"><span class="star-ic">⭐</span><b>${totalStars()}</b></div>
      <div class="spacer"></div>
      <button class="icon-btn" data-act="album" aria-label="Sổ cứu hộ">🎒</button>
      <button class="icon-btn" data-act="settings" aria-label="Cài đặt">⚙️</button>
    </header>
    <div class="map-scroll"><div class="map-inner">${svg}</div></div>
    <div class="map-toast" hidden></div>
  </div>`;

  const scroller = host.querySelector('.map-scroll');
  const svgEl = host.querySelector('.map-svg');
  const hero = svgEl.querySelector('#map-hero');
  const toast = host.querySelector('.map-toast');

  const scrollToY = (y, smooth) => {
    const scale = svgEl.getBoundingClientRect().width / W;
    const top = Math.max(0, y * scale - scroller.clientHeight * 0.5);
    if (smooth && 'scrollBehavior' in document.documentElement.style) scroller.scrollTo({ top, behavior: 'smooth' });
    else scroller.scrollTop = top;
  };

  function showToast(html, ms = 2600) {
    toast.innerHTML = html;
    toast.hidden = false;
    retrigger(toast, 'show');
    clearTimeout(showToast.t);
    if (ms) showToast.t = setTimeout(() => { toast.hidden = true; }, ms);
  }

  async function walkHero(fromIdx, toIdx) {
    // fromIdx/toIdx are mission indices; segment k goes from point k to k+1 (point 0 = HQ).
    const wp = svgEl.querySelector('#walk-path');
    for (let k = fromIdx + 1; k <= toIdx; k++) {
      wp.setAttribute('d', segs[k]);
      const len = wp.getTotalLength();
      if (!len) break;
      await tween(Math.min(1400, 300 + len * 3), (t) => {
        const p = wp.getPointAtLength(t * len);
        hero.setAttribute('transform', `translate(${p.x - 40} ${p.y + 20 - Math.abs(Math.sin(t * Math.PI * 5)) * 5}) scale(0.42)`);
      });
      play('step');
    }
    const end = POS[order[toIdx]];
    place(hero, end[0] - 40, end[1] + 20, 0.42);
  }

  // node taps (+ Enter / Space for keyboard users)
  svgEl.querySelectorAll('.map-node').forEach((g) => {
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    });
    g.addEventListener('click', () => {
      unlockAudio();
      const m = MISSIONS.find((x) => x.id === g.dataset.id);
      if (missionStatus(m) === 'locked') {
        play('wrong');
        retrigger(g.querySelector('.node-body'), 'wobble');
        floatText(g, '🔒 Chưa mở');
        return;
      }
      play('tap');
      onPlay(m.id);
    });
  });
  hero.addEventListener('click', () => { if (cur) { unlockAudio(); play('tap'); onPlay(cur.id); } });
  svgEl.querySelectorAll('.fog').forEach((f) => f.addEventListener('click', () => { play('wrong'); showToast('🔒 Vùng này chưa mở. Hoàn thành vùng trước nhé!', 2200); }));

  host.querySelector('.map-top').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    unlockAudio();
    play('tap');
    if (b.dataset.act === 'home') onHome();
    if (b.dataset.act === 'album') onAlbum();
    if (b.dataset.act === 'settings') onSettings();
  });
  toast.addEventListener('click', () => { toast.hidden = true; });

  // Initial camera + post-mission choreography.
  requestAnimationFrame(async () => {
    const focus = params.justCompleted ? POS[params.justCompleted] : cur ? POS[cur.id] : [200, 120];
    scrollToY(focus[1], false);

    if (params.justCompleted) {
      const doneNode = svgEl.querySelector(`.map-node[data-id="${params.justCompleted}"]`);
      if (params.reward && params.reward.starsAdded > 0 && doneNode) doneNode.classList.add('fresh');
      await wait(500);
      const from = order.indexOf(params.justCompleted);
      const to = cur ? order.indexOf(cur.id) : -1;
      if (cur && to > from && to - from <= 2 && MISSIONS[to].zone === MISSIONS[from].zone) {
        await walkHero(from, to);
      } else if (cur) {
        place(hero, POS[cur.id][0] - 40, POS[cur.id][1] + 20, 0.42);
      }
    }

    // Reveal newly unlocked zones (clouds clear once).
    for (const z of ZONES) {
      if (zoneUnlocked(z.id) && !st.progress.revealedZones.includes(z.id)) {
        st.progress.revealedZones.push(z.id);
        save();
        const fog = svgEl.querySelector(`#fog-${z.id}`);
        scrollToY(ZONE_Y[z.id][0] + 160, true);
        await wait(700);
        if (fog) fog.classList.add('clearing');
        play('reveal');
        showToast(`🗺️ Vùng mới: <b>${z.name}</b>!`);
        await wait(1100);
        if (fog) fog.remove();
        if (cur) {
          place(hero, POS[cur.id][0] - 40, POS[cur.id][1] + 20, 0.42);
          scrollToY(POS[cur.id][1], true);
        }
      }
    }

    if (!st.progress.tutorial.intro) {
      showToast('Chào <b class="nick"></b>! Chạm vào bạn Vịt để bắt đầu cứu hộ nhé!', 0);
      toast.querySelector('.nick').textContent = nickname();   // user text: textContent only
      st.progress.tutorial.intro = true;
      save();
    } else if (params.justCompleted && allDone()) {
      confetti(70);
      showToast('🏆 Bạn đã cứu tất cả bạn bè! <b>Anh hùng Cửu Chương!</b>', 5000);
    }
  });
}
