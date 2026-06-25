---
type: achievement
project: tasks-logger
feature: mailing-system
title: Automated the client report-and-notify loop end to end
impact: "After logging fixes, the skill now auto-formats the report tab, exports it as PDF, and emails a summary to the client — replacing a manual WhatsApp + hand-styled sheet. Est. ~10–20 min saved per reporting day."
occurred_on: 2026-06-25
tags: [automation, email, gmail-api, google-sheets, oauth]
---
Extended `/tasks-logger` with a notification + formatting layer: a Gmail-API send (reusing the
existing OAuth login, no new service or key), per-tab PDF export via the authenticated Sheets export
URL, and a one-shot `format-tab` (column widths, wrapped text, yellow+bold metadata labels and
header, merged B:C metadata cells, full borders, frozen header). Verified live — a summary email
with the dated tab attached as PDF reached aditya@onshorelabs.co.in. Handled the messy edges: wrong
Chrome-profile OAuth consent, scope-widening re-consent, a misleading 403 handler, and a stray
full-row header highlight clamped to A:C for clean printouts.
