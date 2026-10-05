// One optional return rescue per visit: familiar content or the normally open Forest handoff. Nothing expires or is lost.
import { MISSIONS, zoneById } from './catalog.js';
import { getState, save } from '../state.js';
import { forestStage } from './forestSystem.js';
import { missionStatus } from './progression.js';
import { tableStrength } from '../learning/engine.js';

export const RETURN_GAP = 6 * 3600000;
export const PULSE_GAP = 18 * 3600000;
let available = false;
let active = null;

export function pulseEligible(pulse, now) {
  return pulse.lastVisit > 0 && now - pulse.lastVisit >= RETURN_GAP &&
    (pulse.lastCompleted === 0 || now - pulse.lastCompleted >= PULSE_GAP);
}

export function beginVisit(now = Date.now()) {
  const p = getState().pulse;
  available = pulseEligible(p, now);
  active = null;
  p.lastVisit = now;
  save();
}

/** Prefer familiar worlds containing practised weak facts; unseen tables are not deficits. */
export function selectPulse(state = getState(), now = Date.now()) {
  const stage = forestStage(state);
  const candidates = MISSIONS.filter((m) => !m.finale && (state.progress.completed[m.id] ||
    (m.id === 'f4' && stage === 'lit' && missionStatus(m, state.progress) === 'open')));
  const scored = candidates.map((mission) => {
    const tables = zoneById(mission.zone).tables;
    const needs = tables.map((table) => {
      const facts = Object.entries(state.learning.facts).filter(([key, f]) => key.startsWith(`${table}x`) && f.attempts > 0);
      const need = facts.reduce((sum, [, f]) => sum + (1 - f.mastery) + (f.lastResult === false ? 0.5 : 0) + (f.lastSeen && now - f.lastSeen >= 48 * 3600000 ? 0.3 : 0), 0);
      const latest = facts.map(([, f]) => f).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))[0];
      return { table, need, lastMechanic: latest?.lastMechanic };
    }).sort((a, b) => b.need - a.need || a.table - b.table);
    const worldNeed = stage === 'lit' && mission.type === 'signal' ? 0.3 : stage === 'quiet' && mission.type === 'firefly' ? 0.15 : 0;
    const variety = needs[0].lastMechanic && ['firefly', 'signal'].includes(mission.type) && needs[0].lastMechanic !== mission.type ? 0.2 : 0;
    return { mission, table: needs[0].table, score: needs[0].need + 0.15 * Number(['firefly', 'signal'].includes(mission.type)) + worldNeed + variety - (state.pulse.blooms.at(-1) === mission.id ? 0.2 : 0) };
  }).sort((a, b) => b.score - a.score || a.mission.id.localeCompare(b.mission.id));
  return scored[0] || null;
}

export const pulseOffer = () => available ? selectPulse() : null;
export function dismissPulse() { available = false; }
export function claimPulse(id) {
  const offer = pulseOffer();
  if (!offer || offer.mission.id !== id) return null;
  available = false;
  active = id;
  return offer;
}

export function completePulse(id, now = Date.now()) {
  if (active !== id) return false;
  active = null;
  const p = getState().pulse;
  p.lastCompleted = now;
  p.blooms = [...p.blooms.filter((m) => m !== id), id];
  save();
  return true;
}

/** Positive world feedback only: a little garden grows as familiar tables become stronger. */
export function learnerGarden(zone) {
  const strengths = zoneById(zone).tables.map(tableStrength);
  const seen = strengths.some((s) => s.seen);
  const value = strengths.reduce((sum, s) => sum + s.value, 0) / strengths.length;
  const grown = seen ? value >= 0.5 ? 3 : value >= 0.25 ? 2 : 1 : 0;
  const garden = getState().pulse.garden;
  if (grown > garden[zone]) { garden[zone] = grown; save(); }
  return garden[zone]; // a mistake or a missed day never takes flowers away
}
