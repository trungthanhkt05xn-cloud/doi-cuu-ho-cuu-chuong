// "Sổ cứu hộ" — badges, rescued friends (stickers) and a simple strength view per multiplication table.
import { ZONES, zoneMissions } from '../game/catalog.js';
import { getState } from '../state.js';
import { tableStrength, TABLES } from '../learning/engine.js';
import { totalStars } from '../game/progression.js';
import { play, unlockAudio } from '../audio.js';

function gem(t) {
  const { value, seen } = tableStrength(t);
  const pct = Math.round(value * 100);
  const level = !seen ? 'none' : value >= 0.75 ? 'strong' : value >= 0.4 ? 'ok' : 'grow';
  const label = { none: 'Chưa gặp', strong: 'Rất giỏi', ok: 'Khá rồi', grow: 'Đang lớn' }[level];
  const icon = { none: '·', strong: '⭐', ok: '💪', grow: '🌱' }[level];
  const fillY = 52 - 44 * value;
  return `<div class="gem ${level}">
    <svg viewBox="0 0 44 58" aria-hidden="true"><defs><clipPath id="gc${t}"><path d="M22 4 L40 18 L34 52 L10 52 L4 18Z"/></clipPath></defs>
      <path d="M22 4 L40 18 L34 52 L10 52 L4 18Z" class="gem-bg"/>
      <rect clip-path="url(#gc${t})" x="0" y="${fillY}" width="44" height="60" class="gem-fill"/>
      <path d="M22 4 L40 18 L34 52 L10 52 L4 18Z" class="gem-edge"/><path d="M4 18 H40 M22 4 L16 18 L22 52 M22 4 L28 18 L22 52" class="gem-facet"/></svg>
    <b>×${t}</b><small>${icon} ${label}</small><span class="sr">${pct}%</span></div>`;
}

export function renderAlbum(host, { onBack }) {
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
      <section class="card"><h3>Huy hiệu</h3><div class="badges">${badges}</div></section>
      <section class="card"><h3>Bạn bè đã cứu <span class="count">${p.stickers.length}/15</span></h3>${stickers}</section>
      <section class="card"><h3>Sức mạnh cửu chương</h3><p class="muted">Viên pha lê sáng dần khi bạn nhớ bảng nhân.</p><div class="gems">${TABLES.map(gem).join('')}</div></section>
    </div>
  </div>`;
  host.querySelector('[data-act="back"]').addEventListener('click', () => { unlockAudio(); play('tap'); onBack(); });
}
