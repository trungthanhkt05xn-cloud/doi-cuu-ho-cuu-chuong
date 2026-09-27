# PROJECT STATUS

## Current phase
MVP COMPLETE — ready for real-device playtest (iPhone/iPad Safari) with children.

## Locked
- Concept: Adventure Map + Rescue Missions
- Audience: Grade 3 / age 8–9
- Module: Multiplication tables 2–9
- Platform: Web / iPhone / iPad / desktop
- MVP: Static, local-first

## Milestones
- [x] M0 Bootstrap — Home + Map shell, state/localStorage, routing. 0 console errors, no horizontal overflow.
- [x] M1 Core Math Interaction — generator, choices + keypad, feedback, 4-step hint ladder, persistence per answer.
- [x] M2 Mission Engine — 15 missions, 5 mechanics (repair / unlock / path / rescue / light) × 3 zone skins.
- [x] M3 Adventure Map + Progression — sequential unlock, finale after 3/4, zone unlock + cloud reveal, hero walks the trail, stars/stickers/badges.
- [x] M4 Adaptive Learning — simulated 300 questions: weak facts ~3–4× more frequent, never back-to-back (min gap 5), frequency normalises once learned.
- [x] M5 Visual Polish — zone skins, Bíp moods, combo streak, confetti, big-screen scaling, synthesized SFX.
- [x] M6 Mobile/Safari — checked 375×667, 390×844, 844×390, 820×1180, 1180×820, 1440×900 (Chrome device emulation). Real Safari not available here → see "Check on device".
- [x] M7 Final QC — full fresh playthrough of all 15 missions: 0 console errors, DOM size stable (~950–1060 nodes), all 3 badges + 15 stickers.

## Final QC (docs/08_QA_ACCEPTANCE.md)
| Group | Result | Notes |
|---|---|---|
| A. Functional | PASS | Home/Continue, lock/unlock, answer check, hints, no double reward (triple-tap tested), reload keeps progress, reset with confirm, sound setting saved, corrupt save recovers. |
| B. Learning | PASS | Tables 2–9 reached; zone focus 50/30/20 mix; wrong facts re-queued (twin +3, fact +6); mastery/response time stored. Hints only after a mistake or via 💡 (💡 never shows the answer). |
| C. Child UX | PASS* | Intro ≤ 2 short sentences, big buttons, no game over, every answer changes the scene. *Needs a real child playtest. |
| D. Visual | PASS | 3 distinct zone identities, correct/wrong use icons (✓ / ↺) + motion, not only colour. |
| E. Mobile/Safari | PARTIAL | Layout/overflow/targets/orientation verified in emulation; safe-area, audio unlock and Safari toolbars must be confirmed on a real iPhone/iPad. |
| F. Performance | PASS | ~217 KB total, zero images/fonts to download, transform/opacity animations only, no DOM growth over 15 missions. |
| G. Product gate | PASS | Math drives the action (plank laid, lock opens, path taken, balloon lifts, lamp lights). Wrong → gentle hint + retry. Next mission always visible on the map. |

## Decisions (spec gaps)
- Docs came zipped; extracted to repo root. QA file is `docs/08_QA_ACCEPTANCE.md`.
- Hints follow Vietnamese textbooks: `a × b` = "a được lấy b lần" (a + a + … b times).
- Facts = tables 2–9 × multipliers 1–10 (80 order-sensitive facts).
- Unlock: regular missions sequential; finale after 3/4 regular; finale opens next zone.
- Stars: share of first-try correct answers (≥85% → 3, ≥50% → 2, else 1); best score kept, total derived (no double counting).

## Check on device (not verifiable here)
- iOS silent switch mutes WebAudio — sound only plays with the ringer on.
- Safari bottom toolbar / home indicator vs. answer buttons (safe-area padding in place).
- Rotation mid-mission; Add to Home Screen launch.

## Roadmap candidates (not in MVP)
PWA/offline, more missions per zone, parent summary, daily challenge (see docs/09_FUTURE_ROADMAP.md).
