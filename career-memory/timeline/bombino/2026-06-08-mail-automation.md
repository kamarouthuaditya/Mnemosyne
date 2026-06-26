---
type: work_entry
project: bombino
feature: mail-automation
occurred_on: 2026-06-08
title: Built automated email pipeline for Bombino website form submissions
source: [manual]
source_ref: manual
significance: standard
skills: [n8n, gmail-api, smtp, automation, email-templates]
files_changed: 1
context: |
  The tech team was **manually replying to every website inquiry**. Customer queries from five
  different forms — **KYC, Contact, Shipment, Pickup, Customs** — landed in a database and were
  exported as CSV batches for the team to work through. The result:

  - Customers heard **nothing back** until someone got to the next export.
  - The team was always working off **stale data**.
options_considered: |
  Two real paths:

  - **Hardcode email-sending into the website backend.** Fast, but a narrow one-template,
    one-provider dead end — every change means a code change and redeploy.
  - **Use n8n (a visual automation tool).** ✅ *Chosen.* Lets me branch per form type, swap email
    providers (SMTP for customers, Gmail for the team), and change the flow visually without
    touching or redeploying the website.
decision: |
  Built the **"Bombino Website Forms"** automation (16 steps): one entry point catches all 5 form
  types, decides which form it is, and for each one sends **two emails** —

  - a **branded thank-you email to the customer**, and
  - an **alert to the team** carrying the full submission and any uploaded files (e.g. KYC ID proof).
foresight: |
  Branching **per form type** keeps every email specific — the right subject line and wording for a
  KYC request vs a pickup request, not one generic reply. Uploaded documents (like KYC ID proofs) are
  **attached straight onto the team's alert**, so they can act immediately without digging through the
  database or a CSV export.
outcome: |
  - **Customers** now get an **instant acknowledgement** the moment they submit — instead of silence.
  - **The team** gets a **real-time alert per submission** with all details and attachments,
    replacing the slow manual CSV triage entirely.
---

## What I built
When someone fills in a form on the Bombino website, **the reply now happens automatically**. The
customer instantly gets a branded "we got your request" email, and the team instantly gets an alert
with everything they need — no one has to watch a spreadsheet anymore.

## Why it mattered
Before this, every website inquiry was handled by hand off a CSV export. Customers waited in silence
and the team worked off outdated lists. This made the whole loop **instant and hands-free**.

## How it works
A single entry point receives all five form types, figures out which form it is, and sends a tailored
customer email plus an internal alert for each.

```mermaid
flowchart TD
  F[Website form submitted] --> W[One webhook receives all 5 types]
  W --> R{Which form?}
  R -->|KYC| K[KYC branch]
  R -->|Contact| C[Contact branch]
  R -->|Shipment / Pickup / Customs| O[Other branches]
  K --> M
  C --> M
  O --> M[Each branch sends 2 emails]
  M --> CUST[Customer: branded thank-you via SMTP]
  M --> TEAM[Team: alert via Gmail + attachments]
```

## The technical detail
Built as an **n8n workflow** ("Bombino Website Forms", id `7e09Bf86cV0lxh77`, synced via n8nac to
`website/workflows/onshorelabs/Bombino Website Forms.workflow.ts`). One webhook
(`/bombino-website-form`) ingests all types, a config node sets per-type subject lines, then an
If-chain routes by `body.type` (kyc / contact / pickup / customs / shipment fallthrough). Each branch
fires:

- **Customer acknowledgement** — branded HTML via SMTP (`donotreply@bombinoexp.com`)
- **Internal alert** — Gmail to `info@bombinoexp.com`, with full form data and any binary
  attachments (e.g. KYC ID proof) attached directly

Iterated heavily on **June 1** (many push/pull cycles against the n8n cloud instance, including some
400 errors and UI-vs-local sync conflicts while building the branches), refined further **June 6**,
and the final synced version went live **June 8**.
