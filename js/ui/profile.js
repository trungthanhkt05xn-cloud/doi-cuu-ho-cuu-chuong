// Player identity: pick an avatar (1 tap) → nickname or skip. Used for first-time onboarding
// and for "change profile" from the Rescue Book. Never touches progress / learning data.
import { getState, save, cleanNickname } from '../state.js';
import { AVATARS, avatarSvg } from './art.js';
import { play, unlockAudio } from '../audio.js';
import { t } from '../i18n.js';

export function renderProfile(host, { mode = 'onboard', onDone, onBack }) {
  const profile = getState().profile;
  let picked = profile.avatarId || '';
  const edit = mode === 'edit';

  host.innerHTML = `
  <div class="profile-screen">
    <header class="topbar"><button class="icon-btn" data-act="back" aria-label="${t('ui.back')}">←</button><div class="spacer"></div></header>
    <div class="profile-body">
      <section class="pf-step pf-pick">
        <h1>${t('pf.pick')}</h1>
        <div class="avatar-grid">${AVATARS.map((a) => `
          <button class="avatar-opt ${a.id === picked ? 'on' : ''}" data-id="${a.id}" aria-label="${t('av.' + a.id)}" aria-pressed="${a.id === picked}">
            ${avatarSvg(a.id, 'happy', 'pf-av')}<small>${t('av.' + a.id)}</small></button>`).join('')}
        </div>
      </section>
      <section class="pf-step pf-name" hidden>
        <div class="pf-me"></div>
        <label class="pf-q" for="pf-nick">${t('pf.ask')}</label>
        <input id="pf-nick" class="pf-input" type="text" maxlength="24" autocomplete="off" autocorrect="off" spellcheck="false"
          autocapitalize="words" enterkeyhint="done" placeholder="${t('pf.placeholder')}">
        <div class="row pf-actions">
          ${edit ? '' : `<button class="btn btn-light" data-act="skip">${t('pf.skip')}</button>`}
          <button class="btn btn-primary" data-act="done">${t('pf.done')}</button>
        </div>
      </section>
    </div>
  </div>`;

  const $ = (s) => host.querySelector(s);
  const input = $('#pf-nick');
  input.value = profile.nickname || '';   // .value — user text never goes through innerHTML
  let step = 'pick';

  const body = $('.profile-body');
  function toName(byKeyboard) {
    step = 'name';
    $('.pf-pick').hidden = true;
    $('.pf-name').hidden = false;
    $('.pf-me').innerHTML = avatarSvg(picked, 'happy', 'pf-av big');
    // The next step always starts at the top; if "Xong" still doesn't fit (short window), bring it
    // gently into view once — the child never has to discover the next button by scrolling.
    body.scrollTop = 0;
    const actions = $('.pf-actions');
    if (actions.getBoundingClientRect().bottom > body.getBoundingClientRect().bottom) {
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      actions.scrollIntoView({ block: 'end', behavior: calm ? 'auto' : 'smooth' });
    }
    // Keyboard path: focus moves to the name box (touch doesn't, so no keyboard pops up uninvited).
    if (byKeyboard) input.focus({ preventScroll: true });
  }
  function toPick() {
    step = 'pick';
    $('.pf-name').hidden = true;
    $('.pf-pick').hidden = false;
    body.scrollTop = 0;
  }
  function finish(nick) {
    // Only identity fields change; stars / missions / mastery / stickers / badges / queue stay untouched.
    profile.avatarId = picked;
    profile.nickname = cleanNickname(nick);
    save();
    input.blur();
    onDone();
  }

  host.querySelector('.profile-screen').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    unlockAudio();
    if (b.classList.contains('avatar-opt')) {
      picked = b.dataset.id;
      host.querySelectorAll('.avatar-opt').forEach((o) => { o.classList.toggle('on', o === b); o.setAttribute('aria-pressed', String(o === b)); });
      play('pop');
      const byKeyboard = e.detail === 0;   // Enter / Space on the button (a pointer click has detail ≥ 1)
      setTimeout(() => toName(byKeyboard), 220);   // a beat to see the choice, then straight on
      return;
    }
    const act = b.dataset.act;
    if (act === 'back') { play('tap'); if (step === 'name') toPick(); else onBack(); }
    if (act === 'skip') { play('tap'); finish(''); }
    if (act === 'done') { play('correct'); finish(input.value); }
  });
  // Keep what the child sees = what gets saved: no leading spaces, max 12 characters (not UTF-16 units).
  input.addEventListener('input', (e) => {
    if (e.isComposing) return;
    const v = input.value.replace(/^\s+/, '');
    const cut = Array.from(v).slice(0, 12).join('');
    if (cut !== input.value) input.value = cut;
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); play('correct'); finish(input.value); } });
}
