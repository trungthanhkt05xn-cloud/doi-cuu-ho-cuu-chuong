import { getState } from '../state.js';

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

// ── Player avatars. Origin = point between the feet, ~95 units tall. Every avatar keeps the
// .bip / .bip-float / .bip-arm-* / eyes-n|h|t structure so moods + idle animations work for all. ──
const OL = '#263553';

function face(y = -57, dx = 9, eye = OL) {
  return `<g class="eyes-n"><ellipse cx="${-dx}" cy="${y}" rx="3.4" ry="4.4" fill="${eye}"/><ellipse cx="${dx}" cy="${y}" rx="3.4" ry="4.4" fill="${eye}"/>
      <circle cx="${-dx + 1.2}" cy="${y - 1.7}" r="1.3" fill="#fff"/><circle cx="${dx + 1.2}" cy="${y - 1.7}" r="1.3" fill="#fff"/></g>
    <g class="eyes-h"><path d="M${-dx - 4} ${y + 1} q4 -6 8 0 M${dx - 4} ${y + 1} q4 -6 8 0" stroke="${eye}" stroke-width="2.8" fill="none" stroke-linecap="round"/></g>
    <g class="eyes-t"><path d="M${-dx - 3.5} ${y} h7" stroke="${eye}" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="${dx}" cy="${y - 1}" rx="3.4" ry="4.4" fill="${eye}"/></g>
    <path d="M-5 ${y + 9} q5 5 10 0" stroke="${OL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="${-dx - 6}" cy="${y + 7}" r="3" fill="#ff8fb1" opacity=".6"/><circle cx="${dx + 6}" cy="${y + 7}" r="3" fill="#ff8fb1" opacity=".6"/>`;
}

// Shared chibi body: legs, torso, arms. `extra` is drawn over the torso (scarf, straps…).
function body({ shirt, pants, arm, shoe = '#3b4a66', extra = '' }) {
  return `<rect x="-11" y="-16" width="8" height="15" rx="4" fill="${pants}" stroke="${OL}" stroke-width="2"/><rect x="3" y="-16" width="8" height="15" rx="4" fill="${pants}" stroke="${OL}" stroke-width="2"/>
    <ellipse cx="-7" cy="-1.5" rx="6.5" ry="3.5" fill="${shoe}"/><ellipse cx="7" cy="-1.5" rx="6.5" ry="3.5" fill="${shoe}"/>
    <g class="bip-arm-l"><rect x="-25" y="-36" width="10" height="19" rx="5" fill="${arm}" stroke="${OL}" stroke-width="2.2"/></g>
    <g class="bip-arm-r"><rect x="15" y="-36" width="10" height="19" rx="5" fill="${arm}" stroke="${OL}" stroke-width="2.2"/></g>
    <rect x="-17" y="-40" width="34" height="28" rx="11" fill="${shirt}" stroke="${OL}" stroke-width="2.6"/>${extra}`;
}

