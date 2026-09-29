// Game state + localStorage persistence (schema versioned, tolerant of broken/missing data).
import { t, LANGS } from './i18n.js';

const KEY = 'mra.save.v1';   // storage key stays the same across schema versions
const VERSION = 2;           // v2: profile (nickname/avatar) + wrongFactQueue

export function defaultState() {
  return {
    version: VERSION,
    started: false,
    createdAt: Date.now(),
    profile: { stars: 0, nickname: '', avatarId: '' },   // avatarId '' = identity not chosen yet
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
      wrongFactQueue: [],   // remediation after a mistake: { key, dueQ } (see learning/engine.js)
      recent: [],           // last presented fact keys
    },
    settings: { sound: true, language: 'vi' },   // language: V1.0 final — older saves get 'vi' via merge
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

// v1 → v2: profile fields come from defaults (merge); the old review queue becomes wrongFactQueue.
function migrate(data) {
  if (data.version === 1) {
    const l = isObj(data.learning) ? data.learning : {};
    if (Array.isArray(l.queue) && !Array.isArray(l.wrongFactQueue)) {
      const seen = new Set();
      l.wrongFactQueue = l.queue.filter((q) => q && !seen.has(q.key) && seen.add(q.key));
    }
    delete l.queue;
    data.version = 2;
  }
  return data;
}

// Nickname: trimmed, single spaces, no control chars, max 12 characters (not UTF-16 units).
export function cleanNickname(v) {
  const s = String(v == null ? '' : v).normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f]/g, '').replace(/\s+/g, ' ').trim();
  return Array.from(s).slice(0, 12).join('').trim();
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
      recovered: +f.recovered || 0,
      assisted: +f.assisted || 0,
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
    if (!isObj(data) || !(data.version >= 1 && data.version <= VERSION)) throw new Error('bad save');
    state = merge(defaultState(), migrate(data));
    state.learning.facts = sanitizeFacts(state.learning.facts);
    state.learning.wrongFactQueue = state.learning.wrongFactQueue
      .filter((q) => q && typeof q.key === 'string' && /^\d+x\d+$/.test(q.key) && Number.isFinite(q.dueQ)).slice(-24);
    state.profile.nickname = cleanNickname(state.profile.nickname);
    state.learning.recent = state.learning.recent.filter((k) => typeof k === 'string').slice(-6);
    if (!LANGS.includes(state.settings.language)) state.settings.language = 'vi';
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

export const hasProfile = () => !!state.profile.avatarId;
export const nickname = () => state.profile.nickname || t('nick.default');

export function resetProgress() {
  const settings = state.settings;   // device preferences (sound, language) survive a progress reset
  state = defaultState();
  state.settings = settings;
  save();
}
