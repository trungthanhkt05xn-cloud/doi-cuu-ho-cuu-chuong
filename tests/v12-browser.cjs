// Reuse the cloud's existing Playwright + Chromium. No npm/build infrastructure.
// python3 -m http.server 8000 --bind 0.0.0.0 (from repository root), then:
// node tests/v12-browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const base = process.env.GAME_URL || 'http://127.0.0.1:8000';
const errors = [];
let page;
async function visibleWithin(selector) {
  await page.locator(selector).first().waitFor({ state: 'visible' });
  const boxes = await page.locator(selector).evaluateAll((els) => els.filter((el) => el.getClientRects().length).map((el) => {
    const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  }));
  assert.ok(boxes.length, `${selector} has visible elements`);
  const { width, height } = page.viewportSize();
  for (const b of boxes) assert.ok(b.x >= -1 && b.y >= -1 && b.right <= width + 1 && b.bottom <= height + 1, `${selector} within ${width}x${height}: ${JSON.stringify(b)}`);
}
async function seed({ language = 'vi', support = 'groups', returning = false, forestPilot = false } = {}) {
  await page.evaluate(async ({ language, support, returning, forestPilot }) => {
    const { defaultState } = await import('/js/state.js');
    const s = defaultState(); s.started = true; s.profile.nickname = 'Smoke'; s.profile.avatarId = 'fox';
    s.settings.language = language; s.settings.music = false; s.settings.sound = false;
    for (const id of ['v1','v2','v3','v4','v5','f1','f2','f3','f4','f5']) s.progress.completed[id] = { stars: 3, plays: 1, lastStars: 3 };
    s.forest.stage = forestPilot ? 'quiet' : 'lit';
    if (forestPilot) delete s.progress.completed.f2;
    s.progress.badges = ['village', 'forest']; s.progress.stickers = Object.keys(s.progress.completed); s.progress.revealedZones = ['village', 'forest', 'cove']; s.progress.tutorial.intro = true;
    if (support !== 'groups') for (let a = 2; a <= 9; a++) for (let b = 1; b <= 10; b++) s.learning.facts[`${a}x${b}`] = {
      attempts: 6, correct: 6, wrong: 0, mastery: support === 'recall' ? 0.9 : 0.4, independent: 3, supported: 0, assisted: 0, recovered: 0,
      streak: 3, lastSeen: Date.now(), lastResult: true, lastRepresentation: 'groups', lastSupported: false,
    };
    if (returning) { s.pulse.lastVisit = Date.now() - 24 * 3600000; s.learning.facts['5x7'] = { attempts: 1, correct: 0, wrong: 1, mastery: 0.1, lastResult: false }; }
    localStorage.setItem('mra.save.v1', JSON.stringify(s));
  }, { language, support, returning, forestPilot });
  await page.reload(); await page.locator('#screen-home [data-act="continue"]').click();
}
async function openMission(id) {
  const node = page.locator(`.map-node[data-id="${id}"]`);
  await node.focus(); await node.press('Enter');
  await page.locator('#screen-mission [data-act="start"]').click();
}
async function enterNumber(value) {
  for (const digit of String(value)) { await page.locator(`.key[data-k="${digit}"]`).tap(); await page.waitForTimeout(90); }
  await page.locator('.key-ok').tap();
}
async function finishMission(id, { hint = false, mistake = false, realTouch = false, expectComplete = false, forestPayoff = null } = {}) {
  let wrongGiven = false, echoSeen = false;
  for (let turn = 0; turn < 12; turn++) {
    await page.waitForFunction(() => document.querySelector('.phase-success:not([hidden])') || document.querySelector('.equation')?.dataset.a);
    if (await page.locator('.phase-success:not([hidden])').count()) break;
    const { a, b } = await page.locator('.equation').evaluate((e) => ({ a: +e.dataset.a, b: +e.dataset.b }));
    if (forestPayoff === 'habitat' && turn === 0) {
      assert.equal(await page.locator(`.world-charge[data-value="${a}"]`).getAttribute('aria-pressed'), 'true');
      await page.locator('[data-act="world-send"]').click();
      assert.equal(await page.locator('.station.built').count(), 1, 'earned light can route without selecting a new bundle');
      await page.waitForTimeout(300);
    }
    if (await page.locator('.world-controls').count()) {
      const prebuilt = await page.locator('.gt.built').count();
      if (expectComplete) {
        assert.equal(prebuilt, b - 1, 'COMPLETE establishes exactly b−1 groups');
        assert.equal(await page.locator('.gt:not(.built)').count(), 1, 'one child action remains, including b=1');
        assert.equal(await page.locator('.gt').count(), b, 'full multiplication structure stays present');
        assert.equal(await page.locator('.scene-svg.acting').count(), 1, 'scaffold cannot auto-finish');
        if (id === 'f4' && turn === 0) assert.equal(await page.locator(`.world-charge[data-value="${a}"]`).getAttribute('aria-pressed'), 'true', 'Forest starter bundle composes with COMPLETE');
      }
      if (!expectComplete) assert.equal(prebuilt, forestPayoff === 'habitat' && turn === 0 ? 1 : 0, 'BUILD leaves all groups to the child apart from the explicitly tested starter route');
      await visibleWithin('.world-controls button');
      if (id === 'f2') {
        await page.locator('[data-act="world-add"]').click();
        await page.locator('[data-act="world-send"]').click(); // wrong size is a harmless exploration
        assert.equal(await page.locator('.nest.built').count(), prebuilt);
        for (let i = 1; i < a; i++) await page.locator('[data-act="world-add"]').click();
      } else if (id === 'f4') {
        await page.locator(`[data-act="world-charge"][data-value="${a + 1}"]`).click();
        await page.locator('[data-act="world-send"]').click();
        assert.equal(await page.locator('.station.built').count(), prebuilt);
        await page.locator(`[data-act="world-charge"][data-value="${a}"]`).click();
      }
      const builtBefore = await page.locator('.gt.built').count();
      for (let i = builtBefore; i < b; i++) {
        if (realTouch && i === 0) await page.locator('.gt:not(.built)').first().tap();
        else await page.locator('[data-act="world-send"]').click();
      }
      await page.locator('.world-controls').waitFor({ state: 'detached' });
      if (id === 'f2') assert.ok(parseFloat(await page.locator('[id$="pathLit"]').getAttribute('stroke-dasharray')) > 0);
      if (id === 'f4') assert.ok(+(await page.locator('[id$="mist"]').getAttribute('opacity')) < 0.92);
    }
    if (forestPayoff && turn === 0) {
      const stage = await page.evaluate(() => JSON.parse(localStorage.getItem('mra.save.v1')).forest.stage);
      assert.equal(stage, forestPayoff === 'light' ? 'quiet' : 'lit', 'world action alone does not earn the handoff');
    }
    if (expectComplete) {
      assert.equal(await page.locator('.scene-svg.scaffold-faded').count(), 0, 'COMPLETE retains the full visible structure before retrieval');
      assert.equal(await page.locator('.gt.built').count(), b);
    }
    if (await page.locator('.task-card.again').count()) echoSeen = true;
    if (hint) { await page.locator('[data-act="help"]').click(); await page.locator('.hint-close').click(); }
    const keypad = await page.locator('.answers.keypad').count();
    if (mistake && !wrongGiven) {
      if (keypad) { await enterNumber(a * b + 1); }
      else await page.locator(`.opt:not([data-value="${a * b}"])`).first().click();
      await page.locator('.hint-close').click(); wrongGiven = true;
    }
    if (keypad) { await enterNumber(a * b); }
    else await page.locator(`.opt[data-value="${a * b}"]`).click();
    if (forestPayoff && turn === 0) {
      await page.waitForFunction((expected) => JSON.parse(localStorage.getItem('mra.save.v1')).forest.stage === expected, forestPayoff === 'light' ? 'lit' : 'connected');
      await page.locator(forestPayoff === 'light' ? '.forest-receiver[data-lit="true"]' : '.forest-habitat[data-connected="true"]').waitFor();
    }
    const prev = await page.locator('.pips i.on').count();
    await page.waitForFunction((prev) => document.querySelectorAll('.pips i.on').length > prev || document.querySelector('.phase-success:not([hidden])'), prev, { timeout: 15000 });
    await page.waitForFunction(() => document.querySelector('.phase-success:not([hidden])') || !document.querySelector('.opt.correct') && !document.querySelector('.ans-slot.ok'), null, { timeout: 15000 });
  }
  await page.locator('.phase-success:not([hidden])').waitFor();
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('mra.save.v1')));
  assert.ok(state.progress.completed[id]);
  if (hint && !mistake) assert.equal(state.progress.completed[id].lastStars, 3);
  return { state, echoSeen };
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    page = await ctx.newPage(); page.setDefaultTimeout(8000);
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (e) => { if (e.type() === 'error') errors.push(e.text()); });
    page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.addInitScript(() => { let n = 91; Math.random = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; }; });
    await page.goto(base);
    await visibleWithin('#screen-home [data-act="start"]');
    await page.locator('#screen-home [data-act="start"]').click(); await page.locator('.avatar-opt').first().click();
    await page.locator('#pf-nick').fill('Smoke'); await visibleWithin('.pf-actions button'); await page.locator('[data-act="done"]').click();
    await openMission('v1'); await finishMission('v1', { hint: true });
    await page.reload(); await page.locator('#screen-home [data-act="continue"]').click();
    assert.equal(await page.locator('.map-node[data-id="v1"]').getAttribute('class').then((s) => s.includes('done')), true);
    console.log('PASS profile / existing repair / Hint keeps stars / save-reload');

    await seed({ forestPilot: true }); await openMission('f2');
    assert.equal(await page.locator('.forest-receiver').getAttribute('data-lit'), 'false');
    await finishMission('f2', { forestPayoff: 'light', hint: true });
    await page.reload(); await page.locator('#screen-home [data-act="continue"]').click();
    assert.equal(await page.locator('.forest-connection').getAttribute('data-stage'), 'lit');
    await openMission('f4');
    assert.equal(await page.locator('.forest-receiver').getAttribute('data-lit'), 'true');
    assert.equal(+(await page.locator('[id$="mist"]').getAttribute('opacity')), .72);
    await visibleWithin('.forest-cue');
    // Wait for the existing pop-in animation before checking the settled scene layout.
    await page.waitForFunction(() => {
      const svg = document.querySelector('.scene-svg');
      const cue = svg.querySelector('.forest-cue').getBoundingClientRect();
      const cap = svg.querySelector('.caption').getBoundingClientRect();
      const habitat = svg.querySelector('.forest-habitat').getBoundingClientRect();
      return cue.top >= cap.bottom && habitat.bottom <= svg.closest('.m-scene').getBoundingClientRect().bottom;
    });
    await finishMission('f4', { forestPayoff: 'habitat', realTouch: true });
    await page.reload(); await page.locator('#screen-home [data-act="continue"]').click();
    assert.equal(await page.locator('.forest-connection').getAttribute('data-stage'), 'connected');
    assert.equal(await page.locator('.forest-habitat .forest-wildlife').getAttribute('opacity'), '1');
    console.log('PASS V1.3 Fireflies → Signal starting light/mist → habitat / visible payoff / map persistence');
    if (process.env.V13_ONLY) { assert.deepEqual(errors, []); console.log('PASS targeted V1.3 final regression / no browser errors'); return; }

    await seed(); await openMission('f2'); const firefly = await finishMission('f2', { mistake: true, realTouch: true });
    assert.ok(firefly.echoSeen, 'Fact Echo exercised during the mission');
    assert.ok(Object.values(firefly.state.learning.facts).some((f) => f.supported > 0));
    console.log('PASS firefly grouping / harmless sizing / touch / Fact Echo / reward');

    await seed({ language: 'en' }); await openMission('f4'); await finishMission('f4', { hint: true, realTouch: true });
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    console.log('PASS signal routing / wrong bundle exploration / touch / EN / Hint');

    await seed({ support: 'structure' }); await openMission('f2'); await finishMission('f2', { expectComplete: true });
    await seed({ support: 'structure', language: 'en' }); await openMission('f4');
    const completeSignal = await finishMission('f4', { expectComplete: true });
    assert.ok(Object.values(completeSignal.state.learning.facts).some(f => f.supported > 0 && f.lastSupported));
    // Exercise b=1 explicitly using the existing mechanics; no question-selection lottery.
    assert.deepEqual(await page.evaluate(async () => {
      const { missionById, zoneById } = await import('/js/game/catalog.js');
      const results = [];
      for (const [type, id, representation] of [['firefly', 'f2', 'array'], ['signal', 'f4', 'groups']]) {
        const { create } = await import(`/js/ui/mechanics/${type}.js`);
        const host = document.createElement('div'); host.className = 'mission'; document.body.appendChild(host);
        let ready = 0;
        const mech = create({ root: host, mission: missionById(id), zone: zoneById('forest'), P: `single-${type}-`, grew() {}, ready() { ready++; } });
        try {
          mech.setQuestion({ a: 5, b: 1, answer: 5, encounter: { support: 'structure', mode: 'COMPLETE', representation } }, 0);
          const before = [host.querySelectorAll('.gt.built').length, host.querySelectorAll('.gt:not(.built)').length, ready];
          if (type === 'firefly') for (let i = 0; i < 5; i++) mech.handleAction('world-add');
          else mech.handleAction('world-charge', 5);
          mech.handleAction('world-send');
          await new Promise(resolve => setTimeout(resolve, 850));
          results.push({ before, after: host.querySelectorAll('.gt.built').length, ready });
        } finally { mech.destroy(); host.remove(); }
      }
      return results;
    }), [{ before: [0, 1, 0], after: 1, ready: 1 }, { before: [0, 1, 0], after: 1, ready: 1 }]);
    console.log('PASS COMPLETE b=1 / opposite representations / one child action / ready once');
    console.log('PASS Fireflies COMPLETE / Signal COMPLETE + Forest starter / one missing group / supported evidence');
    await seed({ support: 'recall' }); await openMission('f4');
    assert.equal(await page.locator('.world-controls').count(), 0);
    assert.ok(await page.locator('.scene-svg.scaffold-faded').count());
    await page.locator('[data-act="help"]').click(); assert.equal(await page.locator('.scene-svg.scaffold-faded').count(), 0); await page.locator('.hint-close').click();
    await finishMission('f4'); console.log('PASS COMPLETE / independent retrieval / optional support restores');
    if (process.env.REPAIR_ONLY) { assert.deepEqual(errors, []); console.log('PASS targeted repair / no browser errors'); return; }

    await seed({ returning: true }); assert.ok(await page.locator('.pulse-card').count()); await visibleWithin('.pulse-card button');
    await page.locator('[data-act="pulse"]').click(); await page.locator('#screen-mission [data-act="start"]').click();
    const id = await page.evaluate(() => document.querySelector('.world-controls [data-act="world-add"]') ? 'f2' : 'f4');
    const pulse = await finishMission(id); assert.ok(pulse.state.pulse.lastCompleted); assert.equal(pulse.state.pulse.blooms.length, 1);
    await page.locator('.phase-success [data-act="continue"]').click(); assert.equal(await page.locator('.pulse-card').count(), 0);
    assert.ok(await page.locator('.learner-garden').count());
    await page.locator('[data-act="album"]').click(); assert.ok(await page.locator('.gems .gem').count()); assert.ok(await page.locator('.learner-note').count());
    await page.reload(); await page.locator('#screen-home [data-act="continue"]').click(); assert.equal(await page.locator('.pulse-card').count(), 0);
    console.log('PASS return rescue / persistent butterfly & garden / Rescue Book / no repeated Pulse');

    await page.locator('.map-top [data-act="settings"]').click();
    await page.locator('#sheet-root [data-act="music"]').click(); await page.locator('#sheet-root [data-act="sound"]').click();
    const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('mra.save.v1')).settings); assert.equal(settings.music, true); assert.equal(settings.sound, true);
    await page.locator('#sheet-root [data-act="lang"][data-lang="en"]').click(); assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page.locator('#sheet-root button[data-act="close"]').click(); console.log('PASS Music/Sound settings / in-game VI to EN switch');
    // Targeted responsive checks for the released iPad four-choice/onboarding guards.
    for (const [width, height] of [[1024,768],[1133,744],[430,932],[440,956],[360,800],[1280,800]]) {
      await page.setViewportSize({ width, height }); await seed(); await openMission('f2');
      const a = +(await page.locator('.equation').getAttribute('data-a')), b = +(await page.locator('.equation').getAttribute('data-b'));
      for (let i = 0; i < a; i++) await page.locator('[data-act="world-add"]').click();
      for (let i = 0; i < b; i++) await page.locator('[data-act="world-send"]').click();
      await page.locator('.world-controls').waitFor({ state: 'detached' }); assert.equal(await page.locator('.opt').count(), 4); await visibleWithin('.opt');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.evaluate(() => localStorage.removeItem('mra.save.v1')); await page.reload(); await page.locator('[data-act="start"]').click(); await page.locator('.avatar-opt').first().click(); await visibleWithin('.pf-actions button');
    }
    await page.setViewportSize({ width: 390, height: 844 }); await seed(); await openMission('f2');
    const groupSize = +(await page.locator('.equation').getAttribute('data-a'));
    for (let i = 0; i < groupSize; i++) await page.locator('[data-act="world-add"]').click();
    await page.locator('[data-act="world-send"]').click(); await page.goBack(); await page.waitForTimeout(1100);
    assert.ok(await page.locator('#screen-map.active').count()); assert.equal(await page.locator('#screen-mission.active').count(), 0);
    const afterBack = await page.evaluate(() => JSON.parse(localStorage.getItem('mra.save.v1')));
    assert.equal(afterBack.progress.completed.f2.plays, 1);
    console.log('PASS back navigation during world action / no stale mission reward');
    console.log('PASS responsive dimensions / iPad four-answer guard / onboarding guard (Chromium emulation only)');
    assert.deepEqual(errors, []); console.log('PASS no page/console errors or failed HTTP responses');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
