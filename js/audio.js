// Tiny WebAudio synth — no audio files, no autoplay.
// iOS / iPadOS (Safari and every other iOS browser = WebKit) only lets an AudioContext start inside a
// real user activation (touchend / click / keydown — NOT a touch pointerdown), may leave it
// 'suspended' or 'interrupted' after backgrounding / calls / other audio, and occasionally keeps a
// context that never resumes. So: one context, created + resumed from activation events only, woken
// again on every later gesture / return to the foreground, and recreated only if it stays dead.
//
// V1.1: two buses under one master — SFX (Sound toggle) and a quiet procedural MUSIC layer (Music
// toggle). Music is never autoplayed: it only runs while the context is already running (i.e. after a
// real gesture), the page is visible and Music is on. It pauses with the context and never "catches up".
let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let noiseBuf = null;
let enabled = true;      // Sound (SFX)
let musicOn = true;      // Music
let deadChecks = 0;      // gestures after which the context still was not running
let checkPending = false;

export function setSoundEnabled(v) { enabled = !!v; }
export function setMusicEnabled(v) { musicOn = !!v; syncMusic(); }

const AC = () => window.AudioContext || window.webkitAudioContext;
const wakeable = () => ctx && ctx.state !== 'running' && ctx.state !== 'closed';

function createContext() {
  const C = AC();
  try { ctx = new C({ latencyHint: 'interactive' }); } catch (e) { ctx = new C(); }
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);
  noiseBuf = null;
  deadChecks = 0;
  stopMusicTimer();
  // running ↔ suspended / interrupted (calls, lock screen, backgrounding): start or pause the music.
  if (ctx.addEventListener) ctx.addEventListener('statechange', syncMusic);
  else ctx.onstatechange = syncMusic;
}

// Must run inside a user activation.
function unlockFromGesture() {
  try {
    if (!AC()) return;
    if (ctx && (ctx.state === 'closed' || deadChecks >= 2)) {   // broken context: replace it (rare)
      try { if (ctx.state !== 'closed') ctx.close(); } catch (e) { /* ignore */ }
      ctx = null;
    }
    if (!ctx) createContext();
    if (ctx.state === 'running') { deadChecks = 0; return; }
    // Play one silent frame inside the gesture — WebKit only really starts output when something plays.
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(master);
    src.start(0);
    Promise.resolve(ctx.resume()).catch(() => {});
    if (!checkPending && !document.hidden) {
      checkPending = true;
      const c = ctx;
      setTimeout(() => {
        checkPending = false;
        if (c === ctx && !document.hidden) deadChecks = c.state === 'running' ? 0 : deadChecks + 1;
      }, 600);
    }
  } catch (e) { /* audio is optional */ }
}

// Outside a gesture (UI handlers, focus, pageshow): only try to wake an existing context — never
// create one here (on iOS a context created outside an activation may never start).
export function unlockAudio() {
  if (wakeable()) Promise.resolve(ctx.resume()).catch(() => {});
}

function onGesture(e) {
  if (e.type === 'pointerdown' && e.pointerType !== 'mouse') return;   // touch pointerdown is not an activation
  if (!ctx || ctx.state !== 'running') unlockFromGesture();
}

/** Call once at boot. Listeners run in the capture phase, before any UI handler plays a sound. */
export function initAudio() {
  ['touchend', 'click', 'keydown', 'pointerdown'].forEach((t) => window.addEventListener(t, onGesture, { capture: true, passive: true }));
  // Background → suspend (no CPU while hidden). Foreground → try to resume right away; if WebKit
  // refuses without a gesture, the next tap (onGesture) resumes it.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { stopMusicTimer(); if (ctx.state === 'running') Promise.resolve(ctx.suspend()).catch(() => {}); }
    else { unlockAudio(); syncMusic(); }
  });
  window.addEventListener('pageshow', unlockAudio);   // back-forward cache restore
  window.addEventListener('focus', unlockAudio);
}

