# Implementation Plan

## Milestone 0 — Project Bootstrap
- structure;
- base styles;
- state/store;
- routing/screens;
- no gameplay yet.

PASS khi:
- mở được Home và Map;
- responsive;
- không console error.

## Milestone 1 — Core Math Interaction
- question generator;
- answer UI;
- correct/wrong feedback;
- hint;
- persistence.

PASS khi:
- chơi được 20+ câu;
- không lặp sai logic;
- reload vẫn còn learning state.

## Milestone 2 — Mission Engine
- mission catalog;
- start/complete;
- 3 mechanic types;
- connect math → in-world action.

PASS khi:
- một mission hoàn chỉnh từ intro đến reward.

## Milestone 3 — Adventure Map
- 3 zone;
- lock/unlock;
- current mission;
- progress.

PASS khi:
- hoàn thành zone 1 mở được zone tiếp theo.

## Milestone 4 — Adaptive Learning
- mastery;
- weak fact selection;
- review scheduling heuristic.

PASS khi:
- cố tình trả lời sai một số fact;
- chúng quay lại sau vài lượt với tần suất cao hơn.

## Milestone 5 — Visual Polish
- illustrations/placeholders tốt;
- motion;
- sounds;
- responsive tuning.

Không hy sinh usability để đổi lấy effect.

## Milestone 6 — Safari / Mobile QA
Test:
- iPhone portrait;
- iPhone landscape;
- iPad portrait;
- iPad landscape;
- desktop Chrome/Safari nếu có.

## Milestone 7 — Final QC
Theo `QA_ACCEPTANCE.md`.

Không thêm feature lớn sau Final QC trừ khi có bug/blocker.
