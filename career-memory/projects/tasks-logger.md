---
type: project
slug: tasks-logger
name: Tasks Logger
kind: internal
repo_path: C:\Users\Aditya Kamarouthu\Personal\projects\tasks-logger
remote_url: ""
status: active
started_at: 2026-06-25
why: |
  Internal tooling for our own client-testing workflow. Every testing day produced a status report
  that someone updated in a shared Google Sheet by hand — slow, error-prone, and easy to misformat
  (a row pasted in the wrong place, a broken header). This exists to collapse that reporting into one
  reliable command: log the day's fixes, format the tab, and notify the client with the exact layout
  every time. **Internal tool**, built to kill a recurring manual chore — not a client deliverable.
features:
  - slug: sheets-sync
    name: Sheets Sync Skill
  - slug: mailing-system
    name: Mailing & Notification System
---
A Claude Code skill (`/tasks-logger`) that logs client testing tasks/bug-fixes into Google
Sheets status reports. During client testing, bugs come in, get fixed, a "done" WhatsApp goes
out, and a shared Google Sheet tracks the work — previously edited by hand. The skill automates
that: pick an existing project (logs into a new dated tab) or spin up a new project sheet, always
reproducing the exact metadata-block + header format. OAuth user auth (service-account keys are
blocked by org policy), local JSON project registry, Python helper scripts. Built for Onshore Labs.
