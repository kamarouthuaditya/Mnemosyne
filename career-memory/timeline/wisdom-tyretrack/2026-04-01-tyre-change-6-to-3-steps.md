---
type: work_entry
project: wisdom-tyretrack
feature: tyre-change-wizard
occurred_on: 2026-04-01
title: Cut tyre-change logging from 6 steps to 3
source: [manual]
source_ref: manual
significance: notable
skills: [next.js, react, typescript, ux, state-machines]
files_changed: 6
context: "Logging one tyre change forced staff through 6 separate full-screen steps — vehicle, position, KM/date, disposition, fit-tyre, review. Tyre staff log changes on the shop floor, often on mobile; the long linear walk was the main UX friction in the app."
options_considered: |
  - **Trim copy / speed up each step** — leaves all 6 screens; cosmetic, doesn't remove the real cost (screen-to-screen navigation).
  - **One giant single-page form** — fewest clicks but overwhelming on mobile and easy to mis-fill across many positions at once.
  - **Collapse into 3 task-shaped steps** (chosen) — group fields by the decision the user is actually making, keep a guided shape, halve the navigation.
decision: "Rebuilt the wizard as 3 steps: (1) Context — pick vehicle + capture KM + date in one inline-expanding card; (2) Position Board — a two-phase board that picks positions, then collects disposition + fitted-tyre inline on the same screen; (3) Review + submit."
rationale: "The 6 steps were 3 real decisions wearing 6 screens. Vehicle/KM/date are one 'set the scene' action. Position + disposition + fit are one 'decide per tyre' action — splitting them forced re-orienting to the same positions three times. Merging by decision, not by field, removes navigation without crowding the screen."
foresight: "Kept per-position validation intact (size derivation, brand-required-on-reuse, KM ≥ last recorded) so collapsing screens didn't loosen the data guarantees. Used a phase A/B reducer inside step 2 so the position context is built once and reused, avoiding the re-orientation cost. Mobile-first hit targets (min-h-48px inputs)."
outcome: "Tyre change now logs in 3 steps instead of 6 — half the screen-to-screen navigation, same data integrity. New components: ChangeStep1Context, ChangeStep2PositionBoard (two-phase), ChangeStep3Review, driven by a single useReducer state machine in change-page-client."
business_impact: "Steps to log one tyre change cut 6 → 3 (50% fewer screens/navigation taps per change). Faster per-change logging on the shop floor — est. roughly halved time-on-task per change (assumption: navigation/re-orientation between screens was the dominant cost, not field entry); exact minutes TBD from field use."
---
## What I built
Recording a single tyre change used to walk staff through **six** separate screens. I rebuilt it so
the same job takes **three**. Same information captured, same safety checks — half the back-and-forth.

A "tyre change" here just means: a worn tyre comes off a truck or trailer at a specific wheel
position, and a new (or reused) one goes on. Staff log this on the shop floor, often on a phone.

## Why it mattered
The six-screen walk was the biggest source of friction in the app. The screens weren't six real
decisions — they were three decisions split across six pages, which made staff re-orient to the same
truck and the same wheel positions over and over. Cutting it to three matches the screens to how
people actually think about the task.

## Before → after
```mermaid
flowchart TB
  subgraph OLD[Before — 6 steps]
    direction LR
    A1[Vehicle] --> A2[Position] --> A3[KM + Date] --> A4[Disposition] --> A5[Fit tyre] --> A6[Review]
  end
  subgraph NEW[After — 3 steps]
    direction LR
    B1[Context<br/>vehicle + KM + date] --> B2[Position Board<br/>pick → decide inline] --> B3[Review]
  end
  OLD --> NEW
```

## How it works
- **Step 1 — Context:** the vehicle list expands inline; selecting a truck/trailer reveals KM and
  date right there, so "what + when" is one action instead of two screens.
- **Step 2 — Position Board:** a single screen with two phases — **Phase A** picks the wheel
  positions, **Phase B** collects the removed-tyre disposition (reuse pile vs trash) and the
  fitted-tyre source for each picked position, without leaving the board. The position context is
  built once and reused, so staff don't re-orient three times.
- **Step 3 — Review:** confirm the whole change and submit via the existing `record_tyre_change`
  Supabase RPC.

All of it runs off one `useReducer` state machine (`step` 1–3, `phase` A/B) in
`change-page-client.tsx`, keeping the existing per-position validation — tyre-size derivation,
brand-required-on-reuse, and KM-not-below-last-recorded — fully intact.
