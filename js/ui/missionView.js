// Mission screen: intro → play (scene + task card + answers + hints) → success.
// The mechanic module owns the scene; this view owns the answer UI and the flow.
import { missionById, zoneById } from '../game/catalog.js';
import { MissionSession } from '../game/missionEngine.js';
import { getState, save, nickname } from '../state.js';
import { play, unlockAudio } from '../audio.js';
import { t, missionText, npcName, badgeName, zoneName } from '../i18n.js';
import { heroAvatar, groupsPicture, starPath } from './art.js';
import { wait, floatText, confetti, retrigger } from './fx.js';
import { balloonShape } from './mechanics/rescue.js';
import * as repair from './mechanics/repair.js';
import * as unlock from './mechanics/unlock.js';
import * as pathM from './mechanics/path.js';
import * as rescue from './mechanics/rescue.js';
import * as light from './mechanics/light.js';

const MECHANICS = { repair, unlock, path: pathM, rescue, light };
const BALLOON_COLORS = ['#ff6b6b', '#4cc3ff', '#ffc933', '#57d68d', '#b98cff', '#ff8fc7'];
let uid = 0;
let keyHandler = null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const starSvg = (on) => `<svg viewBox="0 0 40 40" class="star ${on ? 'on' : ''}" aria-hidden="true"><path d="${starPath(20, 21, 18)}"/></svg>`;