function tone(freq, t, dur, { type = 'sine', vol = 0.18, to = null, out = sfxBus, attack = 0.012 } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noise(t, dur, { vol = 0.2, freq = 800, q = 1, out = sfxBus, attack = 0 } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = noiseBuf;
  s.loop = dur > 0.45;
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  if (attack) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); } else g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out);
  s.start(t);
  s.stop(t + dur + 0.02);
}

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// Soft bell: fundamental + a quiet inharmonic partial, long gentle decay.
function bell(m, t, vol = 0.08, dur = 1.4, out = sfxBus) {
  tone(hz(m), t, dur, { vol, out, attack: 0.006 });
  tone(hz(m) * 2.76, t, dur * 0.45, { vol: vol * 0.22, out, attack: 0.004 });
}
// Every "group" sound walks up a pentatonic scale, so any number of groups stays in tune with the music.
const PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
const up = (k) => PENTA[Math.min(PENTA.length - 1, Math.max(0, k | 0))];

const SOUNDS = {
  tap: (t) => tone(620, t, 0.07, { vol: 0.1 }),
  key: (t) => tone(520, t, 0.05, { type: 'triangle', vol: 0.1 }),
  correct: (t) => [523, 659, 784].forEach((f, i) => tone(f, t + i * 0.07, 0.2, { type: 'triangle', vol: 0.16 })),
  wrong: (t) => { tone(349, t, 0.16, { vol: 0.09, to: 294 }); tone(294, t + 0.13, 0.2, { vol: 0.07, to: 262 }); },
  place: (t) => { noise(t, 0.09, { vol: 0.35, freq: 260 }); tone(160, t, 0.12, { vol: 0.2, to: 110 }); },
  unlock: (t) => { tone(1400, t, 0.03, { type: 'square', vol: 0.05 }); tone(900, t + 0.05, 0.05, { type: 'square', vol: 0.05 }); tone(660, t + 0.1, 0.25, { type: 'triangle', vol: 0.14, to: 990 }); },
  pop: (t) => tone(880, t, 0.09, { vol: 0.14, to: 330 }),
  deflate: (t) => tone(520, t, 0.4, { vol: 0.06, to: 180 }),
  whoosh: (t) => noise(t, 0.35, { vol: 0.12, freq: 1400, q: 0.6 }),
  lamp: (t) => { tone(440, t, 0.35, { vol: 0.1, to: 880 }); tone(1320, t + 0.12, 0.3, { vol: 0.05 }); },
  count: (t, k = 0) => tone(520 * Math.pow(1.06, Math.min(k, 12)), t, 0.07, { type: 'triangle', vol: 0.09 }),
  step: (t) => tone(300, t, 0.05, { type: 'triangle', vol: 0.06 }),
  star: (t) => { tone(1046, t, 0.28, { type: 'triangle', vol: 0.13 }); tone(1568, t + 0.05, 0.3, { vol: 0.06 }); },
  fanfare: (t) => {
    [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.38]].forEach(([f, d]) => tone(f, t + d, 0.3, { type: 'triangle', vol: 0.15 }));
    tone(1318, t + 0.55, 0.5, { type: 'triangle', vol: 0.12 });
    tone(784, t + 0.55, 0.5, { vol: 0.08 });
  },
  reveal: (t) => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.09, 0.35, { vol: 0.09 })),
  // ── V1.1 world actions (soft, pitched, never percussive while the child is thinking) ──
  firefly: (t, k = 0) => { bell(up(k) + 12, t, 0.07, 1.1); tone(hz(up(k) + 24), t + 0.04, 0.25, { vol: 0.02 }); },
  signal: (t, k = 0) => { tone(hz(up(k)), t, 0.22, { type: 'triangle', vol: 0.09 }); tone(hz(up(k) + 12), t + 0.06, 0.3, { vol: 0.035 }); },
  buoy: (t, k = 0) => bell(up(k) + 7, t, 0.09, 1.3),
  crank: (t, k = 0) => { noise(t, 0.05, { vol: 0.12, freq: 900, q: 2 }); noise(t + 0.12, 0.05, { vol: 0.1, freq: 1100, q: 2 }); tone(hz(up(k) - 12), t + 0.05, 0.3, { type: 'triangle', vol: 0.07, to: hz(up(k) - 5) }); },
  charge: (t) => { tone(330, t, 0.6, { vol: 0.07, to: 990 }); noise(t, 0.5, { vol: 0.03, freq: 3000, q: 0.8, attack: 0.2 }); },
  hint: (t) => { bell(76, t, 0.05, 0.8); bell(81, t + 0.1, 0.05, 1); },
  hoot: (t) => { tone(420, t, 0.28, { vol: 0.09, to: 370, attack: 0.05 }); tone(400, t + 0.36, 0.42, { vol: 0.08, to: 340, attack: 0.06 }); },
  ribbit: (t) => { tone(190, t, 0.1, { type: 'triangle', vol: 0.12, to: 260 }); tone(200, t + 0.14, 0.12, { type: 'triangle', vol: 0.12, to: 290 }); },
  // The world gets better: a warm rising chord that lands on a bell.
  restore: (t) => {
    [60, 64, 67, 72, 76].forEach((m, i) => tone(hz(m), t + i * 0.11, 1.2 - i * 0.1, { type: 'triangle', vol: 0.06, attack: 0.05 }));
    bell(84, t + 0.6, 0.07, 1.8);
    bell(88, t + 0.78, 0.05, 1.6);
  },
};

