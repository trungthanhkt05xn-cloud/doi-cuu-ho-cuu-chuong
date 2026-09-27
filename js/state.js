// Game state + localStorage persistence (schema versioned, tolerant of broken/missing data).

const KEY = 'mra.save.v1';
const VERSION = 1;

export function defaultState() {
  return {
    version: VERSION,
    started: false,
    createdAt: Date.now(),
    profile: { stars: 0 },
    progress: {
      completed: {},        // missionId -> { stars, plays, lastStars }
      revealedZones: ['village'],
      badges: [],           // zone ids
      stickers: [],         // mission ids (rescued friends)
      tutorial: { intro: false, mechanics: {} },
    },
    learning: {
      facts: {},            // "7x8" -> fact record (see learning/engine.js)
      qCount: 0,            // questions presented so far (spacing clock)
      queue: [],            // scheduled reviews: { key, dueQ }
      recent: [],           // last presented fact keys
    },
    settings: { sound: true },
  };
}

let state = defaultState();
let storageOk = true;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Merge loaded data onto defaults, keeping only values whose type matches.
function merge(def, src) {
  if (!isObj(src)) return def;
  const out = Array.isArray(def) ? [] : {};
  for (const k of Object.keys(def)) {
    const d = def[k];
    const s = src[k];
    if (s === undefined || s === null) out[k] = d;
    else if (Array.isArray(d)) out[k] = Array.isArray(s) ? s : d;
    else if (isObj(d)) {
      // open maps (facts, completed, mechanics) are copied as-is when they are objects
      out[k] = Object.keys(d).length === 0 ? (isObj(s) ? s : d) : merge(d, s);
    } else out[k] = typeof s === typeof d ? s : d;
  }
  return out;
}

function sanitizeFacts(facts) {
  const clean = {};
  for (const [k, f] of Object.entries(facts)) {
    if (!/^\d+x\d+$/.test(k) || !isObj(f)) continue;
    const m = Number(f.mastery);
    clean[k] = {
      attempts: +f.attempts || 0,
      correct: +f.correct || 0,
      wrong: +f.wrong || 0,
      streak: +f.streak || 0,
      lastSeen: Number.isFinite(f.lastSeen) ? f.lastSeen : null,
      lastResult: typeof f.lastResult === 'boolean' ? f.lastResult : null,
      lastMs: Number.isFinite(f.lastMs) ? f.lastMs : null,
      avgResponseMs: Number.isFinite(f.avgResponseMs) ? f.avgResponseMs : null,
      mastery: Number.isFinite(m) ? Math.min(1, Math.max(0, m)) : 0,
    };
  }
  return clean;
}

export function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch (e) {
    storageOk = false;
  }
  if (!raw) { state = defaultState(); return state; }
  try {
    const data = JSON.parse(raw);
    if (!isObj(data) || data.version !== VERSION) throw new Error('bad save');
    state = merge(defaultState(), data);
    state.learning.facts = sanitizeFacts(state.learning.facts);
    state.learning.queue = state.learning.queue.filter((q) => q && typeof q.key === 'string' && Number.isFinite(q.dueQ));
    state.learning.recent = state.learning.recent.filter((k) => typeof k === 'string').slice(-6);
  } catch (e) {
    console.warn('Save data unreadable, starting fresh.');
    state = defaultState();
  }
  return state;
}

export function save() {
  if (!storageOk) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Quota exceeded / private mode: keep playing in memory.
    storageOk = false;
  }
}

export const getState = () => state;

export function hasSave() {
  return state.started;
}

export function resetProgress() {
  const sound = state.settings.sound;
  state = defaultState();
  state.settings.sound = sound;
  save();
}
