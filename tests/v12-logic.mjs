// No dependency or package manifest needed: node --test tests/v12-logic.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { load, save, getState, defaultState } from '../js/state.js';
import { nextQuestion, recordAnswer, encounterFor, tableStrength } from '../js/learning/engine.js';
import { MissionSession } from '../js/game/missionEngine.js';
import { missionById } from '../js/game/catalog.js';
import { beginVisit, pulseEligible, selectPulse, pulseOffer, claimPulse, completePulse, dismissPulse, learnerGarden, RETURN_GAP, PULSE_GAP } from '../js/game/worldPulse.js';

let stored = null;
globalThis.localStorage = { getItem: () => stored, setItem: (key, value) => { assert.equal(key, 'mra.save.v1'); stored = value; } };
const reset = () => { stored = null; load(); };
const now = 1800000000000;
const fixture = (key, data = {}) => {
  recordAnswer(key, { correct: true, ms: 2000, now });
  Object.assign(getState().learning.facts[key], data);
};
const seeded = (seed = 19) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const context = (data = {}) => ({ tables: [4, 5, 6], allowed: [2, 3, 4, 5, 6], mechanic: 'firefly', remediated: new Set(), now, rng: seeded(), ...data });

test('clean, hinted, and scaffolded success are distinct evidence; support cannot build a clean streak', () => {
  reset();
  recordAnswer('4x6', { correct: true, ms: 2000, now });
  recordAnswer('5x6', { correct: true, ms: 2000, hinted: true, now });
  recordAnswer('6x6', { correct: true, ms: 2000, supported: true, representation: 'groups', now });
  const f = getState().learning.facts;
  assert.equal(f['4x6'].independent, 1); assert.equal(f['5x6'].independent, 0); assert.equal(f['6x6'].independent, 0);
  assert.ok(f['4x6'].mastery > f['6x6'].mastery && f['6x6'].mastery > f['5x6'].mastery);
  assert.equal(f['5x6'].assisted, 1); assert.equal(f['6x6'].supported, 1);
  recordAnswer('4x6', { correct: true, ms: 2000, hinted: true, now });
  assert.equal(f['4x6'].streak, 0);
});

test('support fades from groups through structure to recall; mistake restores help and Echo changes representation', () => {
  reset();
  assert.deepEqual(encounterFor('4x6', 'firefly'), { support: 'groups', representation: 'groups' });
  for (let i = 0; i < 4; i++) recordAnswer('4x6', { correct: true, ms: 2000, supported: true, representation: 'groups', now });
  assert.equal(encounterFor('4x6', 'firefly').support, 'structure');
  for (let i = 0; i < 3; i++) recordAnswer('4x6', { correct: true, ms: 2000, representation: 'groups', now });
  assert.equal(encounterFor('4x6', 'firefly').support, 'recall');
  recordAnswer('4x6', { correct: false, ms: 2000, representation: 'groups', now });
  assert.deepEqual(encounterFor('4x6', 'firefly', 'remediation'), { support: 'groups', representation: 'array' });
  assert.deepEqual(encounterFor('4x6', 'signal', 'remediation'), { support: 'groups', representation: 'array' });
  fixture('5x6', { lastRepresentation: 'array', lastResult: false });
  assert.equal(encounterFor('5x6', 'signal', 'remediation').representation, 'groups');
});

