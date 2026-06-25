---
type: achievement
project: tasks-logger
title: Shipped a Google Sheets task-logging skill with format-safe writes
impact: "Replaced manual daily sheet editing with /tasks-logger; appends land correctly regardless of header position, eliminating row-misplacement errors. Est. ~20–40 min saved per reporting day."
occurred_on: 2026-06-25
tags: [automation, tooling, google-sheets, oauth, reliability]
---
Built and shipped `/tasks-logger`, a Claude Code skill that logs client testing bug-fixes into
Google Sheets reports in the exact existing format. Pivoted auth from service-account (blocked by
org policy) to OAuth user login with no per-sheet sharing. Diagnosed and fixed a write-placement
bug caused by a blank row between the metadata block and the header: switched from fixed-row
assumptions and Google's table-guessing append to dynamic header detection ("Task ID" scan) plus
explicit-range writes. Verified live with a header-at-row-7 round-trip test.
