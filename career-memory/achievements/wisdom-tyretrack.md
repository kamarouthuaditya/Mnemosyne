---
type: achievement
project: wisdom-tyretrack
feature: tyre-change-wizard
title: Halved tyre-change logging from 6 steps to 3
impact: "Cut the core shop-floor workflow from 6 screens to 3 (50% fewer navigation taps per change) with zero loss of data integrity — same validation, half the friction."
occurred_on: 2026-04-01
tags: [ux, workflow-optimization, state-machines, mobile]
---
The tyre-change wizard was the app's main UX friction: one change forced staff through six
full-screen steps. Reframed the flow by **decision** rather than by field — collapsing it to three
steps (Context → two-phase Position Board → Review) driven by a single useReducer state machine.
Notable because the redesign halved navigation while keeping every per-position guarantee (size
derivation, brand-on-reuse, KM monotonicity) intact.