export function renderMission(host, missionId, { onExit, onDone }) {
  const mission = missionById(missionId);
  const zone = zoneById(mission.zone);
  const P = `m${++uid}-`;
  const st = getState();

  host.innerHTML = `
  <div class="mission theme-${zone.id}">
    <header class="topbar m-top">
      <button class="icon-btn" data-act="exit" aria-label="${t('ms.exit')}">✕</button>
      <div class="m-title"><span class="m-npc">${mission.npc.e}</span><span>${esc(missionText(mission, 'title'))}</span></div>
      <div class="pips" aria-label="${t('ms.progress')}">${Array.from({ length: mission.steps }, () => '<i></i>').join('')}</div>
    </header>
    <div class="m-body">
      <div class="m-scene">
        <div class="scene-host"></div>
        <div class="hint-bubble" hidden role="status" aria-live="polite">
          <div class="hint-avatar">${heroAvatar('happy')}</div>
          <div class="hint-content"></div>
          <button class="hint-close" aria-label="${t('ms.closeHint')}">✕</button>
        </div>
        <div class="exit-confirm" hidden>
          <p>${t('ms.exitAsk')}</p>
          <div class="row"><button class="btn btn-light" data-act="stay">${t('ms.stay')}</button><button class="btn btn-primary small" data-act="leave">${t('ms.leave')}</button></div>
        </div>
      </div>
      <div class="m-panel">
        <div class="phase phase-intro">
          <div class="intro-card">
            <div class="intro-duo"><span class="intro-av">${heroAvatar('happy')}</span><span class="intro-npc">${mission.npc.e}</span></div>
            <h2>${t('ms.needsYou', { nick: '<span class="nick"></span>', npc: esc(npcName(mission)) })}</h2>
            <p>${esc(missionText(mission, 'intro'))}</p>
            <button class="btn btn-primary big" data-act="start">${t('ms.go')}</button>
          </div>
        </div>
        <div class="phase phase-play" hidden>
          <div class="task-card">
            <span class="task-icon" aria-hidden="true"></span>
            <div class="task-main">
              <div class="task-instr"></div>
              <div class="equation" aria-live="polite"></div>
            </div>
            <button class="help-btn" data-act="help" aria-label="${t('ms.hint')}">💡</button>
          </div>
          <div class="answers"></div>
        </div>
        <div class="phase phase-success" hidden></div>
      </div>
    </div>
  </div>`;

  const root = host.querySelector('.mission');
  const $ = (sel) => root.querySelector(sel);
  const sceneHost = $('.scene-host');
  const answersEl = $('.answers');
  const eqEl = $('.equation');
  const hintEl = $('.hint-bubble');
  // The nickname is user text: always set with textContent, never through innerHTML.
  const fillNick = (el) => el.querySelectorAll('.nick').forEach((n) => { n.textContent = nickname(); });
  fillNick(root);
  let busy = true;
  let phase = 'intro';
  let typed = '';
  let optionEls = [];
  let okKey = null;
  let combo = 0;
  const heroMood = (m) => {
    const b = sceneHost.querySelector('.bip');
    if (b) { b.classList.remove('happy', 'think'); if (m) b.classList.add(m); }
  };

  const mech = MECHANICS[mission.type].create({
    root: sceneHost, mission, zone, P,
    pick: (value, el) => onAnswer(value, el),
  });
  const session = new MissionSession(mission, { answerKind: mech.answerKind, optionCount: mech.optionCount });
  $('.task-icon').textContent = mech.icon;
  $('.task-instr').textContent = mech.instruction;
  const firstTimeType = !st.progress.tutorial.mechanics[mission.type];

  // ── answers UI ──
  function renderChoices(options) {
    const colors = BALLOON_COLORS.slice().sort(() => Math.random() - 0.5);
    answersEl.className = `answers choices skin-${mech.skin} n${options.length}`;
    answersEl.innerHTML = options.map((v, i) => {
      const color = colors[i % colors.length];
      let inner = `<span class="num">${v}</span>`;
      if (mech.skin === 'balloon' || mech.skin === 'lantern' || mech.skin === 'bubble') {
        inner = `<svg viewBox="-24 -26 48 70" class="opt-art" aria-hidden="true">${balloonShape(mech.skin, color)}<path d="M0 22 q-4 8 0 14 q4 6 0 12" stroke="${mech.skin === 'bubble' ? 'transparent' : '#fff'}" stroke-width="1.6" fill="none"/></svg><span class="num">${v}</span>`;
      } else if (mech.skin === 'sign') {
        inner = `<span class="arrow" aria-hidden="true">${mech.arrows[i]}</span><span class="num">${v}</span>`;
      } else if (mech.skin === 'bulb') {
        inner = `<svg viewBox="0 0 30 40" class="bulb-art" aria-hidden="true"><path d="M15 3 a11 11 0 0 1 7 19.5 c-1.5 1.3 -2 3 -2 4.5 h-10 c0 -1.5 -.5 -3.2 -2 -4.5 A11 11 0 0 1 15 3z" /><rect x="10" y="29" width="10" height="3" rx="1.5"/><rect x="11" y="33.5" width="8" height="3" rx="1.5"/></svg><span class="num">${v}</span>`;
      }
      return `<button class="opt" data-value="${v}" data-color="${color}" style="--i:${i}" aria-label="${v}">${inner}<span class="mark" aria-hidden="true"></span></button>`;
    }).join('');
    optionEls = [...answersEl.querySelectorAll('.opt')];
    optionEls.forEach((b) => b.addEventListener('click', () => onAnswer(+b.dataset.value, b)));
  }

  function renderKeypad() {
    answersEl.className = `answers keypad skin-${zone.id}`;
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'];
    answersEl.innerHTML = keys.map((k) => {
      if (k === 'del') return `<button class="key key-del" data-k="del" aria-label="${t('ms.del')}">⌫</button>`;
      if (k === 'ok') return `<button class="key key-ok" data-k="ok" aria-label="${t('ms.ok')}">✓</button>`;
      return `<button class="key" data-k="${k}">${k}</button>`;
    }).join('');
    okKey = answersEl.querySelector('.key-ok');
    // One physical touch = one digit, while repeated digits (44, 66, 88) stay easy to type:
    // - act on pointerdown; a second contact on a key that is still held down is ignored;
    // - the click the browser synthesises after that same touch is ignored;
    // - a same-digit press < 70 ms after the previous one is finger bounce (a deliberate re-tap is far slower).
    const held = new Map();   // pointerId -> key
    let last = { k: null, t: -1e9 };
    answersEl.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.key');
      if (!b || b.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const k = b.dataset.k;
      if ([...held.values()].includes(k)) return;
      held.set(e.pointerId, k);
      const bounce = /^\d$/.test(k) && last.k === k && e.timeStamp - last.t < 70;
      last = { k, t: e.timeStamp };
      b.dataset.ptr = String(e.timeStamp);
      if (!bounce) onKey(k);
    });
    ['pointerup', 'pointercancel'].forEach((t) => answersEl.addEventListener(t, (e) => held.delete(e.pointerId)));
    answersEl.addEventListener('click', (e) => {
      const b = e.target.closest('.key');
      if (!b) return;
      if (b.dataset.ptr && e.timeStamp - Number(b.dataset.ptr) < 1000) { delete b.dataset.ptr; return; }
      onKey(b.dataset.k);   // keyboard / assistive-tech activation (no pointerdown before it)
    });
  }

  function renderEquation(q) {
    const slot = mech.answerKind === 'keypad' ? `<span class="ans-slot typing">${typed || '<i class="caret"></i>'}</span>` : '<span class="ans-slot">?</span>';
    if (okKey) okKey.disabled = !typed;
    eqEl.innerHTML = `<span class="n">${q.a}</span><span class="op">×</span><span class="n">${q.b}</span><span class="op">=</span>${slot}`;
    eqEl.dataset.a = q.a;
    eqEl.dataset.b = q.b;
  }

  function onKey(k) {
    if (busy || phase !== 'play') return;
    unlockAudio();
    eqEl.classList.remove('tutorial');
    if (k === 'del') { typed = typed.slice(0, -1); play('key'); }
    else if (k === 'ok') { if (typed) onAnswer(+typed, null); return; }
    else if (typed.length < 2) { typed += k; play('key'); }
    renderEquation(session.q);
  }

  function updatePips() {
    root.querySelectorAll('.pips i').forEach((p, i) => p.classList.toggle('on', i < session.step));
  }

  // ── hints ──
  function showHint(h) {
    let body = `<div class="hint-title">${esc(h.title)}</div>`;
    if (h.level === 1) body += `<div class="hint-text">${esc(h.text)}</div>${groupsPicture(h.groups.size, h.groups.count)}`;
    if (h.level === 2) body += `<div class="hint-text sum">${esc(h.text)}</div><div class="chips">${h.chips.map((c) => `<span>${c}</span>`).join('')}${h.more ? '<span class="more">…?</span>' : ''}</div>`;
    if (h.level === 3) body += h.lines.map((l) => `<div class="hint-text">${esc(l)}</div>`).join('');
    if (h.level === 4) body += `<div class="hint-reveal">${esc(h.reveal)}</div><div class="hint-text">${mech.answerKind === 'keypad' ? t('ms.typeIt') : t('ms.tapIt')}</div>`;
    hintEl.querySelector('.hint-content').innerHTML = body;
    hintEl.hidden = false;
    retrigger(hintEl, 'show');
  }
  const hideHint = () => { hintEl.hidden = true; };

  // ── flow ──
  function nextStep() {
    const { q, options } = session.next();
    typed = '';
    if (mech.answerKind === 'keypad') { if (!answersEl.classList.contains('keypad')) renderKeypad(); }
    else renderChoices(options);
    renderEquation(q);
    mech.setQuestion(q, session.step, options);
    heroMood('');
    retrigger(eqEl, 'pop');
    // A mistake from a few turns ago comes back once — say so, kindly.
    const again = q.source === 'remediation';
    $('.task-card').classList.toggle('again', again);
    $('.task-instr').textContent = again ? t('ms.again') : mech.instruction;
    // First time with this mechanic: point at where to answer — never at one particular answer.
    if (firstTimeType && session.step === 0) (mech.answerKind === 'keypad' ? eqEl : answersEl).classList.add('tutorial');
    busy = false;
  }

  async function onAnswer(value, el) {
    if (busy || phase !== 'play') return;
    unlockAudio();
    answersEl.classList.remove('tutorial');
    eqEl.classList.remove('tutorial');
    // Taps may come from scene objects (path signs) — mirror them onto the matching button.
    if (!el || !el.classList.contains('opt')) el = optionEls.find((b) => +b.dataset.value === value) || null;
    if (el && el.disabled) return;
    const stepIdx = session.step;
    const res = session.answer(value);
    if (res.correct) {
      busy = true;
      hideHint();
      if (el) el.classList.add('correct');
      if (mech.answerKind === 'keypad') { eqEl.querySelector('.ans-slot').classList.add('ok'); }
      optionEls.forEach((b) => { if (b !== el) b.classList.add('fade'); });
      play('correct');
      heroMood('happy');
      combo = session.hintLevel === 0 ? combo + 1 : 0;
      const recovered = session.q.source === 'remediation' && session.hintLevel === 0;
      const line = recovered ? t('ms.recovered') : combo >= 3 ? t('ms.combo', { n: combo }) : `✓ ${mech.correctLine[Math.floor(Math.random() * mech.correctLine.length)]}`;
      floatText(sceneHost, line, 'good', mech.floatAt || 0.35);   // mechanics keep it off their a × b groups
      await wait(mech.answerKind === 'keypad' ? 280 : 120);
      await mech.onCorrect(stepIdx, el, value);
      updatePips();
      if (res.done) await finish();
      else nextStep();
    } else {
      play('wrong');
      combo = 0;
      heroMood('think');
      if (el) { el.classList.add('wrong'); el.disabled = true; retrigger(el, 'shake'); }
      if (mech.answerKind === 'keypad') { typed = ''; renderEquation(session.q); retrigger(eqEl.querySelector('.ans-slot'), 'shake'); }
      mech.onWrong(value, el);
      showHint(res.hint);
      if (res.hint.level >= 4) {
        const right = optionEls.find((b) => +b.dataset.value === session.q.answer);
        if (right) right.classList.add('reveal');
      }
    }
  }

  async function finish() {
    phase = 'done';
    await mech.onComplete();
    const reward = session.finish();
    if (!st.progress.tutorial.mechanics[mission.type]) { st.progress.tutorial.mechanics[mission.type] = true; save(); }
    showSuccess(reward);
  }

  function showSuccess(r) {
    $('.phase-play').hidden = true;
    const box = $('.phase-success');
    const title = t(mission.finale ? 'rw.finale' : `rw.t${Math.min(3, Math.max(1, r.stars))}`);
    let extras = '';
    if (r.sticker) extras += `<div class="reward-chip"><span class="big">${r.sticker.e}</span> ${t('rw.sticker')} <b>${esc(npcName(mission))}</b></div>`;
    if (r.badge) extras += `<div class="reward-chip badge"><span class="big">${r.badge.icon}</span> <b>${esc(badgeName(zone))}</b></div>`;
    if (r.newZone) extras += `<div class="reward-chip zone">${t('rw.zone')} <b>${esc(zoneName(r.newZone))}</b></div>`;
    // Say why this many stars in one short line; invite a replay only while 3 stars are still to win.
    // Hints used before any mistake cost nothing — say so, so the 💡 button never feels like a trap.
    const why = t('rw.why', { a: r.firstTry, b: r.total, s: r.stars });
    const next = r.best < 3 ? t('rw.tryFor3') : r.stars < 3 ? t('rw.best', { n: r.best }) : r.helped ? t('rw.hintFree') : '';
    box.innerHTML = `<div class="success-card">
      <h2>${title}</h2>
      <div class="stars-row">${[0, 1, 2].map(() => starSvg(false)).join('')}</div>
      <p class="why">${why}</p>${next ? `<p class="why-next">${next}</p>` : ''}
      <p class="saved">${mission.npc.e} ${t('rw.thanks', { nick: '<span class="nick"></span>' })}</p>
      ${extras}
      <div class="row">
        <button class="btn btn-light" data-act="replay">${t('rw.replay')}</button>
        <button class="btn btn-primary" data-act="continue">${t('rw.continue')}</button>
      </div></div>`;
    fillNick(box);
    box.hidden = false;
    play('fanfare');
    confetti(mission.finale ? 60 : 36);
    const stars = box.querySelectorAll('.star');
    for (let i = 0; i < r.stars; i++) {
      setTimeout(() => { stars[i].classList.add('on', 'pop'); play('star'); }, 350 + i * 280);
    }
    session.lastReward = r;
  }

  // ── controls ──
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    unlockAudio();
    const act = b.dataset.act;
    if (act === 'start' && phase === 'intro') {
      play('tap');
      phase = 'play';
      $('.phase-intro').hidden = true;
      $('.phase-play').hidden = false;
      nextStep();
    } else if (act === 'help' && phase === 'play' && !busy) {
      play('tap');
      showHint(session.help());
    } else if (act === 'exit') {
      play('tap');
      if (phase === 'play' && session.step > 0) $('.exit-confirm').hidden = false;
      else leave(false);
    } else if (act === 'stay') {
      $('.exit-confirm').hidden = true;
    } else if (act === 'leave') {
      leave(false);
    } else if (act === 'continue') {
      b.disabled = true;
      play('tap');
      leave(true);
    } else if (act === 'replay') {
      b.disabled = true;
      play('tap');
      cleanup();
      renderMission(host, missionId, { onExit, onDone });
    }
  });
  hintEl.querySelector('.hint-close').addEventListener('click', hideHint);

  function leave(completed) {
    cleanup();
    if (completed) onDone(mission, session.reward);
    else onExit(mission);
  }

  function cleanup() {
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
    mech.destroy();
  }

  // Desktop keyboard support.
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (e) => {
    if (e.defaultPrevented) return;   // e.g. the Enter that opened this mission from the map
    if (phase === 'intro' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); root.querySelector('[data-act="start"]').click(); return; }
    if (phase !== 'play') return;
    // Enter/Space on a focused button already activates that button — don't act twice.
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.tagName === 'BUTTON') return;
    if (mech.answerKind === 'keypad') {
      if (/^[0-9]$/.test(e.key)) onKey(e.key);
      else if (e.key === 'Backspace') onKey('del');
      else if (e.key === 'Enter') onKey('ok');
    } else if (/^[1-4]$/.test(e.key)) {
      const b = optionEls[+e.key - 1];
      if (b && !b.disabled) b.click();
    }
  };
  document.addEventListener('keydown', keyHandler);
}