const AVATAR_ART = {
  bip: () => `
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
      <circle cx="-15" cy="-49" r="2.6" fill="#ff8fb1" opacity=".7"/><circle cx="15" cy="-49" r="2.6" fill="#ff8fb1" opacity=".7"/>`,

  // kid with a red rescue cap
  cap: () => `${body({ shirt: '#3aa0ff', pants: '#2f4f86', arm: '#ffd3b0',
      extra: '<path d="M-9 -40 L0 -30 L9 -40Z" fill="#ffd23f" stroke="#263553" stroke-width="2" stroke-linejoin="round"/>' })}
    <circle cx="-24" cy="-57" r="5" fill="#ffd3b0" stroke="${OL}" stroke-width="2"/><circle cx="24" cy="-57" r="5" fill="#ffd3b0" stroke="${OL}" stroke-width="2"/>
    <circle cx="0" cy="-60" r="24" fill="#ffd3b0" stroke="${OL}" stroke-width="2.6"/>
    <path d="M-23 -62 Q-22 -72 -12 -71 Q-4 -66 4 -71 Q14 -72 23 -62 L23 -70 Q0 -80 -23 -70Z" fill="#5a3522"/>
    <path d="M-24 -68 Q-23 -92 0 -92 Q23 -92 24 -68Z" fill="#ff5a5f" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M-2 -69 Q18 -76 36 -67 Q22 -63 -2 -66Z" fill="#d93d44" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>
    <circle cx="-6" cy="-81" r="5" fill="#fff"/><path d="M-6 -84 v6 M-9 -81 h6" stroke="#ff5a5f" stroke-width="2.2" stroke-linecap="round"/>
    ${face()}`,

  // kid with two hair buns + star headband
  buns: () => `${body({ shirt: '#9b6bff', pants: '#34507f', arm: '#f6c7a0',
      extra: '<path d="M-11 -39 L-8 -13 M11 -39 L8 -13" stroke="#ff9f1c" stroke-width="3.2" stroke-linecap="round"/>' })}
    <circle cx="-19" cy="-83" r="9.5" fill="#2b2233" stroke="${OL}" stroke-width="2.2"/><circle cx="19" cy="-83" r="9.5" fill="#2b2233" stroke="${OL}" stroke-width="2.2"/>
    <circle cx="0" cy="-60" r="24" fill="#f6c7a0" stroke="${OL}" stroke-width="2.6"/>
    <path d="M-24.5 -58 Q-26 -86 0 -86 Q26 -86 24.5 -58 Q20 -70 12 -71 Q4 -62 -4 -71 Q-18 -72 -24.5 -58Z" fill="#2b2233"/>
    <path d="M-21 -74 Q0 -88 21 -74" stroke="#ffd23f" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="${starPath(0, -81, 5.5)}" fill="#ff6fa8" stroke="${OL}" stroke-width="1.2"/>
    ${face()}`,

  // fox pilot with goggles
  fox: () => `<path d="M12 -16 Q40 -18 38 -44 Q31 -32 14 -28Z" fill="#ff9447" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M38 -44 Q31 -32 26 -30 Q34 -38 34 -46Z" fill="#fff"/>
    ${body({ shirt: '#ff9447', pants: '#ff9447', arm: '#ff9447', shoe: '#5a3522',
      extra: '<ellipse cx="0" cy="-24" rx="9" ry="10" fill="#fff6ea"/><path d="M-15 -39 Q0 -30 15 -39 L12 -34 Q0 -26 -12 -34Z" fill="#2fb07a" stroke="#263553" stroke-width="1.8"/>' })}
    <path d="M-22 -70 L-26 -94 L-6 -80Z M22 -70 L26 -94 L6 -80Z" fill="#ff9447" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M-20 -76 L-22 -88 L-12 -80Z M20 -76 L22 -88 L12 -80Z" fill="#ffc2a8"/>
    <ellipse cx="0" cy="-60" rx="25" ry="22" fill="#ff9447" stroke="${OL}" stroke-width="2.6"/>
    <path d="M-22 -54 Q-12 -58 0 -50 Q12 -58 22 -54 Q16 -38 0 -39 Q-16 -38 -22 -54Z" fill="#fff6ea"/>
    <path d="M-24 -74 Q0 -80 24 -74" stroke="#5a3522" stroke-width="4" fill="none"/>
    <circle cx="-9" cy="-75" r="6" fill="#7fd6ff" stroke="${OL}" stroke-width="2"/><circle cx="9" cy="-75" r="6" fill="#7fd6ff" stroke="${OL}" stroke-width="2"/>
    <circle cx="-10.5" cy="-76.5" r="1.8" fill="#fff"/><circle cx="7.5" cy="-76.5" r="1.8" fill="#fff"/>
    ${face(-60, 9)}<ellipse cx="0" cy="-52.5" rx="3.4" ry="2.4" fill="${OL}"/>`,

  // panda with a rescue helmet + lamp
  panda: () => `${body({ shirt: '#fff', pants: '#2b2b35', arm: '#2b2b35', shoe: '#2b2b35',
      extra: '<path d="M-17 -30 H17 V-24 H-17Z" fill="#ff8a1f"/><path d="M-17 -30 H17" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/>' })}
    <circle cx="-22" cy="-72" r="8" fill="#2b2b35"/><circle cx="22" cy="-72" r="8" fill="#2b2b35"/>
    <circle cx="0" cy="-58" r="24" fill="#fff" stroke="${OL}" stroke-width="2.6"/>
    <ellipse cx="-9.5" cy="-56" rx="6.5" ry="8" fill="#2b2b35" transform="rotate(20 -9.5 -56)"/><ellipse cx="9.5" cy="-56" rx="6.5" ry="8" fill="#2b2b35" transform="rotate(-20 9.5 -56)"/>
    <path d="M-23 -66 Q-22 -91 0 -91 Q22 -91 23 -66Z" fill="#ffc933" stroke="${OL}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M-26 -66 H26" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="0" cy="-79" r="6" fill="#fff8c2" stroke="${OL}" stroke-width="2"/>
    ${face(-56, 9.5, '#fff')}<ellipse cx="0" cy="-49.5" rx="3" ry="2.2" fill="${OL}"/>`,

  // little dino explorer
  dino: () => `<path d="M-12 -18 Q-38 -14 -40 -34 Q-30 -26 -14 -30Z" fill="#6fd36b" stroke="${OL}" stroke-width="2.2" stroke-linejoin="round"/>
    ${body({ shirt: '#6fd36b', pants: '#6fd36b', arm: '#6fd36b', shoe: '#3f9a47',
      extra: '<ellipse cx="0" cy="-25" rx="10" ry="11" fill="#fff3b8"/><path d="M-17 -34 L-12 -38 M17 -34 L12 -38" stroke="#ff9f1c" stroke-width="3" stroke-linecap="round"/>' })}
    <path d="M-12 -82 L-8 -94 L-2 -84 L4 -96 L9 -84 L16 -92 L17 -78Z" fill="#ffb020" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="-25" y="-83" width="50" height="46" rx="21" fill="#6fd36b" stroke="${OL}" stroke-width="2.6"/>
    <ellipse cx="0" cy="-47" rx="15" ry="7" fill="#8fe28b"/>
    <circle cx="-4" cy="-47" r="1.3" fill="${OL}"/><circle cx="4" cy="-47" r="1.3" fill="${OL}"/>
    ${face(-62, 9)}`,

  // squirrel scout: big curly tail, tufted ears, buck teeth, acorn badge
  squirrel: () => `<path d="M8 -14 Q44 -10 44 -46 Q44 -84 14 -86 Q0 -86 2 -74 Q24 -76 28 -56 Q32 -36 10 -30Z" fill="#c9773a" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M16 -24 Q37 -26 37 -48 Q37 -74 18 -79 Q30 -68 31 -52 Q32 -34 16 -24Z" fill="#eaa76a"/>
    ${body({ shirt: '#2fb07a', pants: '#b8692f', arm: '#c9773a', shoe: '#6b3f1d',
      extra: '<ellipse cx="0" cy="-23" rx="4.6" ry="5.2" fill="#b0692d" stroke="#263553" stroke-width="1.4"/><path d="M-5.5 -26.5 Q0 -32 5.5 -26.5Z" fill="#6b3f1d" stroke="#263553" stroke-width="1.2"/>' })}
    <path d="M-22 -68 Q-28 -90 -10 -82Z M22 -68 Q28 -90 10 -82Z" fill="#c9773a" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M-20 -72 Q-24 -84 -14 -80Z M20 -72 Q24 -84 14 -80Z" fill="#ffc2a8"/>
    <circle cx="0" cy="-60" r="24" fill="#d98a47" stroke="${OL}" stroke-width="2.6"/>
    <path d="M-5 -83 Q0 -74 5 -83" stroke="#8a4c20" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="0" cy="-48" rx="13" ry="9" fill="#fff1dc"/>
    ${face(-60, 9)}<ellipse cx="0" cy="-53" rx="3.2" ry="2.3" fill="${OL}"/>
    <rect x="-2.6" y="-47.6" width="5.2" height="4.6" rx="1.2" fill="#fff" stroke="${OL}" stroke-width="1.1"/>`,

  // turtle adventurer: shell on the back, blue bandana
  turtle: () => `<ellipse cx="0" cy="-27" rx="27" ry="25" fill="#2f7d47" stroke="${OL}" stroke-width="2.4"/>
    <ellipse cx="0" cy="-27" rx="22" ry="20" fill="#4fae63"/>
    <path d="M-22 -34 l6 3 M-23 -20 l6 -2 M22 -34 l-6 3 M23 -20 l-6 -2" stroke="#2f7d47" stroke-width="2.2" stroke-linecap="round"/>
    ${body({ shirt: '#f3e3a1', pants: '#7cc96b', arm: '#7cc96b', shoe: '#4f9a44',
      extra: '<path d="M-12 -32 H12 M-13 -25 H13 M-11 -18 H11 M0 -39 V-13" stroke="#c9ad5f" stroke-width="1.8" stroke-linecap="round"/>' })}
    <ellipse cx="0" cy="-60" rx="24" ry="22" fill="#7cc96b" stroke="${OL}" stroke-width="2.6"/>
    <circle cx="-13" cy="-73" r="2.6" fill="#5fae55"/><circle cx="-4" cy="-78" r="2" fill="#5fae55"/><circle cx="14" cy="-74" r="2.2" fill="#5fae55"/>
    <path d="M-23 -68 Q0 -77 23 -68 L23 -63 Q0 -71 -23 -63Z" fill="#3aa0ff" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M21 -66 L33 -73 L31 -63Z M21 -66 L34 -62 L27 -56Z" fill="#3aa0ff" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/>
    ${face(-56, 9)}`,

  // bunny in a yellow raincoat with a red scarf
  rabbit: () => `<g transform="rotate(-8 -10 -80)"><ellipse cx="-10" cy="-86" rx="7" ry="16" fill="#fbf7f2" stroke="${OL}" stroke-width="2.4"/><ellipse cx="-10" cy="-86" rx="3.4" ry="11" fill="#ffc2d1"/></g>
    <g transform="rotate(22 10 -78)"><ellipse cx="10" cy="-86" rx="7" ry="16" fill="#fbf7f2" stroke="${OL}" stroke-width="2.4"/><ellipse cx="10" cy="-86" rx="3.4" ry="11" fill="#ffc2d1"/></g>
    ${body({ shirt: '#ffc933', pants: '#f2ece4', arm: '#ffc933', shoe: '#e0d6ca',
      extra: '<path d="M-15 -39 Q0 -30 15 -39 L13 -33 Q0 -25 -13 -33Z" fill="#ff5a5f" stroke="#263553" stroke-width="1.8"/><path d="M8 -33 l3 11 l5 -2 l-3 -10Z" fill="#ff5a5f" stroke="#263553" stroke-width="1.5" stroke-linejoin="round"/>' })}
    <circle cx="0" cy="-60" r="23" fill="#fbf7f2" stroke="${OL}" stroke-width="2.6"/>
    ${face(-60, 9)}<path d="M-3.2 -53.6 h6.4 l-3.2 3.4z" fill="#ff8fb1" stroke="${OL}" stroke-width="1" stroke-linejoin="round"/>
    <path d="M-12 -50 h-9 M-12 -47 l-8 3 M12 -50 h9 M12 -47 l8 3" stroke="#b9ada0" stroke-width="1.4" stroke-linecap="round"/>`,
};

