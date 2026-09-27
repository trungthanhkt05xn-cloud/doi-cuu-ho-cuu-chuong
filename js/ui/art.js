// Procedural SVG illustration kit. Everything is vector + tiny; swap for real art later
// by replacing these functions (scenes only call these helpers).

export const THEMES = {
  village: {
    skyTop: '#6cc4f4', skyBot: '#dff4ff', far: '#b4e39a', mid: '#8fd26f', ground: '#79c457', groundDark: '#58a23d',
    water: '#4cb5e6', waterDark: '#2c90c6', wood: '#cf8b4c', woodDark: '#8d5629', stone: '#c9c1b4', stoneDark: '#9d9486',
    leaf: '#5dbb4a', leafDark: '#3f9434', accent: '#ffb020', path: '#f3dfa6', pathEdge: '#d9bf7c',
  },
  forest: {
    skyTop: '#173f55', skyBot: '#4f9c8f', far: '#24604f', mid: '#2c7a58', ground: '#3b9159', groundDark: '#276b40',
    water: '#3aa6a0', waterDark: '#1f6b68', wood: '#a36e3f', woodDark: '#5c3b1c', stone: '#8fa39a', stoneDark: '#627a70',
    leaf: '#2f9a5d', leafDark: '#1d6d41', accent: '#c6f36b', path: '#c9b187', pathEdge: '#9d855c', glow: '#fff3a0',
  },
  cove: {
    skyTop: '#57cdf3', skyBot: '#ecfcff', far: '#a6ecf3', mid: '#f7e2ad', ground: '#f4d997', groundDark: '#dcb96c',
    water: '#17a9d1', waterDark: '#0a7aa6', wood: '#bf8d5c', woodDark: '#7a5433', stone: '#a9c7d1', stoneDark: '#7a9ea9',
    leaf: '#39b36a', leafDark: '#237f48', accent: '#9b7bff', path: '#fff1c9', pathEdge: '#e2c98a', crystal: '#7ff0ff', crystal2: '#c4a6ff',
  },
};

export const svgWrap = (inner, { vb = '0 0 400 300', cls = '', par = 'xMidYMid meet' } = {}) =>
  `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="${par}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${inner}</svg>`;

export const emo = (x, y, size, ch, cls = '') =>
  `<text class="emo ${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dy="0.35em">${ch}</text>`;

// ── Hero: Bíp the rescue robot. Origin = point between the feet. ──
export function bip(x, y, s = 1, id = '', mood = '') {
  return `<g ${id ? `id="${id}"` : ''} class="bip-pos" transform="translate(${x} ${y}) scale(${s})" data-x="${x}" data-y="${y}" data-s="${s}">
  <g class="bip ${mood}">
    <ellipse cx="0" cy="0" rx="22" ry="5" fill="#0b1b33" opacity=".18"/>
    <g class="bip-float">
      <ellipse cx="0" cy="-6" rx="13" ry="4.5" fill="#8fe9ff" opacity=".75"/>
      <g class="bip-arm-l"><rect x="-28" y="-32" width="11" height="19" rx="5.5" fill="#ffb37a" stroke="#263553" stroke-width="2.5"/></g>
      <g class="bip-arm-r"><rect x="17" y="-32" width="11" height="19" rx="5.5" fill="#ffb37a" stroke="#263553" stroke-width="2.5"/></g>
      <rect x="-18" y="-36" width="36" height="28" rx="11" fill="#ff8a3d" stroke="#263553" stroke-width="3"/>
      <circle cx="0" cy="-22" r="7.5" fill="#fff" stroke="#263553" stroke-width="2"/>
      <path d="M-3.2 -25.2 L3.2 -18.8 M3.2 -25.2 L-3.2 -18.8" stroke="#ff7a2a" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="0" y1="-78" x2="0" y2="-90" stroke="#263553" stroke-width="3" stroke-linecap="round"/>
      <circle class="bip-bulb" cx="0" cy="-93" r="5.5" fill="#ffd23f" stroke="#263553" stroke-width="2"/>
      <rect x="-32" y="-64" width="8" height="14" rx="3" fill="#6fd0ff" stroke="#263553" stroke-width="2"/>
      <rect x="24" y="-64" width="8" height="14" rx="3" fill="#6fd0ff" stroke="#263553" stroke-width="2"/>
      <rect x="-27" y="-79" width="54" height="43" rx="17" fill="#fff" stroke="#263553" stroke-width="3"/>
      <rect x="-20" y="-72" width="40" height="29" rx="11" fill="#1d2b49"/>
      <g class="eyes-n"><ellipse cx="-8" cy="-59" rx="4.3" ry="5.6" fill="#6ff5ff"/><ellipse cx="8" cy="-59" rx="4.3" ry="5.6" fill="#6ff5ff"/>
        <circle cx="-6.6" cy="-61" r="1.5" fill="#fff"/><circle cx="9.4" cy="-61" r="1.5" fill="#fff"/></g>
      <g class="eyes-h"><path d="M-12.5 -57 q4.5 -7 9 0 M3.5 -57 q4.5 -7 9 0" stroke="#6ff5ff" stroke-width="3.2" fill="none" stroke-linecap="round"/></g>
      <g class="eyes-t"><ellipse cx="-8" cy="-58" rx="4.3" ry="2" fill="#6ff5ff"/><ellipse cx="8" cy="-60" rx="4.3" ry="5.6" fill="#6ff5ff"/></g>
      <path class="bip-mouth" d="M-5 -50 q5 4.5 10 0" stroke="#6ff5ff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="-15" cy="-49" r="2.6" fill="#ff8fb1" opacity=".7"/><circle cx="15" cy="-49" r="2.6" fill="#ff8fb1" opacity=".7"/>
    </g>
  </g></g>`;
}

