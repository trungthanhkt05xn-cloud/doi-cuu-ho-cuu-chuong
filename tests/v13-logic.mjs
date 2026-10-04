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
test('V1/V2/V3 migration preserves historical Forest recovery; V4 reload preserves explicit stages', () => {
  reset(); assert.equal(advanceForest('signal').after, 'quiet');
  const cases = [[[], 'quiet'], [['f2'], 'lit'], [['f2', 'f4'], 'connected'], [['f5'], 'connected']];
  for (const version of [1, 2, 3]) for (const [ids, expected] of cases) {
    const old = defaultState(); old.version = version; old.forest = { stage: 'malformed' };
    old.profile = { nickname: 'Mai', avatarId: 'fox', stars: 6 };
    old.progress.completed = Object.fromEntries(ids.map(id => [id, { stars: 3, plays: 2 }]));
    old.pulse.blooms = ['f2']; old.pulse.garden.forest = 2; old.settings.language = 'en';
    stored = JSON.stringify(old); load(); const s = getState();
    assert.equal(s.version, 4); assert.deepEqual(s.progress, old.progress); assert.deepEqual(s.profile, old.profile);
    assert.deepEqual(s.pulse, old.pulse); assert.deepEqual(s.settings, old.settings);
    assert.equal(s.forest.stage, expected); assert.equal(forestStage(), expected);
    save(); load(); assert.equal(getState().forest.stage, expected);
  }
  for (const stage of ['quiet', 'lit', 'connected']) {
    const s = defaultState(); s.forest.stage = stage; s.progress.completed.f4 = { stars: 3 };
    stored = JSON.stringify(s); load(); assert.equal(getState().forest.stage, stage); assert.equal(forestStage(), stage);
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
  reset(); const s = getState(); s.progress.completed = { v1: {}, v5: {}, f1: {}, f2: {}, f3: {} }; s.forest.stage = 'lit';
  assert.equal(selectPulse().mission.id, 'f4');
  delete s.progress.completed.f3; assert.notEqual(selectPulse().mission.id, 'f4');
  s.progress.completed.f4 = {}; s.forest.stage = 'connected';
  recordAnswer('5x7', { correct: true, ms: 2000, mechanic: 'signal' });
  assert.equal(selectPulse().mission.id, 'f2');
  for (const key of ['2x3', '2x4', '2x5']) recordAnswer(key, { correct: false, ms: 2000 });
  assert.equal(selectPulse().mission.id, 'v1');
});

test('support derives BUILD/COMPLETE/RECALL; COMPLETE is supported and only clean RECALL earns independent evidence', () => {
  for (const id of ['f2', 'f4']) for (const [mastery, expected] of [[0, 'BUILD'], [.4, 'COMPLETE'], [.8, 'RECALL']]) {
    reset();
    for (let a = 2; a <= 9; a++) for (let b = 1; b <= 10; b++) {
      recordAnswer(`${a}x${b}`, { correct: true, ms: 2000 });
      Object.assign(getState().learning.facts[`${a}x${b}`], { mastery, independent: expected === 'RECALL' ? 3 : 0, streak: 0 });
    }
    const run = session(id); run.next(); assert.equal(run.q.encounter.mode, expected);
    const fact = getState().learning.facts[run.q.key], independent = fact.independent, supported = fact.supported;
    run.answer(run.q.answer);
    assert.equal(fact.independent, independent + Number(expected === 'RECALL'));
    assert.equal(fact.supported, supported + Number(expected !== 'RECALL'));
    assert.equal(fact.lastSupported, expected !== 'RECALL');
    if (expected !== 'RECALL') assert.equal(fact.streak, 0);
    const echo = encounterFor(run.q.key, run.mission.type, 'remediation');
    assert.notEqual(echo.mode, 'RECALL'); assert.notEqual(echo.representation, 'recall');
  }
});
