// Mission session: sequences steps, asks the learning engine for questions, decides rewards.
// Knows nothing about how a mission looks — the view + mechanic handle the in-world action.
import { zoneById, zoneIndex } from './catalog.js';
import { completeMission, starsFor, unlockedTables } from './progression.js';
import { nextQuestion, recordAnswer, makeOptions, hintFor } from '../learning/engine.js';
import { save } from '../state.js';

export class MissionSession {
  constructor(mission, { answerKind, optionCount }) {
    this.mission = mission;
    this.zone = zoneById(mission.zone);
    this.level = zoneIndex(mission.zone) + 1;
    this.total = mission.steps;
    this.answerKind = answerKind;
    this.optionCount = optionCount;
    this.step = 0;
    this.firstTryCorrect = 0;
    this.reward = null;
    this.q = null;
    // Per-mission learning context: remediation happens at most once per fact per mission.
    this.ctx = { tables: this.zone.tables, allowed: unlockedTables(), remediated: new Set(), lastSource: null };
  }

  next() {
    this.q = nextQuestion(this.ctx);
    this.ctx.lastSource = this.q.source;
    this.options = this.answerKind === 'choices' ? makeOptions(this.q, this.optionCount, this.level) : null;
    this.misses = 0;
    this.hintLevel = 0;
    this.recorded = false;
    this.shownAt = performance.now();
    save();
    return { q: this.q, options: this.options };
  }

  /** @returns {{correct:boolean, done?:boolean, hint?:object}} */
  answer(value) {
    const q = this.q;
    const correct = Number(value) === q.answer;
    if (!this.recorded) {
      recordAnswer(q.key, { correct, ms: performance.now() - this.shownAt, hinted: this.hintLevel > 0, remediation: q.source === 'remediation' });
      this.recorded = true;
      if (correct && this.hintLevel === 0) this.firstTryCorrect += 1;
    }
    if (correct) {
      this.step += 1;
      save();
      return { correct: true, done: this.step >= this.total };
    }
    this.misses += 1;
    this.hintLevel = Math.min(4, Math.max(this.hintLevel + 1, this.misses));
    save();
    return { correct: false, hint: hintFor(q, this.hintLevel) };
  }

  /** Voluntary hint from the 💡 button — never reveals the answer. */
  help() {
    this.hintLevel = Math.min(3, this.hintLevel + 1);
    return hintFor(this.q, this.hintLevel);
  }

  finish() {
    if (this.reward) return this.reward;   // guard against double rewards (double tap / re-entry)
    this.reward = completeMission(this.mission.id, starsFor(this.firstTryCorrect, this.total));
    this.reward.firstTry = this.firstTryCorrect;
    this.reward.total = this.total;
    save();
    return this.reward;
  }
}