function fire(name, arg) {
  try { SOUNDS[name](ctx.currentTime + 0.01, arg); } catch (e) { /* ignore */ }
}

export function play(name, arg) {
  if (!enabled || !ctx || !SOUNDS[name]) return;
  if (ctx.state === 'running') { fire(name, arg); return; }
  if (ctx.state === 'closed') return;
  // Still waking up (e.g. the very first tap: resume() is async): play it if the context comes up
  // almost at once, otherwise drop it — a late sound is worse than none.
  const c = ctx;
  const t0 = Date.now();
  Promise.resolve(c.resume()).then(() => {
    if (c === ctx && enabled && c.state === 'running' && Date.now() - t0 < 350) fire(name, arg);
  }).catch(() => {});
}

// ══════════════ MUSIC ══════════════
// Procedural, quiet, steady. Tempo never changes, nothing ticks, nothing speeds up while a child thinks.
// One scheduler timer at most; notes are scheduled ≤ 0.45 s ahead so scene/layer changes land quickly.
//   'map'    — light Home / Map identity (C major pentatonic, marimba plucks over a soft pad)
//   'forest' — Whisper Woods: base pad + up to 3 restored layers (fireflies → signal → owl)
const MUSIC_VOL = 0.5;
const music = { scene: null, layers: 0, quiet: false, timer: null, next: 0, step: 0 };

function pad(ms, t, dur, vol, bright = 1200) {
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = bright;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(1.2, dur * 0.35));
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.6);
  f.connect(g);
  g.connect(musicBus);
  ms.forEach((m, i) => {
    const o = ctx.createOscillator();
    o.type = i ? 'sine' : 'triangle';
    o.frequency.value = hz(m);
    o.detune.value = (i % 2 ? 4 : -4);
    o.connect(f);
    o.start(t);
    o.stop(t + dur + 0.7);
  });
}
const pluck = (m, t, vol = 0.06, dur = 0.7) => tone(hz(m), t, dur, { type: 'triangle', vol, out: musicBus, attack: 0.006 });
const mbell = (m, t, vol = 0.035, dur = 1.6) => bell(m, t, vol, dur, musicBus);
function flute(m, t, dur, vol = 0.04) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  o.frequency.value = hz(m);
  lfo.frequency.value = 5;
  lg.gain.value = hz(m) * 0.006;
  lfo.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.12);
  g.gain.setValueAtTime(vol, t + dur * 0.75);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
  o.connect(g); g.connect(musicBus);
  o.start(t); lfo.start(t);
  o.stop(t + dur + 0.3); lfo.stop(t + dur + 0.3);
}