// Standalone small Bíp avatar (for hint bubble / home).
export const bipAvatar = (mood = 'happy') => svgWrap(bip(40, 96, 0.92, '', mood), { vb: '0 0 80 100', cls: 'bip-avatar' });

// ── Scenery pieces ──
export const cloud = (x, y, s = 1, o = 0.95) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="0" rx="26" ry="13" fill="#fff"/><ellipse cx="-18" cy="4" rx="16" ry="10" fill="#fff"/><ellipse cx="20" cy="5" rx="18" ry="10" fill="#fff"/><ellipse cx="4" cy="-9" rx="16" ry="12" fill="#fff"/></g>`;

export const roundTree = (x, y, s = 1, c = '#5dbb4a', d = '#3f9434') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="18" ry="4" fill="#000" opacity=".12"/><rect x="-4" y="-22" width="8" height="22" rx="3" fill="#8d5629"/>
  <circle cx="0" cy="-36" r="20" fill="${d}"/><circle cx="-10" cy="-30" r="13" fill="${c}"/><circle cx="8" cy="-42" r="14" fill="${c}"/><circle cx="-3" cy="-44" r="8" fill="#fff" opacity=".18"/></g>`;

export const pine = (x, y, s = 1, c = '#2f9a5d', d = '#1d6d41') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="14" ry="3.5" fill="#000" opacity=".15"/><rect x="-3" y="-12" width="6" height="12" fill="#5c3b1c"/>
  <path d="M0 -70 L20 -34 L-20 -34Z" fill="${c}"/><path d="M0 -56 L24 -12 L-24 -12Z" fill="${c}"/><path d="M0 -70 L20 -34 L0 -34Z M0 -56 L24 -12 L0 -12Z" fill="${d}"/></g>`;

export const bush = (x, y, s = 1, c = '#5dbb4a', d = '#3f9434') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-8" rx="20" ry="12" fill="${d}"/><circle cx="-10" cy="-12" r="10" fill="${c}"/><circle cx="7" cy="-15" r="11" fill="${c}"/></g>`;

export const rock = (x, y, s = 1, c = '#9d9486', d = '#7c7467') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0 Q-24 -16 -10 -22 Q4 -30 16 -18 Q26 -8 22 0Z" fill="${c}"/><path d="M4 -24 Q18 -18 22 0 L8 0 Q12 -12 4 -24Z" fill="${d}"/></g>`;

export const mushroom = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-12" width="8" height="12" rx="3" fill="#fff3dc"/><path d="M-14 -11 Q0 -30 14 -11Z" fill="#ff5a5f"/><circle cx="-5" cy="-17" r="2.4" fill="#fff"/><circle cx="5" cy="-15" r="1.8" fill="#fff"/></g>`;

export const flower = (x, y, c = '#ff7ab6') =>
  `<g transform="translate(${x} ${y})"><circle cx="0" cy="-3" r="3" fill="${c}"/><circle cx="3" cy="0" r="3" fill="${c}"/><circle cx="-3" cy="0" r="3" fill="${c}"/><circle cx="0" cy="3" r="3" fill="${c}"/><circle r="2" fill="#ffd23f"/></g>`;

