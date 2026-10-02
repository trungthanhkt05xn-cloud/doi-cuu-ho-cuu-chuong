# V1.2 — Adaptive Living Rescue candidate

Baseline: `v1.1.0`, `5dd96b71c8be920719ddbbe4d1943ecc749d77ce`.
Branch: `feature/v1.2-adaptive-living-rescue`. This is a QA candidate, not a release.

The world now uses learning evidence to change how a familiar rescue is played. No new world, mission pack, backend, dependency, account, or audio rewrite was added.

## Implemented

- The existing target/review/easy director and wrong-fact queue remain in place. Selection accepts a supplied clock and random function for reproducible checks. Ordinary selection avoids the last four facts and the twins/products of the last two; Echo requires two intervening questions and obeys the same adjacent twin/product guard. A fact receives at most one Echo per mission, consecutive Echoes are blocked, and a failed Echo is removed rather than requeued.
- Fact records add independent retrieval, supported success, whether the last response was supported, and its representation. Voluntary Hint success gains less mastery than independent success; supported picture-based success is also distinct. Neither builds an independent streak. Mistakes continue to restore support without affecting existing best stars.
- Fireflies: children assemble a reusable group of fireflies in a jar, then send that group to each nest. A nest only accepts the matching group size. Each filled nest lights part of the actual path before the final product is recalled.
- Forest Signal: children choose a visual bundle that fits a station's sockets and route it to the stations. Each matching connection clears some mist before product retrieval. Incorrect group-size exploration is harmless and can be revised.
- Both mechanics use visible groups for early confidence, hide the detail after construction for lighter scaffolding, and offer independent retrieval for confident facts. Hint restores the picture. Fact Echo can change scattered groups into an array of columns, or the reverse, based on the last representation.
- World Pulse offers one optional familiar rescue after a return gap of six hours, with at least eighteen hours between completed Pulses. It prioritizes practised weak/stale tables in completed regular missions. Dismissal, abandonment, and missed days cost nothing. It retains the existing question mixture and rewards; there is no countdown or streak.
- Gardens reflect friendly learning stages and retain their highest earned growth. A completed return rescue leaves a persistent butterfly. Rescue Book keeps its friendly stages and adds a short positive garden note.
- All new copy is available in Vietnamese and English. Existing profile, sound/music, soundscape, progression, stars, stickers, badges, and content remain intact. Mission cleanup prevents asynchronous completion after back navigation.

## Save migration

Schema **3**, storage key still `mra.save.v1`. V1 passes through its existing queue migration; V2 advances to V3 using safe defaults. Completed missions, world progress, stars, stickers, badges, identity, settings, mastery, and queued mistakes are preserved. Legacy independent evidence is inferred from correct responses minus assisted responses; the exact last historical representation cannot be reconstructed, so it remains unknown. Saves with assisted history conservatively retain support until fresh retrieval evidence is recorded. Invalid optional fields are sanitized without discarding valid progress.

## Automated verification

Candidate validation: **PASS** — all 8 logic tests; the complete Chromium browser script (exit 0); and `git diff --check`. No checks were skipped. No page/console errors or failed HTTP responses were observed. Real-device and child QA below remain unrun.

From the repository root:

```sh
node --test tests/v12-logic.mjs
python3 -m http.server 8000 --bind 0.0.0.0
```

In another session:

```sh
node tests/v12-browser.cjs
git diff --check
```

The browser script reuses the cloud's installed Playwright and Chromium. `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, and `GAME_URL` can override their locations; no package installation or build is needed.

Logic coverage: independent/Hint/scaffold evidence; support fading; changed Echo representations; weak-fact spacing and queue exhaustion; weak and mastered review; reproducible selection; V1/V2 migration and round-trip; malformed fields; return eligibility/selection/dismissal/gaps; persistent blooms; no garden regression; Hint-safe stars and idempotent rewards.

Browser coverage: initial profile flow; existing repair; grouping and routing with direct touch; sizing/bundle exploration; Hint and Echo; reduced support and restored hints; completion/rewards; World Pulse, gardens, butterfly and Rescue Book; save/reload; language switching; sound/music setting persistence; responsive layout guards; back navigation during construction; page/console errors and HTTP failures.

Responsive dimensions: 390×844, 1024×768, 1133×744, 430×932, 440×956, 360×800, and 1280×800. These are Chromium viewport checks, **not** Safari, Android device, or real iPhone/iPad passes.

## Creative deviations / improvements

- Two existing mechanics were selected: constructing an equal group and routing a fitting bundle. No third mechanic or new minigame was needed.
- Earned garden growth is retained rather than shrinking after a mistake.
- Return rescues reuse the existing 3–5-step regular missions. Their intended short session duration is a child-QA estimate, not a measured guarantee or timer.
- Added cleanup for navigation away during asynchronous world actions.

## Real-device / human QA required

- iPad Pro 9.7-inch and iPad mini 6, portrait and landscape: onboarding controls, all four answers, Signal keypad, touch targets, array clarity, and Hint overlay.
- iPhone 13 Pro Max / 16 Pro Max, representative Android phone/tablet, and desktop: safe areas, orientation, direct touch/sweep, repeated keypad digits, back/exit, and reload persistence.
- Real children aged about 8–9: understand the jar and bundle-routing actions, recognize the immediate world consequence, tolerate mistakes, use Hint comfortably, and find return rescues inviting; measure actual session duration.
- Human listening: Living Soundscape and independent Music/Sound controls. The released old-iPad background-music distortion observation is unchanged and has not been re-evaluated here.
- Independent QA of a preview before any release decision. No merge, tag, or production deployment is authorized by this task.
