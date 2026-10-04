# V1.3 — Living Math Systems candidate

Baseline: main and v1.2.0 at `5615b359594592726a9041450bd155bded41c2b5`.
Branch: `feature/v1.3-living-math-systems`. Candidate only; owner independent QA is pending.

## Forest pilot

Successful Fireflies total retrieval sends earned light to a shared Signal receiver. Signal then starts with visible incoming fireflies, thinner mist, and its first matching reusable bundle already charged. The child still routes the bundle to b stations and retrieves the product. Successful Signal retrieval sends a short visible light pulse to the mushroom garden, where butterflies arrive. The map shows the same receiver, connection and habitat; reload retains them. Effects run alongside existing feedback without an additional cutscene wait.

The qualitative Forest state is `quiet → lit → connected`. Construction, incorrect bundle exploration, Hint, mistakes, and absence cannot move it backwards or generate resources. Success after a mistake can restore the world while the learner record still counts the first failed outcome. Replays are idempotent. Existing Fireflies completion derives light for older players; existing Signal completion does not pre-award the new connection. Signal remains playable independently when light is absent.

## Learning and World Pulse

The existing target/review/easy director, spacing, Hint ladder, retrieval and Echo rules remain. A bounded last Forest mechanic per fact guides changed group/array representations; adjacent supported questions can vary representation deterministically. Confident facts still retrieve independently; hinted and fully supported answers cannot manufacture independent streaks.

Pulse retains optional dismissal and six-hour return/eighteen-hour completion gaps. Its existing learner-need score now also considers the unfinished Forest connection and recent grouping/routing evidence, with small bounded biases. A normally open Signal mission may be offered to finish the handoff; locked progression is never bypassed. Stronger learner need can outrank the world/variety biases. Gardens and prior bloom rewards remain.

## Save and files

Schema 4 retains `mra.save.v1`. V1/V2/V3 migration preserves profile, progression, stars, rewards, settings, learner evidence, queued Echoes and Pulse state. New optional fields sanitize to safe defaults. Forest state is one enum, not a resource count, timer or event history. Existing completion and the enum derive all visual effects.

Changes are confined to state/migration, learning engine, MissionSession, progression's reusable unlock query, World Pulse, Fireflies/Signal/shared SVG helper, mission/map views, VI/EN copy and candidate tests/docs. No dependencies, assets, backend, audio changes or new hosting.

## Verification and review

Result: **PASS** — all 13 logic tests, full Chromium regression, final targeted Chromium regression and `git diff --check`. No page/console errors or failed HTTP responses were observed. The layout check waits for the existing caption pop-in animation before measuring the settled scene.

- Logic: 13 tests covering V1.2 regressions plus transition/replay/migration/sanitization, representation evidence, and Pulse prioritization/unlock behavior.
- Chromium: existing full browser flow extended with Fireflies → map/reload → Signal preloaded-bundle routing → habitat payoff → map/reload. Retains profile/repair, Hint/stars, harmless exploration, touch, Echo, faded/independent support, Pulse/rewards/garden/book, VI/EN/settings, back cancellation, four-answer/onboarding guards and error checks.
- Responsive dimensions: 390×844, 1024×768, 1133×744, 430×932, 440×956, 360×800, 1280×800. Chromium emulation only.
- Actual diff and 390×844 screenshot reviewed. Repairs: decorative receiver ignores pointer input; causal cue and habitat moved clear of the answer panel; functional starter bundle added to express transferred light. Final targeted regression includes caption/panel visibility assertions.

Run:

```sh
node --test tests/v12-logic.mjs tests/v13-logic.mjs
python3 -m http.server 8000 --bind 0.0.0.0
# Another shell:
node tests/v12-browser.cjs
# Final focused scenario:
V13_ONLY=1 node tests/v12-browser.cjs
git diff --check
```

The scripts reuse installed Playwright/Chromium; `GAME_URL`, `PLAYWRIGHT_MODULE`, and `CHROMIUM_PATH` support overrides.

## Independent QA and limits

Real iPad/iPhone Safari testing remains: touch/vine routing, answer visibility, nickname keyboard, sound/music lifecycle, older iPad performance and the prior non-blocking music distortion. Child QA should check whether the light handoff is understood, the preloaded bundle feels helpful, the butterfly payoff is noticed, repeated grouping/routing remains interesting, and optional return rescues remain calm. No device, Safari or child results are claimed.

The deliberate exception to completed-content Pulse selection is the normally open Signal handoff. Existing players derive light from Fireflies completion, then earn the new habitat through fresh retrieval. The system reaches a stable habitat rather than introducing indefinite resource accumulation or decay. Preview verification may remain blocked by this cloud proxy/certificate; no trust-store changes or TLS bypass are allowed.