export const house = (x, y, s = 1, roof = '#ef6a4b', wall = '#fff4dc', win = '#8fd6ff') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="30" ry="5" fill="#000" opacity=".12"/>
  <rect x="-22" y="-30" width="44" height="30" rx="3" fill="${wall}"/><path d="M-28 -28 L0 -52 L28 -28Z" fill="${roof}"/><path d="M0 -52 L28 -28 L20 -28 L0 -45Z" fill="#000" opacity=".12"/>
  <rect x="-6" y="-17" width="12" height="17" rx="5" fill="#b8733d"/><rect class="win" x="-17" y="-24" width="8" height="8" rx="2" fill="${win}"/><rect class="win" x="9" y="-24" width="8" height="8" rx="2" fill="${win}"/></g>`;

export const windmill = (x, y, s = 1, spin = true) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="22" ry="5" fill="#000" opacity=".12"/>
  <path d="M-14 0 L-9 -58 L9 -58 L14 0Z" fill="#fff4dc"/><path d="M0 -58 L9 -58 L14 0 L4 0Z" fill="#000" opacity=".08"/>
  <path d="M-12 -58 L0 -70 L12 -58Z" fill="#ef6a4b"/><rect x="-4" y="-14" width="8" height="14" rx="4" fill="#b8733d"/>
  <g transform="translate(0 -60)"><g class="${spin ? 'spin-slow' : ''}">
    <path d="M0 0 L-5 -36 L5 -36Z M0 0 L36 -5 L36 5Z M0 0 L5 36 L-5 36Z M0 0 L-36 5 L-36 -5Z" fill="#fff" stroke="#c9b58f" stroke-width="1.5"/>
    <circle r="4" fill="#8d5629"/></g></g></g>`;

export const palm = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="16" ry="4" fill="#000" opacity=".12"/>
  <path d="M-3 0 Q-6 -30 4 -58 L8 -57 Q0 -30 4 0Z" fill="#b98a55"/>
  <path d="M6 -58 Q-18 -70 -34 -52 Q-14 -62 6 -56Z" fill="#39b36a"/><path d="M6 -58 Q30 -72 44 -50 Q24 -62 6 -56Z" fill="#2f9d5b"/>
  <path d="M6 -58 Q-6 -82 -22 -84 Q-4 -76 6 -58Z" fill="#43c276"/><path d="M6 -58 Q20 -84 36 -80 Q18 -74 6 -58Z" fill="#39b36a"/></g>`;

export const crystal = (x, y, s = 1, c = '#7ff0ff', c2 = '#c4a6ff') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="20" ry="4" fill="#000" opacity=".12"/>
  <path d="M-12 0 L-16 -22 L-9 -34 L-4 -8Z" fill="${c2}"/><path d="M-6 0 L-4 -40 L4 -54 L10 -38 L8 0Z" fill="${c}"/>
  <path d="M4 -54 L10 -38 L8 0 L2 0Z" fill="#fff" opacity=".35"/><path d="M8 0 L12 -26 L20 -32 L18 0Z" fill="${c2}"/></g>`;

export const fence = (x1, x2, y, c = '#e8c48f') => {
  let s = `<rect x="${x1}" y="${y - 16}" width="${x2 - x1}" height="4" rx="2" fill="${c}"/><rect x="${x1}" y="${y - 8}" width="${x2 - x1}" height="4" rx="2" fill="${c}"/>`;
  for (let x = x1 + 4; x < x2; x += 14) s += `<rect x="${x - 2.5}" y="${y - 22}" width="5" height="22" rx="2" fill="${c}"/>`;
  return s;
};

