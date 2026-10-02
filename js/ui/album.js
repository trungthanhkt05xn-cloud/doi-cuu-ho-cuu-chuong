// "Sổ cứu hộ" — badges, rescued friends (stickers) and a simple strength view per multiplication table.
import { ZONES, zoneMissions } from '../game/catalog.js';
import { getState, nickname } from '../state.js';
import { heroAvatar } from './art.js';
import { tableStrength, TABLES } from '../learning/engine.js';
import { totalStars } from '../game/progression.js';
import { play, unlockAudio } from '../audio.js';
import { t, zoneName, badgeName, npcName } from '../i18n.js';

// Mastery stays numeric inside the engine; children only see 4 friendly stages (+ "not met yet").
// Labels: i18n 'stage.<id>' (legend) / 'stageShort.<id>' (under each gem, must fit a narrow cell).
const STAGES = [
  { id: 'new', icon: '🌱', fill: 0.25 },
  { id: 'grow', icon: '💪', fill: 0.5 },
  { id: 'ok', icon: '✨', fill: 0.75 },
  { id: 'strong', icon: '⭐', fill: 1 },
];
function stageOf(value) {
  return STAGES[value >= 0.8 ? 3 : value >= 0.5 ? 2 : value >= 0.25 ? 1 : 0];
}

function gem(n) {
  const { value, seen } = tableStrength(n);
  const st = seen ? stageOf(value) : null;
  const level = st ? st.id : 'none';
  const label = st ? t('stageShort.' + st.id) : '';
  const icon = st ? st.icon : '🔒';
  const fillY = 52 - 44 * (st ? st.fill : 0);
  return `<div class="gem ${level}" aria-label="${t('bk.table', { t: n, s: st ? t('stage.' + st.id) : t('bk.notMet') })}">
    <svg viewBox="0 0 44 58" aria-hidden="true"><defs><clipPath id="gc${n}"><path d="M22 4 L40 18 L34 52 L10 52 L4 18Z"/></clipPath></defs>
      <path d="M22 4 L40 18 L34 52 L10 52 L4 18Z" class="gem-bg"/>
      <rect clip-path="url(#gc${n})" x="0" y="${fillY}" width="44" height="60" class="gem-fill"/>
      <path d="M22 4 L40 18 L34 52 L10 52 L4 18Z" class="gem-edge"/><path d="M4 18 H40 M22 4 L16 18 L22 52 M22 4 L28 18 L22 52" class="gem-facet"/></svg>
    <b>×${n}</b><small>${icon} ${label}</small></div>`;
}

export function renderAlbum(host, { onBack, onEditProfile }) {
  const p = getState().progress;
  const badges = ZONES.map((z) => {
    const got = p.badges.includes(z.id);
    return `<div class="badge ${got ? 'got' : ''}" style="--zc:${z.color}"><div class="medal">${got ? z.badge.icon : '?'}</div><small>${got ? badgeName(z) : zoneName(z)}</small></div>`;
  }).join('');
  const stickers = ZONES.map((z) => `<div class="sticker-row"><h4 style="--zc:${z.color}">${zoneName(z)}</h4><div class="stickers">${
    zoneMissions(z.id).map((m) => {
      const got = p.stickers.includes(m.id);
      return `<div class="sticker ${got ? 'got' : ''} ${m.finale ? 'finale' : ''}" title="${got ? npcName(m) : '???'}"><span>${got ? m.npc.e : '?'}</span><small>${got ? npcName(m) : '???'}</small></div>`;
    }).join('')}</div></div>`).join('');

  host.innerHTML = `
  <div class="album-screen">
    <header class="topbar"><button class="icon-btn" data-act="back" aria-label="${t('ui.back')}">←</button><h1>${t('bk.title')}</h1>
      <div class="pill stars-pill"><span class="star-ic">⭐</span><b>${totalStars()}</b></div></header>
    <div class="album-scroll">
      <section class="card me-card"><div class="me-av">${heroAvatar('happy')}</div><div class="me-name"><small>${t('bk.captain')}</small><b class="nick"></b></div>
        <button class="btn btn-light" data-act="profile">${t('bk.change')}</button></section>
      <section class="card"><h3>${t('bk.badges')}</h3><div class="badges">${badges}</div></section>
      <section class="card"><h3>${t('bk.friends')} <span class="count">${p.stickers.length}/15</span></h3>${stickers}</section>
      <section class="card"><h3>${t('bk.power')}</h3><p class="muted">${t('bk.legend')} ${STAGES.map((s) => `${s.icon} ${t('stage.' + s.id)}`).join(' → ')}</p><div class="gems">${TABLES.map(gem).join('')}</div></section>
      <section class="card learner-note"><p>🌱 ${t('garden.book')}${getState().pulse.blooms.length ? ' 🦋' : ''}</p></section>
    </div>
  </div>`;
  host.querySelector('.me-card .nick').textContent = nickname();   // user text: textContent only
  host.querySelector('[data-act="back"]').addEventListener('click', () => { unlockAudio(); play('tap'); onBack(); });
  host.querySelector('[data-act="profile"]').addEventListener('click', () => { unlockAudio(); play('tap'); onEditProfile(); });
}