// Language-neutral ids (saved in the profile); names come from i18n ('av.<id>').
export const AVATARS = ['bip', 'cap', 'buns', 'fox', 'panda', 'dino', 'squirrel', 'turtle', 'rabbit'].map((id) => ({ id }));

export function avatar(avatarId, x, y, s = 1, id = '', mood = '') {
  const art = AVATAR_ART[avatarId] || AVATAR_ART.bip;
  return `<g ${id ? `id="${id}"` : ''} class="bip-pos" transform="translate(${x} ${y}) scale(${s})" data-x="${x}" data-y="${y}" data-s="${s}">
  <g class="bip av-${avatarId} ${mood}">
    <ellipse cx="0" cy="0" rx="22" ry="5" fill="#0b1b33" opacity=".18"/>
    <g class="bip-float">${art()}</g>
  </g></g>`;
}

// The player's hero, drawn with the avatar picked in the profile.
export const hero = (x, y, s = 1, id = '', mood = '') => avatar(getState().profile.avatarId, x, y, s, id, mood);

// Standalone avatar picture (hint bubble, profile, home, album).
export const avatarSvg = (avatarId, mood = 'happy', cls = 'bip-avatar') =>
  svgWrap(avatar(avatarId, 40, 97, 0.9, '', mood), { vb: '0 0 80 100', cls });
export const heroAvatar = (mood = 'happy') => avatarSvg(getState().profile.avatarId, mood);

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

// Evenly spread `count` group centres across horizontal spans ([[x0, x1], …]) — used by scenes that
// draw a × b as b groups of a things. Returns { xs, cell } (cell = width available per group).
export function spreadGroups(count, spans, maxCell = 46) {
  const total = spans.reduce((s, [a, b]) => s + (b - a), 0);
  const cell = Math.min(maxCell, total / count);
  const used = cell * count;
  const xs = [];
  // walk the spans as one continuous strip, centred inside the total width
  let offset = (total - used) / 2 + cell / 2;
  for (let k = 0; k < count; k++, offset += cell) {
    let o = offset;
    for (const [a, b] of spans) {
      if (o <= b - a) { xs.push(a + o); break; }
      o -= b - a;
    }
  }
  return { xs, cell };
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
