// App shell: boot, screen routing (with history so iOS swipe-back stays in the game), Home, Settings.
import { load, save, getState, hasSave, hasProfile, nickname, resetProgress } from './state.js';
import { setSoundEnabled, setMusicEnabled, setMusic, unlockAudio, play, initAudio } from './audio.js';
import { t, setLang, getLang, missionText } from './i18n.js';
import { renderMap } from './ui/map.js';
import { renderMission } from './ui/missionView.js';
import { renderAlbum } from './ui/album.js';
import { renderProfile } from './ui/profile.js';
import { hero, heroAvatar, cloud, roundTree, pine, house, windmill, lighthouse, palm, crystal, emo, THEMES } from './ui/art.js';
import { totalStars, currentMission, allDone } from './game/progression.js';
import { beginVisit } from './game/worldPulse.js';

const screens = {
  home: document.getElementById('screen-home'),
  map: document.getElementById('screen-map'),
  mission: document.getElementById('screen-mission'),
  album: document.getElementById('screen-album'),
  profile: document.getElementById('screen-profile'),
};
let currentScreen = null;
let navToken = 0;

// Screen swap without a blank frame: the new screen is built on top of the old one (which stays
// painted underneath), fades in over ~180 ms, then the old one is hidden and its DOM freed.
function show(name, params = {}, mode = 'push') {
  if (currentScreen === 'mission' && name !== 'mission' && screens.mission.missionCleanup) screens.mission.missionCleanup();
  const prev = currentScreen && currentScreen !== name ? screens[currentScreen] : null;
  const next = screens[name];
  currentScreen = name;
  const token = ++navToken;
  if (prev) prev.classList.add('leaving');
  next.classList.add('active', 'entering');
  // Home / Rescue Book / profile share the light map theme; the map and missions pick their own music.
  if (name === 'home' || name === 'album' || name === 'profile') setMusic('map');
  if (name === 'home') renderHome();
  if (name === 'map') renderMap(screens.map, mapHandlers, params);
  if (name === 'mission') renderMission(screens.mission, params.id, { ...missionHandlers, pulse: params.pulse });
  if (name === 'album') renderAlbum(screens.album, { onBack: () => show('map', {}, 'replace'), onEditProfile: () => show('profile', { mode: 'edit' }) });
  if (name === 'profile') {
    const done = () => show(params.mode === 'edit' ? 'album' : 'map', {}, 'replace');
    renderProfile(screens.profile, { mode: params.mode, onDone: done, onBack: () => show(params.mode === 'edit' ? 'album' : 'home', {}, 'replace') });
  }
  const settle = () => {
    if (token !== navToken) return;   // a newer navigation will settle
    Object.entries(screens).forEach(([k, el]) => {
      el.classList.remove('entering', 'leaving');
      if (k === currentScreen) return;
      el.classList.remove('active');
      if (k !== 'home') el.innerHTML = ''; // free DOM of hidden screens
    });
  };
  if (prev) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      next.classList.remove('entering');
      setTimeout(settle, 200);
    }));
  } else {
    next.classList.remove('entering');
    settle();
  }
  try {
    const entry = { s: name === 'mission' ? 'map' : name };
    if (mode === 'push') history.pushState(entry, '');
    else if (mode === 'replace') history.replaceState(entry, '');
  } catch (e) { /* history may be unavailable in some embeds */ }
}

const mapHandlers = {
  onPlay: (id, pulse = null) => show('mission', { id, pulse }),
  onHome: () => show('home', {}, 'replace'),
  onAlbum: () => show('album'),
  onSettings: () => openSettings(),
};
const missionHandlers = {
  onExit: () => show('map', {}, 'replace'),
  onDone: (mission, reward) => show('map', { justCompleted: mission.id, reward }, 'replace'),
};

window.addEventListener('popstate', (e) => {
  const s = (e.state && e.state.s) || 'home';
  closeSettings();
  show(screens[s] ? s : 'home', {}, 'none');
});

