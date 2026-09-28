# PROJECT STATUS

## Current phase
V1.0 REPAIR PASS (branch `repair/v1.0-gameplay-learning`) — candidate for MVP V1.0.
Local QC complete; waiting for owner review + real iPhone/iPad Safari playtest before merging to `main`.
`main` / GitHub Pages still serve V0.9 (unchanged).

## Locked
- Concept: Adventure Map + Rescue Missions
- Audience: Grade 3 / age 8–9
- Module: Multiplication tables 2–9
- Platform: Web / iPhone / iPad / desktop
- MVP: Static, local-first

## V1.0 repair pass — what changed
| Area | Change |
|---|---|
| Gameplay integration | **Repair** (bridge): each section needs a × b planks shown as b bundles of a planks; a correct answer drops exactly those bundles into the gap, counting up a, 2a, 3a…, and the built section carries the total. **Light** (lamps / lanterns / lighthouse, incl. keypad c4): each lamp needs b clusters of a bulbs; clusters light one by one with skip-count labels, then the lamp turns on. Same picture as hint 1. |
| Remediation | `learning.wrongFactQueue`: a wrong fact comes back after ≥ 2 other facts, max 1× per fact per mission, never two remediations in a row, carries over to the next mission, removed only once answered (exit-safe). A failed remediation is not re-queued (no loop) — low mastery keeps it in the review bucket. Correct remediation → `recovered` count + "🔁 Phép này quay lại nè!" / "Nhớ rồi!" cue. |
| Reward clarity | Success card: "3/4 câu đúng ngay lần đầu — 2 ⭐" + "Chơi lại để thử lấy 3 ⭐" (hidden once best = 3). Replay still keeps best score, no duplicate stars/stickers/badges. |
| Keypad | "Xong" disabled while empty. Tutorial cue = glowing answer box (no longer a hand on the "0" key); choices cue sweeps across all options. Input on `pointerdown` + state guards: second contact on a held key ignored, synthesized click ignored, same-digit press < 70 ms = bounce. 44 / 66 / 88 typed normally (tested at 90 ms re-tap). |
| Transitions | New screen is built on top of the old one and fades in (~180 ms); old one is hidden only afterwards → no blank frame (0 blank frames measured at 6× CPU throttle). |
| Player identity | 6 SVG avatars (robot Bíp, 2 kids, fox, panda, dino — no gender labels) + nickname (optional, "Bạn nhỏ" if skipped). The chosen avatar is the hero in every scene, map, home, hint bubble. Nickname in Home, map greeting, mission intro, success card, Rescue Book (always via `textContent`). Change from Rescue Book → "✏️ Đổi" (progress untouched). |
| Save | Schema v2 (same storage key). v1 saves migrate: profile fields added, old `queue` → `wrongFactQueue`; existing players get the identity step once on "Chơi tiếp", progress kept. |
| Rescue Book | Table mastery shown as 🌱 Mới gặp → 💪 Đang nhớ → ✨ Gần thuộc → ⭐ Đã thuộc (🔒 = not met yet). No percentages. |
| Home | Subtitle "Giải cứu thế giới bằng phép nhân!" replaces "Math Rescue Adventure"; "Chào {tên}!" chip. |
| Map a11y | Nodes: `tabindex=0`, focus ring, Enter/Space; locked nodes `aria-disabled`. Fixed: the Enter that opens a mission no longer also skips its intro. |

## Final QC (docs/08_QA_ACCEPTANCE.md + repair checklist) — local, Chrome emulation
| Group | Result | Notes |
|---|---|---|
| A. Functional | PASS | Fresh 15-mission playthrough: 0 console errors, 37 ⭐ = sum of best, 15 unique stickers, 3 badges, all zones; replay/double-tap Continue → no duplicates. Reset (with confirm) clears progress + profile. Corrupt / wrongly-typed save → fresh start or onboarding, no crash. |
| B. Learning | PASS | Headless sim: spacing ≥ 2, once per mission, no back-to-back, carry-over, exit-safe, no infinite loop. In play: 9 deliberate mistakes → 8–10 remediations, queue empty at the end. Mastery numeric in engine only. |
| C. Child UX | PASS* | Math is visible in the scene for Repair + Light (groups × items), reward reason in one line, no punishment. *Needs a real child playtest. |
| D. Visual | PASS | Avatars share the existing outline/palette; correct/wrong keep icons (✓ / ↺). |
| E. Mobile/Safari | PARTIAL | 390×844, 768×1024, 844×390: no horizontal overflow, keypad/onboarding/reward/Rescue Book fit. Real Safari (keyboard over nickname input, safe-area, touch timing) not verifiable here. |
| F. Performance | PASS | No new assets or dependencies; groups are ≤ 10 small SVG groups; animations transform/opacity only. |
| G. Product gate | PASS (Repair, Light) / unchanged (Unlock, Path, Rescue) | Scope was exactly 2 mechanics. Unlock/Path/Rescue still act on the answer but do not draw a × b yet. |

## Decisions (spec gaps)
- **a × b in scenes = b groups of a** ("a được lấy b lần", Vietnamese textbook) — same as the existing hint picture, so scene and hint never disagree. The repair brief phrased it "số nhóm × số vật mỗi nhóm"; flipping is one line per mechanic (`spreadGroups(q.b…)` / `q.a` per group) if the owner prefers.
- Remediation re-asks the same fact (not the twin) → "recovered" is unambiguous.
- Reset Progress also resets the profile (new child on the device); changing the profile never touches progress.
- Nickname: NFC, control chars removed, spaces collapsed, max 12 characters (enforced while typing, skipped during IME composition).
- Hints: a × b = "a được lấy b lần" (a + a + … b times). Facts = tables 2–9 × 1–10.
- Stars: share of first-try correct answers (≥85% → 3, ≥50% → 2, else 1); best kept, total derived.

## Check on device (not verifiable here)
- iOS keyboard over the nickname input (iPhone SE size), Vietnamese Telex input.
- Keypad tap feel on a real finger (bounce guard is 70 ms, same digit only).
- Screen fade on older iPad; silent switch mutes WebAudio; Safari toolbars / home indicator.

## Roadmap candidates (not in this pass)
Groups-in-scene for Unlock / Path / Rescue, PWA/offline, parent summary (see docs/09_FUTURE_ROADMAP.md).
