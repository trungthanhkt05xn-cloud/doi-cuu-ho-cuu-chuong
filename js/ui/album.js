// "Sổ cứu hộ" — badges, rescued friends (stickers) and a simple strength view per multiplication table.
import { ZONES, zoneMissions } from '../game/catalog.js';
import { getState, nickname } from '../state.js';
import { heroAvatar } from './art.js';
import { tableStrength, TABLES } from '../learning/engine.js';
import { totalStars } from '../game/progression.js';
import { play, unlockAudio } from '../audio.js';

// Mastery stays numeric inside the engine; children only see 4 friendly stages (+ "not met yet").
const STAGES = [
  { id: 'new', label: 'Mới gặp', icon: '🌱', fill: 0.25 },
  { id: 'grow', label: 'Đang nhớ', icon: '💪', fill: 0.5 },
  { id: 'ok', label: 'Gần thuộc', icon: '✨', fill: 0.75 },
  { id: 'strong', label: 'Đã thuộc', icon: '⭐', fill: 1 },
];
function stageOf(value) {
  return STAGES[value >= 0.8 ? 3 : value >= 0.5 ? 2 : value >= 0.25 ? 1 : 0];
}

function gem(t) {
  const { value, seen } = tableStrength(t);
  const st = seen ? stageOf(value) : null;
  const level = st ? st.id : 'none';
  const label = st ? st.label : '';
  const icon = st ? st.icon : '🔒';
  const fillY = 52 - 44 * (st ? st.fill : 0);
  return `<div class="gem ${level}" aria-label="Bảng ${t}: ${label || 'chưa gặp'}">
    <svg viewBox="0 0 44 58" aria-hidden="true"><defs><clipPath id="gc${t}"><path d="M22 4 L40 18 L34 52 L10 52 L4 18Z"/></clipPath></defs>
      <path d="M22 4 L40 18 L34 52 L10 52 L4 18Z" class="gem-bg"/>
      <rect clip-path="url(#gc${t})" x="0" y="${fillY}" width="44" height="60" class="gem-fill"/>
      <path d="M22 4 L40 18 L34 52 L10 52 L4 18Z" class="gem-edge"/><path d="M4 18 H40 M22 4 L16 18 L22 52 M22 4 L28 18 L22 52" class="gem-facet"/></svg>
    <b>×${t}</b><small>${icon} ${label}</small></div>`;
}

export function renderAlbum(host, { onBack, onEditProfile }) {
  const p = getState().progress;
  const badges = ZONES.map((z) => {
    const got = p.badges.includes(z.id);
    return `<div class="badge ${got ? 'got' : ''}" style="--zc:${z.color}"><div class="medal">${got ? z.badge.icon : '?'}</div><small>${got ? z.badge.name : z.name}</small></div>`;
  }).join('');
  const stickers = ZONES.map((z) => `<div class="sticker-row"><h4 style="--zc:${z.color}">${z.name}</h4><div class="stickers">${
    zoneMissions(z.id).map((m) => {
      const got = p.stickers.includes(m.id);
      return `<div class="sticker ${got ? 'got' : ''} ${m.finale ? 'finale' : ''}" title="${got ? m.npc.name : '???'}"><span>${got ? m.npc.e : '?'}</span><small>${got ? m.npc.name : '???'}</small></div>`;
    }).join('')}</div></div>`).join('');

  host.innerHTML = `
  <div class="album-screen">
    <header class="topbar"><button class="icon-btn" data-act="back" aria-label="Quay lại">←</button><h1>Sổ Cứu Hộ</h1>
      <div class="pill stars-pill"><span class="star-ic">⭐</span><b>${totalStars()}</b></div></header>
    <div class="album-scroll">
      <section class="card me-card"><div class="me-av">${heroAvatar('happy')}</div><div class="me-name"><small>Đội trưởng</small><b class="nick"></b></div>
        <button class="btn btn-light" data-act="profile">✏️ Đổi</button></section>
      <section class="card"><h3>Huy hiệu</h3><div class="badges">${badges}</div></section>
      <section class="card"><h3>Bạn bè đã cứu <span class="count">${p.stickers.length}/15</span></h3>${stickers}</section>
      <section class="card"><h3>Sức mạnh cửu chương</h3><p class="muted">Pha lê sáng dần: 🌱 Mới gặp → 💪 Đang nhớ → ✨ Gần thuộc → ⭐ Đã thuộc</p><div class="gems">${TABLES.map(gem).join('')}</div></section>
    </div>
  </div>`;
  host.querySelector('.me-card .nick').textContent = nickname();   // user text: textContent only
  host.querySelector('[data-act="back"]').addEventListener('click', () => { unlockAudio(); play('tap'); onBack(); });
  host.querySelector('[data-act="profile"]').addEventListener('click', () => { unlockAudio(); play('tap'); onEditProfile(); });
}