// ── Home ──
function homeArt() {
  const V = THEMES.village, C = THEMES.cove;
  return `<svg class="home-art" viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5bbcf2"/><stop offset=".6" stop-color="#bfe9ff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient>
    <radialGradient id="h-sun"><stop offset="0" stop-color="#fff8c2"/><stop offset=".5" stop-color="#ffe066"/><stop offset=".52" stop-color="#ffe066" stop-opacity=".35"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
    <linearGradient id="h-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cc6ea"/><stop offset="1" stop-color="#1a9fd0"/></linearGradient></defs>
    <rect x="-300" y="-100" width="1000" height="900" fill="url(#h-sky)"/>
    <circle cx="320" cy="120" r="60" fill="url(#h-sun)"/>
    <g class="drift">${cloud(70, 90, 1.1)}${cloud(250, 60, 0.8, 0.9)}</g>${cloud(-40, 170, 1)}${cloud(460, 180, 1.1)}
    <rect x="-300" y="400" width="1000" height="80" fill="url(#h-sea)"/>
    ${lighthouse(352, 412, 0.7)}${crystal(300, 408, 0.5, C.crystal, C.crystal2)}${palm(270, 408, 0.5)}
    <path d="M-300 440 Q-60 360 120 420 Q220 450 330 430 Q520 400 700 440 L700 900 L-300 900Z" fill="#2c7a58"/>
    ${[...Array(10)].map((_, i) => pine(-20 + i * 30, 440 + (i % 3) * 6, 0.7 + (i % 2) * 0.15, '#2a8a5f', '#1d6d41')).join('')}
    <path d="M-300 520 Q-40 470 150 505 Q300 530 700 490 L700 900 L-300 900Z" fill="${V.mid}"/>
    ${house(300, 520, 1)}${house(354, 530, 0.8, '#6fa8ff')}${windmill(70, 520, 0.9)}${roundTree(-6, 540, 1, V.leaf, V.leafDark)}${roundTree(410, 546, 1, V.leaf, V.leafDark)}
    <path d="M-300 600 Q60 560 200 590 Q330 615 700 580 L700 900 L-300 900Z" fill="${V.ground}"/>
    <path d="M150 700 Q180 640 200 600 Q220 640 250 700Z" fill="${V.path}" opacity=".9"/>
    <g class="home-npcs">${emo(300, 598, 30, '🦆')}${emo(342, 606, 28, '🐱')}${emo(64, 604, 28, '🦉')}${emo(100, 612, 26, '🦦')}</g>
    ${hero(200, 668, 1.35, 'home-bip', 'happy')}
  </svg>`;
}

function renderHome() {
  const saved = hasSave();
  const stars = totalStars();
  const next = saved ? currentMission() : null;
  screens.home.innerHTML = `
  <div class="home">
    ${homeArt()}
    <div class="home-top">
      <button class="icon-btn" data-act="sound" aria-label="${t('ui.sound')}" aria-pressed="${getState().settings.sound}">${getState().settings.sound ? '🔊' : '🔇'}</button>
      <button class="icon-btn music-btn ${getState().settings.music ? '' : 'off'}" data-act="music" aria-label="${t('ui.music')}" aria-pressed="${getState().settings.music}">🎵</button>
      <button class="icon-btn" data-act="settings" aria-label="${t('ui.settings')}">⚙️</button>
    </div>
    <div class="home-center">
      <div class="logo">
        <h1><span>${t('home.title1')}</span><span class="accent">${t('home.title2')}</span></h1>
        <div class="logo-sub">${t('home.sub')}</div>
      </div>
      <div class="home-actions">
        ${saved && hasProfile() ? `<div class="home-hello">${heroAvatar('happy')}<span>${t('home.hello', { nick: '<b class="nick"></b>' })}</span></div>` : ''}
        ${saved ? `<button class="btn btn-primary big" data-act="continue">${t('home.continue')}</button>
          <div class="home-meta">${t('home.stars', { n: stars })}${next ? t('home.next', { m: `${next.npc.e} ${missionText(next, 'title')}` }) : allDone() ? t('home.hero') : ''}</div>` : `<button class="btn btn-primary big" data-act="start">${t('home.start')}</button>`}
      </div>
    </div>
  </div>`;
  screens.home.querySelectorAll('.nick').forEach((n) => { n.textContent = nickname(); });   // user text: textContent only
}

screens.home.addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  unlockAudio();
  const act = b.dataset.act;
  if (act === 'start' || act === 'continue') {
    getState().started = true;
    save();
    play('tap');
    // First time (or a save from before profiles existed): pick an identity once, progress untouched.
    show(hasProfile() ? 'map' : 'profile', { mode: 'onboard' });
  } else if (act === 'sound') {
    toggleSound();
    b.textContent = getState().settings.sound ? '🔊' : '🔇';
    b.setAttribute('aria-pressed', String(getState().settings.sound));
  } else if (act === 'music') {
    toggleMusic();
    b.classList.toggle('off', !getState().settings.music);
    b.setAttribute('aria-pressed', String(getState().settings.music));
  } else if (act === 'settings') {
    play('tap');
    openSettings();
  }
});