test('missed fact returns with spacing, never adjacent to same/twin/product, and failed Echo does not loop', () => {
  reset(); const ctx = context();
  const q = nextQuestion(ctx);
  recordAnswer(q.key, { correct: false, ms: 1000, representation: 'groups', now });
  assert.equal(getState().learning.wrongFactQueue[0].dueQ, 4);
  let echo = null;
  for (let i = 0; i < 14; i++) {
    const recent = getState().learning.recent.slice();
    const next = nextQuestion(ctx); ctx.lastSource = next.source;
    assert.ok(!recent.slice(next.source === 'remediation' ? -2 : -4).includes(next.key));
    const twins = recent.slice(-2).map((k) => k.split('x').reverse().join('x'));
    assert.ok(!twins.includes(next.key));
    assert.ok(recent.slice(-2).every((k) => k.split('x').reduce((a, b) => a * Number(b), 1) !== next.answer));
    if (next.source === 'remediation') { echo = next; assert.ok(i >= 2); break; }
  }
  assert.ok(echo); assert.equal(echo.key, q.key); assert.equal(echo.encounter.representation, 'array');
  recordAnswer(echo.key, { correct: false, ms: 1000, remediation: true, now });
  assert.equal(getState().learning.wrongFactQueue.length, 0);
  for (let i = 0; i < 20; i++) assert.notEqual(nextQuestion(ctx).source, 'remediation');
});

test('weak review and mastered spaced retrieval remain available with reproducible selection', () => {
  reset(); fixture('2x7', { mastery: 0.1, lastResult: false }); fixture('3x7', { mastery: 0.95, lastSeen: now - 72 * 3600000 });
  const review = nextQuestion(context({ rng: () => 0.55 }));
  assert.equal(review.source, 'review');
  assert.equal(review.key, '2x7'); // weak facts remain eligible in the review bucket
  reset(); fixture('3x7', { mastery: 0.95, lastSeen: now - 72 * 3600000 });
  assert.equal(nextQuestion(context({ rng: () => 0.55 })).key, '3x7');
  const run = () => { reset(); const ctx = context(); return Array.from({ length: 20 }, () => nextQuestion(ctx).key); };
  assert.deepEqual(run(), run());
});

test('V1 and V2 saves preserve progress, profile, settings, mastery and queue through current-schema round-trip', () => {
  for (const version of [1, 2]) {
    reset(); const old = defaultState(); old.version = version;
    old.started = true; old.profile = { stars: 8, nickname: 'Bin', avatarId: 'fox' };
    old.progress.completed = { v1: { stars: 3, plays: 2 }, v5: { stars: 2, plays: 1 } };
    old.progress.badges = ['village']; old.progress.stickers = ['v1', 'v5']; old.progress.revealedZones = ['village', 'forest'];
    old.settings = { sound: false, music: false, language: 'en' };
    old.learning.facts = { '4x6': { attempts: 5, correct: 4, wrong: 1, mastery: 0.7, assisted: 1, recovered: 1 } };
    old.learning.wrongFactQueue = [{ key: '4x6', dueQ: 12, from: 'f2' }];
    delete old.pulse;
    if (version === 1) { old.learning.queue = old.learning.wrongFactQueue; delete old.learning.wrongFactQueue; }
    stored = JSON.stringify(old); load(); const current = getState();
    assert.equal(current.version, 4); assert.deepEqual(current.profile, old.profile); assert.deepEqual(current.progress, old.progress);
    assert.deepEqual(current.settings, old.settings); assert.equal(current.learning.facts['4x6'].mastery, 0.7);
    assert.equal(current.learning.facts['4x6'].independent, 3);
    assert.deepEqual(current.learning.wrongFactQueue, [{ key: '4x6', dueQ: 12, from: 'f2' }]);
    assert.deepEqual(current.pulse, { lastVisit: 0, lastCompleted: 0, blooms: [], garden: { village: 0, forest: 0, cove: 0 } });
    save(); const saved = JSON.stringify(current); load(); assert.equal(JSON.stringify(getState()), saved);
  }
});