export const starPath = (cx, cy, r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.48 : r;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(ang) * rr).toFixed(1)} ${(cy + Math.sin(ang) * rr).toFixed(1)}`;
  }
  return `${d}Z`;
};

export const lighthouse = (x, y, s = 1, id = '') =>
  `<g ${id ? `id="${id}"` : ''} transform="translate(${x} ${y}) scale(${s})"><path d="M-30 4 Q0 -10 30 4Z" fill="#7a9ea9"/>
  <path d="M-16 0 L-11 -80 L11 -80 L16 0Z" fill="#fff"/><path d="M-15 -20 L15 -20 L14 -36 L-14 -36Z M-12.6 -56 L12.6 -56 L12 -68 L-12 -68Z" fill="#ff5a5f"/>
  <rect x="-14" y="-84" width="28" height="6" rx="2" fill="#2e3f5c"/><rect x="-9" y="-100" width="18" height="16" rx="3" fill="#ffe27a"/>
  <path d="M-12 -100 L0 -112 L12 -100Z" fill="#ff5a5f"/></g>`;

// Shared gradient defs. `P` = unique id prefix (ids must be unique per document).
export function defs(P, T) {
  return `<defs>
    <linearGradient id="${P}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.skyTop}"/><stop offset="1" stop-color="${T.skyBot}"/></linearGradient>
    <linearGradient id="${P}water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.water}"/><stop offset="1" stop-color="${T.waterDark}"/></linearGradient>
    <linearGradient id="${P}ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.ground}"/><stop offset="1" stop-color="${T.groundDark}"/></linearGradient>
    <radialGradient id="${P}glow"><stop offset="0" stop-color="#fff6b0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffd84d" stop-opacity=".45"/><stop offset="1" stop-color="#ffd84d" stop-opacity="0"/></radialGradient>
    <radialGradient id="${P}sun"><stop offset="0" stop-color="#fff8c2"/><stop offset=".55" stop-color="#ffe066"/><stop offset=".56" stop-color="#ffe066" stop-opacity=".35"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <linearGradient id="${P}chasm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3b3a"/><stop offset="1" stop-color="#07151a"/></linearGradient>
  </defs>`;
}

// Background (sky + far layers) for a 400×300 scene; draws with bleed so any aspect ratio is filled.
export function sceneBackdrop(zoneId, P, T, { night = false } = {}) {
  let s = `<rect x="-400" y="-300" width="1200" height="900" fill="url(#${P}sky)"/>`;
  if (zoneId === 'village') {
    if (!night) s += `<circle cx="340" cy="46" r="44" fill="url(#${P}sun)"/>`;
    s += cloud(70, 44, 0.9) + cloud(250, 30, 0.7, 0.85) + cloud(-60, 70, 1) + cloud(470, 60, 0.9);
    s += `<ellipse cx="60" cy="170" rx="190" ry="60" fill="${T.far}"/><ellipse cx="360" cy="176" rx="200" ry="64" fill="${T.far}"/>`;
    s += roundTree(-10, 150, 0.7, T.leaf, T.leafDark) + roundTree(430, 150, 0.8, T.leaf, T.leafDark);
  } else if (zoneId === 'forest') {
    s += `<circle cx="330" cy="50" r="20" fill="#fff8d6" opacity=".95"/><circle cx="321" cy="44" r="18" fill="#1d4a5d"/>`;
    for (let i = -6; i < 12; i++) s += pine(i * 42 + (i % 2) * 12, 165 + (i % 3) * 6, 1.1 + (i % 2) * 0.2, '#1f5a49', '#184a3c');
    for (let i = -5; i < 12; i++) s += pine(i * 48 + 20, 180 + (i % 2) * 8, 0.9, '#2a7358', '#1f5e48');
    s += `<g class="fireflies"><circle cx="60" cy="90" r="2.4"/><circle cx="150" cy="60" r="2"/><circle cx="260" cy="100" r="2.4"/><circle cx="360" cy="120" r="2"/><circle cx="20" cy="140" r="2"/></g>`;
  } else {
    s += (night ? `<circle cx="70" cy="44" r="16" fill="#fff8d6"/>` : `<circle cx="70" cy="44" r="40" fill="url(#${P}sun)"/>`) + cloud(250, 40, 0.8) + cloud(420, 70, 0.9) + cloud(-40, 80, 0.8);
    s += `<rect x="-400" y="140" width="1200" height="400" fill="url(#${P}water)"/>`;
    s += `<path d="M230 142 Q260 112 290 118 Q310 104 340 142Z" fill="#6fcf9a"/><path d="M-60 142 Q-20 120 20 142Z" fill="#6fcf9a"/>`;
    s += crystal(300, 132, 0.6, T.crystal, T.crystal2) + crystal(-20, 136, 0.5, T.crystal, T.crystal2);
    s += `<path class="wave-line" d="M-400 160 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>`;
  }
  return s;
}

// Groups-of-dots picture for hints: `count` groups of `size` dots (a × b = a taken b times).
export function groupsPicture(size, count) {
  const cols = size <= 4 ? 2 : 3;
  const rows = Math.ceil(size / cols);
  const cell = 9;
  const gw = cols * cell + 8;
  const gh = rows * cell + 8;
  const perRow = count <= 5 ? count : Math.ceil(count / 2);
  let s = '';
  for (let g = 0; g < count; g++) {
    const gx = (g % perRow) * (gw + 6);
    const gy = Math.floor(g / perRow) * (gh + 6);
    s += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="7" fill="#fff" stroke="#ffc55a" stroke-width="2"/>`;
    for (let i = 0; i < size; i++) {
      s += `<circle cx="${gx + 4 + cell / 2 + (i % cols) * cell}" cy="${gy + 4 + cell / 2 + Math.floor(i / cols) * cell}" r="3.4" fill="#ff8a3d"/>`;
    }
  }
  const w = perRow * (gw + 6) - 6;
  const h = Math.ceil(count / perRow) * (gh + 6) - 6;
  return `<svg class="groups-pic" viewBox="-2 -2 ${w + 4} ${h + 4}" width="${Math.min(300, (w + 4) * 1.1)}" aria-hidden="true">${s}</svg>`;
}
