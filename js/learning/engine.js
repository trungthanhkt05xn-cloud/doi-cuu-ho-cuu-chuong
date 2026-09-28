// Learning engine: fact tracking, mastery, adaptive selection, spaced review, distractors, hints.
// Convention follows Vietnamese textbooks: a × b = "a được lấy b lần" = a + a + … (b times).
// Fact key "a x b" keeps order (6x7 and 7x6 are tracked separately).
import { getState } from '../state.js';

export const TABLES = [2, 3, 4, 5, 6, 7, 8, 9];
export const MULTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const keyOf = (a, b) => `${a}x${b}`;
export function parseKey(k) {
  const [a, b] = k.split('x').map(Number);
  return { a, b };
}
const productOf = (k) => { const { a, b } = parseKey(k); return a * b; };
const twinOf = (k) => { const { a, b } = parseKey(k); return keyOf(b, a); };
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const L = () => getState().learning;
export const factOf = (k) => L().facts[k] || null;
export const masteryOf = (k) => (L().facts[k] ? L().facts[k].mastery : 0);

function ensureFact(k) {
  const facts = L().facts;
  if (!facts[k]) {
    facts[k] = { attempts: 0, correct: 0, wrong: 0, streak: 0, lastSeen: null, lastResult: null,
      lastMs: null, avgResponseMs: null, mastery: 0 };
  }
  return facts[k];
}

// 0..1 — how "due" a fact is for review. Weak facts are due after ~15 min, strong ones after ~2 days.
function staleness(f, now) {
  if (!f || !f.lastSeen) return 0;
  const hours = (now - f.lastSeen) / 3600000;
  const interval = 0.25 + f.mastery * f.mastery * 48;
  return clamp01(hours / interval);
}

function weightedPick(items) {
  const total = items.reduce((s, it) => s + it.w, 0);
  let r = Math.random() * total;
  for (const it of items) { r -= it.w; if (r <= 0) return it; }
  return items[items.length - 1];
}

const MIX = { target: 0.5, review: 0.3, easy: 0.2 };

/**
 * Pick the next question.
 * @param {{tables:number[], allowed:number[], remediated?:Set<string>, lastSource?:string}} ctx
 *   tables = zone focus, allowed = every table unlocked so far; remediated/lastSource are per mission.
 */