// ── Settings (single light sheet) ──
const sheetRoot = document.getElementById('sheet-root');

function toggleSound() {
  const s = getState().settings;
  s.sound = !s.sound;
  setSoundEnabled(s.sound);
  save();
  play('tap');
}

// Music and Sound are independent; both are device preferences saved in settings.
function toggleMusic() {
  const s = getState().settings;
  s.music = !s.music;
  setMusicEnabled(s.music);
  save();
  play('tap');
}

function openSettings() {
  const renderSheet = () => {
    const on = getState().settings.sound;
    const mOn = getState().settings.music;
    sheetRoot.innerHTML = `
    <div class="sheet-backdrop" data-act="close"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${t('set.title')}">
      <h2>${t('set.title')}</h2>
      <button class="setting-row" data-act="sound" aria-pressed="${on}"><span>${on ? '🔊' : '🔇'} ${t('set.sound')}</span><span class="toggle ${on ? 'on' : ''}"><i></i></span></button>
      <button class="setting-row" data-act="music" aria-pressed="${mOn}"><span>🎵 ${t('set.music')}</span><span class="toggle ${mOn ? 'on' : ''}"><i></i></span></button>
      <div class="setting-row lang-row" role="group" aria-label="${t('set.lang')}"><span>🌐 ${t('set.lang')}</span>
        <span class="seg">${[['vi', 'Tiếng Việt'], ['en', 'English']].map(([id, label]) =>
          `<button class="seg-btn ${getLang() === id ? 'on' : ''}" data-act="lang" data-lang="${id}" lang="${id}" aria-pressed="${getLang() === id}">${label}</button>`).join('')}</span></div>
      <div class="reset-zone">
        <button class="setting-row danger" data-act="ask-reset"><span>🗑️ ${t('set.reset')}</span><span>›</span></button>
        <div class="confirm" hidden>
          <p>${t('set.resetAsk')}</p>
          <div class="row"><button class="btn btn-light" data-act="cancel-reset">${t('set.resetNo')}</button><button class="btn btn-danger" data-act="do-reset">${t('set.resetYes')}</button></div>
        </div>
      </div>
      <button class="btn btn-primary" data-act="close">${t('ui.done')}</button>
    </div>`;
    sheetRoot.classList.add('open');
  };
  renderSheet();
  sheetRoot.onclick = (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    unlockAudio();
    const act = b.dataset.act;
    if (act === 'close') { play('tap'); closeSettings(); }
    else if (act === 'sound') { toggleSound(); renderSheet(); }
    else if (act === 'music') { toggleMusic(); renderSheet(); }
    else if (act === 'lang') {
      play('tap');
      if (b.dataset.lang !== getLang()) { applyLanguage(b.dataset.lang); renderSheet(); }
    }
    else if (act === 'ask-reset') { play('tap'); sheetRoot.querySelector('.confirm').hidden = false; }
    else if (act === 'cancel-reset') { play('tap'); sheetRoot.querySelector('.confirm').hidden = true; }
    else if (act === 'do-reset') {
      resetProgress();
      closeSettings();
      show('home', {}, 'replace');
    }
  };
}

// Switch language live: save it, retitle the page, redraw whatever screen sits under the sheet.
function applyLanguage(lang) {
  getState().settings.language = lang;
  save();
  setLang(lang);
  labelScreens();
  if (currentScreen === 'home') renderHome();
  else if (currentScreen === 'map') show('map', {}, 'none');
}

function labelScreens() {
  Object.entries(screens).forEach(([k, el]) => el.setAttribute('aria-label', t(`screen.${k}`)));
}

function closeSettings() {
  sheetRoot.classList.remove('open');
  sheetRoot.innerHTML = '';
  if (currentScreen === 'home') renderHome();
  else if (currentScreen === 'map') {
    const pill = screens.map.querySelector('.stars-pill b');
    if (pill) pill.textContent = totalStars();
  }
}

// ── Boot ──
load();
beginVisit();
setLang(getState().settings.language);
labelScreens();
setSoundEnabled(getState().settings.sound);
setMusicEnabled(getState().settings.music);
// Audio unlock + recovery (iOS/iPadOS gesture + lifecycle rules live in audio.js).
initAudio();
// iOS: enable :active styles on touch.
document.addEventListener('touchstart', () => {}, { passive: true });
// Prevent pinch/double-tap zoom gestures inside the game surface (iOS ignores user-scalable=no).
document.addEventListener('gesturestart', (e) => e.preventDefault());
show('home', {}, 'replace');
