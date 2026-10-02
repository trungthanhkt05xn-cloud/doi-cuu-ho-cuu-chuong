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
async function seed({ language = 'vi', support = 'groups', returning = false } = {}) {
  await page.evaluate(async ({ language, support, returning }) => {
    const { defaultState } = await import('/js/state.js');
    const s = defaultState(); s.started = true; s.profile.nickname = 'Smoke'; s.profile.avatarId = 'fox';
    s.settings.language = language; s.settings.music = false; s.settings.sound = false;
    for (const id of ['v1','v2','v3','v4','v5','f1','f2','f3','f4','f5']) s.progress.completed[id] = { stars: 3, plays: 1, lastStars: 3 };
    s.progress.badges = ['village', 'forest']; s.progress.stickers = Object.keys(s.progress.completed); s.progress.revealedZones = ['village', 'forest', 'cove']; s.progress.tutorial.intro = true;
    if (support !== 'groups') for (let a = 2; a <= 9; a++) for (let b = 1; b <= 10; b++) s.learning.facts[`${a}x${b}`] = {
      attempts: 6, correct: 6, wrong: 0, mastery: support === 'recall' ? 0.9 : 0.4, independent: 3, supported: 0, assisted: 0, recovered: 0,
      streak: 3, lastSeen: Date.now(), lastResult: true, lastRepresentation: 'groups', lastSupported: false,
    };
    if (returning) { s.pulse.lastVisit = Date.now() - 24 * 3600000; s.learning.facts['5x7'] = { attempts: 1, correct: 0, wrong: 1, mastery: 0.1, lastResult: false }; }
    localStorage.setItem('mra.save.v1', JSON.stringify(s));
  }, { language, support, returning });
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
async function finishMission(id, { hint = false, mistake = false, realTouch = false, expectFaded = false } = {}) {
  let wrongGiven = false, echoSeen = false;
  for (let turn = 0; turn < 12; turn++) {
    await page.waitForFunction(() => document.querySelector('.phase-success:not([hidden])') || document.querySelector('.equation')?.dataset.a);
    if (await page.locator('.phase-success:not([hidden])').count()) break;
    const { a, b } = await page.locator('.equation').evaluate((e) => ({ a: +e.dataset.a, b: +e.dataset.b }));
    if (await page.locator('.world-controls').count()) {
      await visibleWithin('.world-controls button');
      if (id === 'f2') {
        await page.locator('[data-act="world-add"]').click();
        await page.locator('[data-act="world-send"]').click(); // wrong size is a harmless exploration
        assert.equal(await page.locator('.nest.built').count(), 0);
        for (let i = 1; i < a; i++) await page.locator('[data-act="world-add"]').click();
      } else if (id === 'f4') {
        await page.locator(`[data-act="world-charge"][data-value="${a + 1}"]`).click();
        await page.locator('[data-act="world-send"]').click();
        assert.equal(await page.locator('.station.built').count(), 0);
        await page.locator(`[data-act="world-charge"][data-value="${a}"]`).click();
      }
      for (let i = 0; i < b; i++) {
        if (realTouch && i === 0) await page.locator('.gt:not(.built)').first().tap();
        else await page.locator('[data-act="world-send"]').click();
      }
      await page.locator('.world-controls').waitFor({ state: 'detached' });
      if (id === 'f2') assert.ok(parseFloat(await page.locator('[id$="pathLit"]').getAttribute('stroke-dasharray')) > 0);
      if (id === 'f4') assert.ok(+(await page.locator('[id$="mist"]').getAttribute('opacity')) < 0.92);
    }
    if (expectFaded) assert.equal(await page.locator('.scene-svg.scaffold-faded').count(), 1);
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

    await seed(); await openMission('f2'); const firefly = await finishMission('f2', { mistake: true, realTouch: true });
    assert.ok(firefly.echoSeen, 'Fact Echo exercised during the mission');
    assert.ok(Object.values(firefly.state.learning.facts).some((f) => f.supported > 0));
    console.log('PASS firefly grouping / harmless sizing / touch / Fact Echo / reward');

    await seed({ language: 'en' }); await openMission('f4'); await finishMission('f4', { hint: true, realTouch: true });
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    console.log('PASS signal routing / wrong bundle exploration / touch / EN / Hint');

    await seed({ support: 'structure' }); await openMission('f2'); await finishMission('f2', { expectFaded: true });
    await seed({ support: 'recall' }); await openMission('f4');
    assert.equal(await page.locator('.world-controls').count(), 0);
    assert.ok(await page.locator('.scene-svg.scaffold-faded').count());
    await page.locator('[data-act="help"]').click(); assert.equal(await page.locator('.scene-svg.scaffold-faded').count(), 0); await page.locator('.hint-close').click();
    await finishMission('f4'); console.log('PASS faded scaffold / independent retrieval / optional support restores');

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