// 32 eighth-notes = 4 bars per loop.
const SCENES = {
  map: {
    dur: 60 / 84 / 2,
    step(s, t) {
      const bar = (s >> 3) % 4;
      const i = s % 32;
      const loop = Math.floor(s / 32);
      if (s % 8 === 0) {
        pad([[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]][bar], t, 8 * this.dur, 0.022);
        pluck([48, 45, 41, 43][bar], t, 0.07, 1.2);
      }
      if (s % 8 === 4) pluck([55, 52, 48, 50][bar], t, 0.05, 1);
      const tune = loop % 2 === 0
        ? { 0: 76, 2: 79, 4: 81, 6: 79, 8: 76, 11: 74, 12: 72, 16: 72, 18: 74, 20: 76, 22: 79, 24: 76, 26: 74 }
        : { 0: 72, 4: 76, 8: 74, 12: 72, 16: 69, 20: 72, 24: 74, 28: 79 };
      if (tune[i]) pluck(tune[i], t, loop % 2 ? 0.035 : 0.045, 0.9);
    },
  },
  forest: {
    dur: 60 / 66 / 2,
    step(s, t, layers) {
      const bar = (s >> 3) % 4;
      const i = s % 32;
      const bright = 700 + layers * 380;   // the forest literally opens up as it recovers
      if (s % 8 === 0) {
        pad([[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]][bar], t, 8 * this.dur, 0.024, bright);
        pluck([45, 41, 48, 43][bar], t, 0.06, 1.6);
      }
      if (i === 12 || i === 28) pluck([52, 48, 52, 50][bar], t, 0.035, 1.4);
      if (i === 16 && layers === 0) noise(t, 3, { vol: 0.012, freq: 500, q: 0.5, out: musicBus, attack: 1.2 });   // soft breeze
      // Layer 1 — fireflies: high soft bells
      if (layers >= 1) {
        const bells = { 3: [81, 84, 79, 86], 11: [88, 81, 84, 83], 22: [84, 88, 86, 79], 27: [76, 79, 81, 91] };
        if (bells[i % 32] && (i !== 27 || bar % 2 === 0)) mbell(bells[i][bar] || 84, t, 0.028, 1.8);
      }
      // Layer 2 — forest signal: a flowing arpeggio (quarter notes, soft attack — a pulse, not a tick)
      if (layers >= 2 && s % 2 === 0) {
        const arp = [[69, 72, 76, 72], [65, 69, 72, 69], [67, 72, 76, 72], [67, 71, 74, 71]][bar];
        pluck(arp[(s >> 1) % 4], t, 0.03, 0.8);
      }
      // Layer 3 — owl home: the forest sings its melody
      if (layers >= 3) {
        const mel = { 0: [76, 3], 4: [74, 2], 6: [72, 2], 8: [69, 6], 16: [72, 2], 18: [74, 2], 20: [76, 4], 24: [79, 3], 28: [76, 4] };
        if (mel[i]) flute(mel[i][0], t, mel[i][1] * this.dur, 0.035);
      }
    },
  },
};

function stopMusicTimer() {
  if (music.timer) { clearInterval(music.timer); music.timer = null; }
}

function schedule() {
  if (!ctx || ctx.state !== 'running' || document.hidden) { syncMusic(); return; }
  const S = SCENES[music.scene];
  if (!S) return;
  const now = ctx.currentTime;
  if (music.next < now - 0.1) music.next = now + 0.06;   // back from a pause: continue, never catch up
  try {
    while (music.next < now + 0.45) {
      S.step(music.step, music.next, music.layers);
      music.next += S.dur;
      music.step += 1;
    }
  } catch (e) { stopMusicTimer(); }
}

const musicShould = () => !!(musicOn && music.scene && SCENES[music.scene] && ctx && ctx.state === 'running' && !document.hidden);

function syncMusic() {
  const should = musicShould();
  if (ctx && musicBus) {
    try {
      const now = ctx.currentTime;
      musicBus.gain.cancelScheduledValues(now);
      musicBus.gain.setTargetAtTime(should ? MUSIC_VOL * (music.quiet ? 0.55 : 1) : 0, now, should ? 0.6 : 0.12);
    } catch (e) { /* ignore */ }
  }
  if (should && !music.timer) {
    music.next = ctx.currentTime + 0.08;
    music.timer = setInterval(schedule, 120);
    schedule();
  } else if (!should) stopMusicTimer();
}

/**
 * Pick what the world sounds like right now. scene: 'map' | 'forest' | null (silence).
 * layers: how much of the forest has been restored (0–3). quiet: under a mission (SFX stay clear).
 */
export function setMusic(scene, { layers = 0, quiet = false } = {}) {
  const changed = scene !== music.scene;
  music.scene = scene || null;
  music.layers = Math.max(0, Math.min(3, layers | 0));
  music.quiet = !!quiet;
  if (changed) music.step = 0;   // new scene starts on its downbeat
  syncMusic();
}

/** Debug/QA snapshot (no side effects). */
export const audioInfo = () => ({ state: ctx ? ctx.state : 'none', music: { ...music, timer: !!music.timer, on: musicOn }, sound: enabled });
