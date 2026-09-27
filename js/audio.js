// Tiny WebAudio synth — no audio files, no autoplay. Context is created on the first user gesture (iOS rule).
let ctx = null;
let master = null;
let enabled = true;

export function setSoundEnabled(v) { enabled = !!v; }

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      // iOS: play one silent frame inside the gesture to fully unlock output.
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(master);
      src.start(0);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* audio is optional */ }
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

let noiseBuf = null;
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
  step: (t) => tone(300, t, 0.05, { type: 'triangle', vol: 0.06 }),
  star: (t) => { tone(1046, t, 0.28, { type: 'triangle', vol: 0.13 }); tone(1568, t + 0.05, 0.3, { vol: 0.06 }); },
  fanfare: (t) => {
    [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.38]].forEach(([f, d]) => tone(f, t + d, 0.3, { type: 'triangle', vol: 0.15 }));
    tone(1318, t + 0.55, 0.5, { type: 'triangle', vol: 0.12 });
    tone(784, t + 0.55, 0.5, { vol: 0.08 });
  },
  reveal: (t) => [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.09, 0.35, { vol: 0.09 })),
};

export function play(name) {
  if (!enabled || !ctx || ctx.state !== 'running' || !SOUNDS[name]) return;
  try { SOUNDS[name](ctx.currentTime + 0.01); } catch (e) { /* ignore */ }
}
