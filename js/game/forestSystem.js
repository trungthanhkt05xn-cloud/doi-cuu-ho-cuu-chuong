// One qualitative, monotonic connection. Existing Fireflies completion supplies light too.
import { getState } from '../state.js';

export function forestStage(state = getState()) {
  if (state.forest.stage === 'connected') return 'connected';
  return state.forest.stage === 'lit' || state.progress.completed.f2 ? 'lit' : 'quiet';
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