export function nextQuestion(ctx) {
  const lp = L();
  const now = Date.now();
  const allowed = [...new Set([...ctx.allowed, ...ctx.tables])];
  const recent = lp.recent;
  const last = recent[recent.length - 1];
  const lastAnswer = last ? productOf(last) : null;
  const blocked = (k) => recent.slice(-4).includes(k) || (last && k === twinOf(last)) || productOf(k) === lastAnswer;

  let chosen = null;
  let source = 'target';

  // 1) Remediation: a fact answered wrong comes back once at least 2 other facts have been shown.
  //    Max once per fact per mission (ctx.remediated), never two remediations in a row, and a
  //    fact that is not due yet simply waits — the queue lives in the save, so it carries over.
  const wq = lp.wrongFactQueue;
  const idx = lp.qCount + 1;   // number of the question about to be shown
  if (ctx.lastSource !== 'remediation') {
    const clash = (k) => k === last || (last && k === twinOf(last)) || productOf(k) === lastAnswer;
    const due = wq
      .filter((it) => it.dueQ <= idx && allowed.includes(parseKey(it.key).a) && !(ctx.remediated && ctx.remediated.has(it.key)))
      .sort((x, y) => x.dueQ - y.dueQ);
    const it = due.find((d) => !clash(d.key));
    if (it) {
      chosen = it.key;
      source = 'remediation';
      if (ctx.remediated) ctx.remediated.add(it.key);   // removed from the queue when answered
    }
  }

  // 2) Mixed buckets: zone targets / weak-or-stale review / easy confidence builders.
  if (!chosen) {
    const buckets = { target: [], review: [], easy: [] };
    for (const a of allowed) {
      for (const b of MULTS) {
        const k = keyOf(a, b);
        if (blocked(k)) continue;
        const f = factOf(k);
        const m = f ? f.mastery : 0;
        const st = staleness(f, now);
        const inZone = ctx.tables.includes(a);
        if (inZone && b >= 2 && b <= 9) buckets.target.push({ k, w: 1.15 - m + (f ? 0 : 0.35) + st * 0.5 });
        if (f && f.attempts > 0 && (m < 0.7 || st >= 1)) {
          buckets.review.push({ k, w: (1 - m) * (1 - m) * 2 + (f.lastResult === false ? 1 : 0) + st });
        }
        if ((inZone && (b === 1 || b === 2 || b === 5 || b === 10)) || m >= 0.8) buckets.easy.push({ k, w: inZone ? 1 : 0.5 });
      }
    }
    const names = Object.keys(MIX).filter((n) => buckets[n].length);
    if (names.length) {
      const bucket = weightedPick(names.map((n) => ({ n, w: MIX[n] }))).n;
      chosen = weightedPick(buckets[bucket]).k;
      source = bucket;
    } else {
      // Everything blocked (tiny pool) — relax to "not the same as last".
      const pool = [];
      ctx.tables.forEach((a) => MULTS.forEach((b) => { if (keyOf(a, b) !== last) pool.push(keyOf(a, b)); }));
      chosen = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  lp.qCount += 1;
  lp.recent.push(chosen);
  if (lp.recent.length > 6) lp.recent.shift();
  const { a, b } = parseKey(chosen);
  return { key: chosen, a, b, answer: a * b, source };
}

/**
 * Record the FIRST outcome of a question (retries after a hint are not recorded as new attempts).
 * remediation = this question was the "second chance" for an earlier mistake.
 */
export function recordAnswer(key, { correct, ms, hinted = false, remediation = false }) {
  const lp = L();
  const f = ensureFact(key);
  f.attempts += 1;
  f.lastSeen = Date.now();
  f.lastResult = correct;
  f.lastMs = Math.round(ms);
  // The second chance is used up once answered (leaving mid-question keeps it queued for later).
  if (remediation) lp.wrongFactQueue = lp.wrongFactQueue.filter((it) => it.key !== key);
  if (correct) {
    f.correct += 1;
    f.streak += 1;
    const speed = ms < 4000 ? 1 : ms < 8000 ? 0.7 : 0.45;       // slow answers grow mastery less
    const gain = hinted ? 0.05 : 0.16 * speed + 0.03 * Math.min(f.streak - 1, 3);
    f.mastery = clamp01(f.mastery + gain);
    f.avgResponseMs = f.avgResponseMs == null ? Math.round(ms) : Math.round(f.avgResponseMs * 0.7 + ms * 0.3);
    if (remediation) f.recovered = (f.recovered || 0) + 1;
  } else {
    f.wrong += 1;
    f.streak = 0;
    f.mastery = clamp01(f.mastery * 0.55 - 0.05);
    // Queue ONE remediation, due after 2 other facts (this question = lp.qCount).
    // A failed remediation is not re-queued (no loops): the low mastery keeps it in the review bucket.
    if (!remediation) {
      const wq = lp.wrongFactQueue;
      const i = wq.findIndex((it) => it.key === key);
      if (i >= 0) wq.splice(i, 1);
      wq.push({ key, dueQ: lp.qCount + 3 });
      if (wq.length > 24) wq.splice(0, wq.length - 24);
    }
  }
}

/** Mastery of a whole table (×1…×10), 0..1, plus how many of its facts were practised. */
export function tableStrength(t) {
  let sum = 0;
  let seen = 0;
  MULTS.forEach((b) => {
    const f = factOf(keyOf(t, b));
    if (f && f.attempts) { seen += 1; sum += f.mastery; }
  });
  return { value: sum / MULTS.length, seen };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Answer options with plausible distractors. level 1 = easier (more distinct) distractors. */
export function makeOptions(q, n, level = 1) {
  const { a, b, answer } = q;
  const near = shuffle([a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b]);
  const tiny = shuffle([answer + 1, answer - 1, answer + 2, answer - 2]);
  const rev = answer >= 12 && answer % 11 !== 0 ? Number(String(answer).split('').reverse().join('')) : null;
  const far = shuffle([answer + a * 2, answer - a * 2, answer + 10, answer - 10]);
  const order = level <= 1 ? [...near.slice(0, 2), ...far, ...tiny] : [...near, ...(rev ? [rev] : []), ...tiny, ...far];
  const out = [answer];
  for (const v of order) {
    if (out.length >= n) break;
    if (v > 0 && v <= 100 && !out.includes(v)) out.push(v);
  }
  let pad = 3;
  while (out.length < n) { if (!out.includes(answer + pad)) out.push(answer + pad); pad += 1; }
  return shuffle(out);
}

const ENCOURAGE = ['Gần đúng rồi!', 'Thử cách này nhé!', 'Không sao, mình thử lại!', 'Cố lên, sắp được rồi!'];

/**
 * Hint ladder (never shown all at once):
 * 1 meaning (groups picture) → 2 repeated addition / skip counting → 3 anchor fact → 4 show answer.
 */
export function hintFor(q, level) {
  const { a, b, answer } = q;
  const title = ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
  if (level <= 1) {
    return { level: 1, title, text: `${a} × ${b} là ${a} được lấy ${b} lần`, groups: { size: a, count: b } };
  }
  if (level === 2) {
    const shown = Math.max(1, Math.ceil(b / 2));
    const chips = [];
    for (let i = 1; i <= shown; i++) chips.push(a * i);
    return { level: 2, title: 'Đếm thêm từng nhóm nhé!', text: Array(b).fill(a).join(' + '), chips, more: b > shown };
  }
  if (level === 3) {
    let lines;
    if (b === 1) lines = [`Số nào nhân 1 cũng bằng chính nó`];
    else if (b === 10) lines = [`Nhân 10: viết thêm số 0 vào sau ${a}`];
    else if (b > 5) lines = [`${a} × 5 = ${a * 5}`, `thêm ${b - 5} lần ${a} nữa: ${a * 5} + ${a * (b - 5)}`];
    else lines = [`${a} × ${b - 1} = ${a * (b - 1)}`, `thêm 1 lần ${a} nữa: ${a * (b - 1)} + ${a}`];
    return { level: 3, title: 'Mẹo nè!', lines };
  }
  return { level: 4, title: 'Xem nè!', reveal: `${a} × ${b} = ${answer}` };
}
