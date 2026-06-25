---
type: work_entry
project: tasks-logger
occurred_on: 2026-06-25
title: Built the tasks-logger Google Sheets skill (OAuth + robust header detection)
source: [transcript]
source_ref: manual
skills: [python, google-sheets-api, google-drive-api, oauth, claude-code-skills]
files_changed: 7
context: "Client testing produces bug lists we fix and report in a shared Google Sheet, edited by hand each day. Goal: a /tasks-logger skill to log fixes into the sheet in the exact existing format — pick an existing project (new dated tab) or create a new project sheet."
options_considered: "Auth: (1) service-account JSON key — robust/headless but org policy blocks SA key creation; (2) OAuth desktop client — sign in as the user, no key, works on any sheet the user owns; (3) Apps Script web app. Chose OAuth after the org policy blocked SA keys. Sub-sheet: new tab per day vs append-with-marker vs new file — chose new tab in same spreadsheet. Project tracking: local JSON registry vs master index sheet — chose local registry."
decision: "Python helper scripts (sheets.py + registry.py) behind a /tasks-logger SKILL.md. OAuth user auth with cached token. Header row detected by scanning column A for 'Task ID' — never a fixed row. Appends compute an explicit target range below the last data row instead of using Sheets' table-guessing append."
rationale: "SA keys were a hard block, so OAuth was the only headless-after-first-login path that needed no per-sheet sharing. The sheet has a blank row between the metadata block and the header, which broke fixed-row assumptions and Google's append table-detection — dynamic detection + explicit-range writes make it immune to where the header sits (row 5, 6, 7, anywhere)."
foresight: "Anticipated the blank-row trap that mis-anchored writes onto the header/metadata; proved robustness with a live round-trip test that pushed the header to row 7 and confirmed appends stacked correctly below it, then trashed the test sheet. Added a 403 handler that tells the user exactly how to fix access, and a `locate` command to preview the write target before committing."
outcome: "Skill live and verified end-to-end: OAuth working, reads/parses the Bombino sheet correctly, appends land below existing data regardless of header position, header auto-formatted (bold + yellow fill + freeze). Registry seeded with the Bombino Express project."
business_impact: "Removes the manual sheet-editing step each testing cycle. Est. ~20–40 min saved per reporting day (assumption: ~15–25 bug rows hand-entered + formatted), and eliminates format/placement errors like the row-misplacement bug seen during build. Internal tooling — no direct revenue."
---
## What I built

A **Claude Code skill** — type `/tasks-logger` — that logs the bugs/tasks we fix during client
testing straight into the client's Google Sheet status report, in the exact format they already use.
Before this, someone opened the sheet and typed every fix in by hand each day.

It does two things:
- **Existing project** → pick it from a saved list, then log the day's fixes into a **new dated tab**.
- **New project** → create a fresh sheet with the right headers and project details, ready to log into.

## Why it mattered

Hand-editing the report every testing day is slow and error-prone — easy to paste a row in the wrong
place or break the layout. The skill keeps the format perfect and writes the rows in the right spot
automatically, so reporting back to the client is a quick, reliable step instead of manual data entry.

## How it works

```mermaid
flowchart LR
  A[/tasks-logger] --> B{Existing or new?}
  B -->|Existing| C[Pick from registry]
  C --> D[Detect header row]
  D --> E[Append fixes below last row]
  B -->|New| F[Create sheet + headers]
  F --> G[Save to registry]
```

## The tricky part — header detection

The client's sheet has a **blank row between the project details and the column headers**, so the
header sits on row 6, not row 5. Early on, that blank row fooled Google's "smart append" into writing
a row on top of the header. Fix: the skill now **finds the header by looking for the "Task ID" cell**
wherever it is, then writes new rows at an explicitly calculated position below the existing data.
I proved it by deliberately pushing the header down to row 7 in a test sheet — the rows still landed
in exactly the right place.

## Auth detour

The plan was a Google service-account key, but the organisation policy blocks creating those keys.
Pivoted to **OAuth** — you sign in once in the browser, the token is cached, and every write happens
as your own account, so no sheet ever needs to be shared with a robot.