test('malformed optional V3 fields and invalid fact keys cannot poison selection or lose valid progress', () => {
  reset(); const data = defaultState(); data.progress.completed.v1 = { stars: 3, plays: 1 };
  data.pulse = { lastVisit: -1, lastCompleted: 'bad', blooms: [null, {}, 'f2', 'f2', 'bogus'] };
  data.learning.recent = [null, 'bogus', '0x0', '4x6'];
  data.learning.wrongFactQueue = [null, { key: 'bad', dueQ: 2 }, { key: '4x6', dueQ: 7 }];
  data.learning.facts = { 'bad': {}, '4x6': { mastery: 'bad', independent: 'bad', lastRepresentation: {} } };
  stored = JSON.stringify(data); load();
  assert.ok(getState().progress.completed.v1); assert.deepEqual(getState().learning.recent, ['4x6']);
  assert.deepEqual(getState().pulse, { lastVisit: 0, lastCompleted: 0, blooms: ['f2'], garden: { village: 0, forest: 0, cove: 0 } });
  assert.equal(getState().learning.facts['4x6'].mastery, 0); assert.ok(nextQuestion(context()).key);
  stored = '{bad JSON'; load(); assert.equal(getState().version, 4);
});

test('World Pulse eligibility is calm, deterministic, familiar and bounded per visit; blooms persist', () => {
  reset(); const state = getState();
  assert.equal(pulseEligible(state.pulse, now), false); assert.equal(selectPulse(state, now), null);
  state.progress.completed.v1 = { stars: 3, plays: 1 }; state.progress.completed.f2 = { stars: 3, plays: 1 };
  fixture('5x7', { mastery: 0.1, lastResult: false });
  state.pulse.lastVisit = now - RETURN_GAP;
  assert.equal(selectPulse(state, now).mission.id, 'f2'); assert.equal(selectPulse(state, now).table, 5);
  beginVisit(now); assert.ok(pulseOffer());
  const offer = claimPulse('f2'); assert.ok(offer); assert.equal(pulseOffer(), null); assert.equal(claimPulse('f2'), null);
  assert.equal(completePulse('v1', now), false); assert.equal(completePulse('f2', now), true); assert.equal(completePulse('f2', now), false);
  assert.deepEqual(state.pulse.blooms, ['f2']); save(); load(); assert.deepEqual(getState().pulse.blooms, ['f2']);
  beginVisit(now + RETURN_GAP); assert.equal(pulseOffer(), null);
  beginVisit(now + PULSE_GAP + RETURN_GAP); assert.ok(pulseOffer()); dismissPulse(); assert.equal(pulseOffer(), null);
  const progress = structuredClone(getState().progress);
  beginVisit(now + 60 * 24 * 3600000); assert.ok(pulseOffer()); assert.deepEqual(getState().progress, progress);
});

test('voluntary Hint does not cost stars, mission rewards are guarded, and World Pulse cannot repeat a reward', () => {
  reset(); const session = new MissionSession(missionById('v1'), { answerKind: 'choices', optionCount: 3 });
  for (let i = 0; i < session.total; i++) { session.next(); const h = session.help(); assert.ok(!h.reveal); assert.equal(session.answer(session.q.answer).correct, true); }
  const reward = session.finish(); assert.equal(reward.stars, 3); assert.equal(reward.helped, session.total);
  assert.equal(session.finish(), reward); assert.equal(getState().progress.completed.v1.plays, 1);
  assert.ok(Object.values(getState().learning.facts).every((f) => f.assisted > 0 && f.independent === 0));
  getState().pulse.lastVisit = now - RETURN_GAP; beginVisit(now); const pulse = claimPulse('v1');
  const returned = new MissionSession(missionById('v1'), { answerKind: 'choices', optionCount: 3, pulse });
  for (let i = 0; i < returned.total; i++) { returned.next(); returned.answer(returned.q.answer); }
  assert.equal(returned.finish().pulse, true); assert.equal(returned.finish().pulse, true);
  assert.equal(getState().progress.completed.v1.plays, 2); assert.equal(getState().profile.stars, 3);
  const garden = learnerGarden('village'); assert.ok(garden > 0);
  Object.values(getState().learning.facts).forEach((f) => { f.mastery = 0; });
  assert.equal(learnerGarden('village'), garden); assert.equal(tableStrength(9).seen, 0);
});
