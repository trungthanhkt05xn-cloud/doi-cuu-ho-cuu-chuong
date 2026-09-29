// Progression rules: what is unlocked, what is next, rewards.
import { ZONES, MISSIONS, zoneMissions, missionById, zoneById } from './catalog.js';
import { getState } from '../state.js';

const P = () => getState().progress;

export const isDone = (id) => !!P().completed[id];
export const starsOf = (id) => (P().completed[id] ? P().completed[id].stars : 0);
const finaleOf = (zoneId) => zoneMissions(zoneId).find((m) => m.finale);

export function zoneUnlocked(zoneId) {
  const i = ZONES.findIndex((z) => z.id === zoneId);
  if (i <= 0) return true;
  return isDone(finaleOf(ZONES[i - 1].id).id);
}

// Regular missions unlock one after another; the finale opens after 3 regular missions
// ("most of the zone", no perfect score needed). Clearing the finale opens the next zone.
export const FINALE_NEEDS = 3;

export function missionStatus(m) {
  if (isDone(m.id)) return 'done';
  if (!zoneUnlocked(m.zone)) return 'locked';
  const regular = zoneMissions(m.zone).filter((x) => !x.finale);
  if (m.finale) return regular.filter((x) => isDone(x.id)).length >= FINALE_NEEDS ? 'open' : 'locked';
  const i = regular.indexOf(m);
  return i === 0 || isDone(regular[i - 1].id) ? 'open' : 'locked';
}

// The mission the map should point at: first open mission in the newest unlocked zone.
export function currentMission() {
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (!zoneUnlocked(ZONES[i].id)) continue;
    const open = zoneMissions(ZONES[i].id).find((m) => missionStatus(m) === 'open');
    if (open) return open;
  }
  return MISSIONS.find((m) => missionStatus(m) === 'open') || null;
}

export function unlockedTables() {
  const set = new Set();
  ZONES.forEach((z) => { if (zoneUnlocked(z.id)) z.tables.forEach((t) => set.add(t)); });
  return [...set].sort((a, b) => a - b);
}

export function totalStars() {
  return Object.values(P().completed).reduce((s, c) => s + (c.stars || 0), 0);
}

export function allDone() {
  return MISSIONS.every((m) => isDone(m.id));
}

// ── The world remembers ──
// Lasting changes in the world are DERIVED from mission completion (one source of truth): reload,
// Continue, V1.0 saves and Reset Progress all stay consistent without any extra saved flags.
export const WORLD = { bridge: 'v1', fireflies: 'f2', signal: 'f4', owl: 'f5', relay: 'c2', beacon: 'c4' };
export function world() {
  const w = {};
  for (const [k, id] of Object.entries(WORLD)) w[k] = isDone(id);
  return w;
}
/** How far Whisper Woods has recovered (0–3): fireflies → forest signal → owl home. */
export const forestLayers = () => ['f2', 'f4', 'f5'].filter(isDone).length;

export function starsFor(firstTryCorrect, total) {
  const r = total ? firstTryCorrect / total : 0;
  return r >= 0.85 ? 3 : r >= 0.5 ? 2 : 1;
}

// Idempotent per call-site (MissionSession guards against double rewards).
export function completeMission(id, stars) {
  const m = missionById(id);
  const p = P();
  const unlockedBefore = ZONES.filter((z) => zoneUnlocked(z.id)).map((z) => z.id);
  const prev = p.completed[id];
  const prevStars = prev ? prev.stars : 0;
  const best = Math.max(prevStars, stars);
  p.completed[id] = { stars: best, plays: (prev ? prev.plays : 0) + 1, lastStars: stars };

  const firstTime = !prev;
  let sticker = null;
  let badge = null;
  if (firstTime && !p.stickers.includes(id)) { p.stickers.push(id); sticker = m.npc; }
  if (firstTime && m.finale && !p.badges.includes(m.zone)) { p.badges.push(m.zone); badge = zoneById(m.zone).badge; }
  const newZone = ZONES.find((z) => zoneUnlocked(z.id) && !unlockedBefore.includes(z.id)) || null;
  getState().profile.stars = totalStars();

  return { stars, best, prevStars, starsAdded: best - prevStars, firstTime, sticker, badge, newZone };
}
