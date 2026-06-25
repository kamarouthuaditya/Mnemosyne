---
type: work_entry
project: onshore-internal
feature: n8n-content-engine
occurred_on: 2026-04-16
title: Built and activated the daily AI content-generation workflow in n8n
source: [transcript]
source_ref: manual
skills: [n8n, workflow-automation, openrouter, anthropic-claude, supabase, prompt-engineering, infrastructure-as-code]
files_changed: 0
context: "Onshore Labs needed a steady stream of on-brand social posts across Instagram, X, and LinkedIn without a person sitting down to write them every day. We had an n8n automation platform available and an AI model budget — the job was to turn a daily schedule into finished, image-backed draft posts saved somewhere a human could review them."
options_considered: |
  - **Click the workflow together in the n8n UI** — fast to start, but the result lives only in n8n's
    cloud, can't be code-reviewed or versioned, and is easy to break by accident.
  - **Manage the workflow as code with n8nac (chosen)** — the whole 18-node workflow is a TypeScript
    file in the repo, version-controlled and deployable, with an audit + rebuild tracker.
  - **One mega AI prompt for all platforms** — simpler, but each platform has a different voice and
    format; a single prompt produces mushy, lowest-common-denominator copy.
decision: "A code-managed n8n workflow: a daily 06:00 trigger → load content memory → build a weekly pillar/day brief → an AI strategist → separate per-platform writers (IG / X / LinkedIn) → ImageGen render for the IG visual → save drafts to a Supabase content table. Generation only; publishing belongs to the app."
rationale: "Per-platform writers keep each channel's voice right. Splitting generation (n8n) from publishing (the Studio app) keeps each system simple and lets a human gate what actually goes out. Managing it as code makes the automation reviewable and recoverable instead of a black box in someone's browser."
foresight: "Wired the IG image step to call our own ImageGen API instead of Placid, removing the paid dependency from the daily run. Built a day-of-week → platform calendar into the brief so, e.g., LinkedIn intentionally doesn't post on Wednesdays — meaning an empty LinkedIn slot is by design, not a bug (this exact case showed up on the first live run and was correctly read as intended). Flagged two real security risks for follow-up: a shared service-role key/DB password that must be rotated, and a default render API key on a public endpoint that must be replaced."
outcome: "Workflow ACTIVATED — live on a daily 06:00 schedule, 18 nodes, all four AI agents on claude-haiku-4.5 via OpenRouter. First live run wrote real Instagram + X drafts with good captions and a genuine ImageGen render as the IG image, confirming the whole seam end-to-end. The Placid node was fully replaced with an HTTP call to our own render API and verified clean in production."
---
## What I built

An automation that **writes the company's daily social media posts by itself.** Every morning at 6am it
wakes up, thinks about what to post that day, drafts the copy for Instagram, X (Twitter), and LinkedIn —
each in that platform's own voice — generates the Instagram image, and saves everything as drafts for a
human to review.

It runs on **n8n** (a visual automation tool), but I built it **as code** — the entire workflow is a file
in our codebase, so it can be reviewed, versioned, and restored, instead of being a fragile diagram that
only exists in a browser.

## Why it mattered

- **No one has to write posts from scratch every day.** The hard part — coming up with the angle and
  drafting platform-appropriate copy — happens automatically.
- **Each platform sounds right.** Instead of one generic post copy-pasted everywhere, a separate AI
  "writer" handles each channel's style.
- **It's safe by design.** The automation only *drafts* — nothing is published until a person approves it
  in the Studio app.

## How it works

```mermaid
flowchart TD
  A[6:00am daily trigger] --> B[Load past content memory]
  B --> C[Build daily brief:<br/>which pillar, which platforms]
  C --> D[AI Strategist]
  D --> E[IG writer]
  D --> F[X writer]
  D --> G[LinkedIn writer]
  E --> H[ImageGen: render IG image]
  E & F & G & H --> I[(Save drafts to content DB)]
```

A **strategist** AI decides the day's theme, then hands off to **per-platform writers**. The Instagram
post also gets a branded image rendered by our own ImageGen service. Everything lands in a database as
drafts.

## What I was careful about

- **Dropped the paid image service.** The Instagram image step now calls our own ImageGen API, not
  Placid — one less bill and one less outside dependency in the daily run. See [[placeit-imagegen-platform]].
- **A posting calendar, on purpose.** Not every platform posts every day — LinkedIn skips Wednesdays, for
  example. On the very first live run, LinkedIn was (correctly) empty because it was a Wednesday — by
  design, not a failure.
- **Flagged the security debt out loud** — a shared database key and a default API key on a public
  endpoint both need rotating before this is truly production-hardened.

Feeds drafts to [[onshore-studio-approval-and-publishing]] for human review and publishing.
