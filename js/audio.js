// Tiny WebAudio synth — no audio files, no autoplay.
// iOS / iPadOS (Safari and every other iOS browser = WebKit) only lets an AudioContext start inside a
// real user activation (touchend / click / keydown — NOT a touch pointerdown), may leave it
// 'suspended' or 'interrupted' after backgrounding / calls / other audio, and occasionally keeps a
// context that never resumes. So: one context, created + resumed from activation events only, woken
// again on every later gesture / return to the foreground, and recreated only if it stays dead.
let ctx = null;
let master = null;
let noiseBuf = null;
let enabled = true;
let deadChecks = 0;      // gestures after which the context still was not running
let checkPending = false;

export function setSoundEnabled(v) { enabled = !!v; }

const AC = () => window.AudioContext || window.webkitAudioContext;
const wakeable = () => ctx && ctx.state !== 'running' && ctx.state !== 'closed';

function createContext() {
  const C = AC();
  try { ctx = new C({ latencyHint: 'interactive' }); } catch (e) { ctx = new C(); }
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  noiseBuf = null;
  deadChecks = 0;
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
    if (document.hidden) { if (ctx.state === 'running') Promise.resolve(ctx.suspend()).catch(() => {}); }
    else unlockAudio();
  });
  window.addEventListener('pageshow', unlockAudio);   // back-forward cache restore
  window.addEventListener('focus', unlockAudio);
}

function tone(freq, t, dur, { type = 'sine', vol = 0.18, to = null } = {}) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.03);
}

function noise(t, dur, { vol = 0.2, freq = 800, q = 1 } = {}) {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = noiseBuf;
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}

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
