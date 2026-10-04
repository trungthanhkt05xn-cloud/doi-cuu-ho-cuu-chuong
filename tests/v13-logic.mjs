import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, load, save, getState } from '../js/state.js';
import { forestStage, advanceForest } from '../js/game/forestSystem.js';
import { MissionSession } from '../js/game/missionEngine.js';
import { missionById } from '../js/game/catalog.js';
import { encounterFor, recordAnswer } from '../js/learning/engine.js';
import { selectPulse } from '../js/game/worldPulse.js';
let stored = null;
globalThis.localStorage = { getItem: () => stored, setItem: (_, v) => { stored = v; } };
const reset = () => { stored = null; load(); };
const session = (id) => new MissionSession(missionById(id), { answerKind: 'choices', optionCount: 4 });

test('retrieval creates a monotonic handoff; exploration, Hint, mistakes and replay cannot farm or erase it', () => {
  reset(); const firefly = session('f2'); firefly.next(); firefly.help();
  assert.equal(forestStage(), 'quiet'); firefly.answer(-1); assert.equal(forestStage(), 'quiet');
  assert.equal(firefly.answer(firefly.q.answer).forest.after, 'lit');
  assert.equal(getState().learning.facts[firefly.q.key].independent, 0);
  save(); load(); assert.equal(forestStage(), 'lit');
  const signal = session('f4'); signal.next(); signal.answer(-1); assert.equal(forestStage(), 'lit');
  assert.equal(signal.answer(signal.q.answer).forest.after, 'connected');
  for (let i = 0; i < 30; i++) assert.equal(advanceForest(i % 2 ? 'signal' : 'firefly').changed, false);
  save(); load(); assert.equal(forestStage(), 'connected'); assert.deepEqual(getState().forest, { stage: 'connected' });
});
test('Signal remains playable without light; migration derives old light but preserves new payoff', () => {
  reset(); assert.equal(advanceForest('signal').after, 'quiet');
  for (const version of [1, 2, 3]) {
    const old = defaultState(); old.version = version; delete old.forest;
    old.profile = { nickname: 'Mai', avatarId: 'fox', stars: 6 };
    old.progress.completed = { f2: { stars: 3, plays: 2 }, f4: { stars: 3, plays: 1 } };
    old.pulse.blooms = ['f2']; old.pulse.garden.forest = 2; old.settings.language = 'en';
    stored = JSON.stringify(old); load(); const s = getState();
    assert.equal(s.version, 4); assert.deepEqual(s.progress, old.progress); assert.deepEqual(s.profile, old.profile);
    assert.deepEqual(s.pulse, old.pulse); assert.deepEqual(s.settings, old.settings);
    assert.equal(forestStage(), 'lit'); assert.equal(advanceForest('signal').after, 'connected');
  }
});
test('malformed optional connection and mechanic evidence sanitize without losing progress', () => {
  const s = defaultState(); s.forest = { stage: 'unbounded', amount: 999 }; s.learning.facts['5x7'] = { attempts: 2, mastery: .4, lastMechanic: 'unknown' };
  s.progress.completed.v1 = { stars: 3, plays: 1 }; stored = JSON.stringify(s); load();
  assert.deepEqual(getState().forest, { stage: 'quiet' }); assert.equal(getState().learning.facts['5x7'].lastMechanic, null);
  assert.equal(getState().progress.completed.v1.stars, 3);
});
test('last Forest action varies the next representation, round-trips, and does not override clean recall', () => {
  reset(); recordAnswer('5x7', { correct: true, ms: 2000, supported: true, representation: 'groups', mechanic: 'firefly' });
  assert.equal(encounterFor('5x7', 'firefly').representation, 'array');
  assert.equal(encounterFor('5x7', 'signal').representation, 'array');
  save(); load(); assert.equal(getState().learning.facts['5x7'].lastMechanic, 'firefly');
  Object.assign(getState().learning.facts['5x7'], { mastery: .8, independent: 3, lastSupported: false });
  assert.equal(encounterFor('5x7', 'signal').support, 'recall');
  assert.equal(encounterFor('4x6', 'firefly', 'target', { lastRepresentation: 'groups' }).representation, 'array');
});
test('Pulse balances world handoff and recent action while stronger learner need wins; locked Signal stays locked', () => {
  reset(); const s = getState(); s.progress.completed = { v1: {}, v5: {}, f1: {}, f2: {}, f3: {} };
  assert.equal(selectPulse().mission.id, 'f4');
  delete s.progress.completed.f3; assert.notEqual(selectPulse().mission.id, 'f4');
  s.progress.completed.f4 = {}; s.forest.stage = 'connected';
  recordAnswer('5x7', { correct: true, ms: 2000, mechanic: 'signal' });
  assert.equal(selectPulse().mission.id, 'f2');
  for (const key of ['2x3', '2x4', '2x5']) recordAnswer(key, { correct: false, ms: 2000 });
  assert.equal(selectPulse().mission.id, 'v1');
});
