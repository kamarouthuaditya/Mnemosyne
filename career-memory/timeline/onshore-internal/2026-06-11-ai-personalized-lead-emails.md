---
type: work_entry
project: onshore-internal
feature: lead-automation
occurred_on: 2026-06-11
title: AI-personalized auto-replies for website leads
source: [manual]
source_ref: manual
skills: [n8n, google-gemini, gmail-api, google-sheets, html-email]
files_changed: 3
context: "Every website lead got the same generic auto-reply — prospects who took time to describe their problem got a templated welcome that ignored what they wrote."
options_considered: "Send one fixed welcome to everyone (simple but impersonal); manually write replies (personal but doesn't scale and is slow); branch the flow and let an AI draft a tailored paragraph only when the lead left a comment (personal AND automatic)."
decision: "Branch on whether the lead left a comment. If they did, Gemini reads it and writes a 2-3 sentence reply naming their problem and how OnShore can help; that paragraph is injected into a dedicated email template. If not, send the standard welcome."
rationale: "Personalization only matters when there's something to personalize on. Branching keeps the no-comment path instant and zero-cost while making the high-intent leads feel personally answered."
foresight: "Guarded the empty-comment case with an explicit IF + a pass-through that blanks the AI field, so the personalized template is never sent with a missing insight. Every lead — commented or not — is logged to the sheet so none are lost."
outcome: "Hands-off: leads are captured, logged, and answered automatically, with the most engaged prospects getting an AI-written, on-brand reply in seconds."
---
## What I built

An automation that answers website leads **by itself**. When someone fills out the OnShore Labs
contact form, they instantly get a branded welcome email — and if they wrote a message describing
what they need, an AI reads it and writes a short, personal reply tailored to their situation. No one
on the team has to touch it.

## Why it mattered

Before this, every lead got the **same generic email**, even the ones who carefully explained their
problem. That's a missed first impression with exactly the prospects most worth impressing. Now the
people who engage the most get a reply that actually speaks to *their* problem — automatically, in
seconds, around the clock.

## How it works

The workflow runs in **n8n** (a visual automation tool — think of it as wiring apps together with no
code). It branches on one simple question: *did the lead leave a comment?*

- **Yes** → a **Google Gemini** AI agent reads the comment and writes a warm 2-3 sentence paragraph
  acknowledging their problem and how OnShore can help. That paragraph is dropped into a dedicated
  HTML email (`email-template-custom-message.html`) and sent via **Gmail**.
- **No** → they get the standard branded welcome (`email-template-main.html`).

Either way, the lead is appended to a **Google Sheet** so nothing slips through.

```mermaid
flowchart LR
  A[Lead form submitted] --> B{Has a comment?}
  B -->|yes| C[Gemini writes<br/>custom paragraph]
  C --> D[Personalized email<br/>via Gmail]
  B -->|no| E[Standard welcome<br/>via Gmail]
  A --> F[(Google Sheet log)]
  D -.-> F
  E -.-> F
```

Both emails share a dark, mobile-responsive design (Space Grotesk + Inter, aqua accents, service
cards, founder QR code) so every reply looks unmistakably OnShore.
