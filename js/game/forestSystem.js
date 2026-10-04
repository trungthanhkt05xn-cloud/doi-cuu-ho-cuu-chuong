// One qualitative, monotonic connection. Legacy progress is derived once during migration.
import { getState } from '../state.js';

export function forestStage(state = getState()) {
  return state.forest.stage;
}

// Called only after successful total retrieval, never for building, hints, or mistakes.
// Session saves the transition together with the answer. Replays cannot farm anything.
export function advanceForest(mechanic) {
  const state = getState(), before = forestStage(state);
  const after = mechanic === 'firefly' && before === 'quiet' ? 'lit'
    : mechanic === 'signal' && before === 'lit' ? 'connected' : before;
  if (after !== before) state.forest.stage = after;
  return { before, after, changed: after !== before };
}
