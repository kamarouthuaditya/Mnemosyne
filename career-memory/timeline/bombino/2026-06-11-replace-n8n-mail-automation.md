---
type: work_entry
project: bombino
feature: mail-automation
occurred_on: 2026-06-11
title: Replaced n8n form-email automation with in-app SMTP sending
source: [commit, transcript]
source_ref: c419ee1
skills: [next.js, typescript, nodemailer, smtp, email-deliverability]
files_changed: 6
context: "Every website form (contact, quote, pickup, customs, KYC) routed through a hosted n8n workflow over a webhook to send the customer acknowledgement + internal team alert. That meant a whole external service to host and keep alive, plus all email logic and HTML templates living in n8n's stringly-typed {{ }} expressions — no type-safety, no version control alongside the app, and a vendor we were locked into for a job the app could do itself."
options_considered: |
  - **Keep n8n** — non-technical staff could edit copy in a UI, but kept the hosting cost, the vendor lock-in, and a class of silent `{{ }}` template bugs.
  - **Move sending into the Next.js API routes (chosen)** — the app already had `nodemailer` patterns and `googleapis` wired in; the workflow did nothing exotic (receive webhook → branch on form type → send two emails), so it was a near-drop-in collapse into code.
  - Hybrid (keep n8n only for KYC's file attachment) — rejected as it would retain the whole service for one edge case `nodemailer` handles natively.
decision: "Retire the n8n workflow entirely. Build a small in-app email module (templates + a dispatcher) and call it directly from the form API routes."
rationale: "All dependencies were already in the repo, the workload was trivial, and folding it in killed an external service, removed vendor lock-in, and converted untyped template expressions into type-checked TypeScript that ships and versions with the app."
foresight: "Kept the two email identities on separate SMTP transports (Office365 for customer acks, Gmail for internal alerts) so a deliverability problem on one can't take down the other. Made email failures log-and-continue (Promise.allSettled) so a mail hiccup never breaks the form response, and kept Google Sheets logging on its own independent best-effort path. Flagged the one real risk — Office365 basic-auth on the donotreply mailbox — and tested it live before calling it done. Left the shared OnShore Labs n8n workflows and tooling untouched, deleting only the dead Bombino workflow file."
outcome: "n8n fully out of the website form pipeline. All five form types send customer ack + team alert from in-app code, KYC attaches the uploaded ID proof. Verified live end-to-end (contact + KYC-with-attachment) before shipping. Merged to main as c419ee1 (+589/-25)."
---
## What I built

The Bombino website has several forms — contact us, get a shipping quote, book a pickup, request
customs clearance, and submit KYC (identity documents). Until now, every time someone submitted one,
the website handed the data off to **n8n** — a separate "automation" tool running on its own server —
which then sent two emails: a friendly acknowledgement to the customer, and an alert to the Bombino
team's inbox.

I **removed that outside tool entirely** and rebuilt the email-sending directly inside the website's
own code.

## Why it mattered

- **One less thing to run and pay for.** n8n was a whole extra service to host and keep alive, just
  to send emails the website could send itself.
- **No more vendor lock-in.** The email logic now lives with the rest of the app.
- **Safer, clearer code.** Inside n8n, the email templates were written in a fragile "fill-in-the-blank"
  syntax with no safety checks — easy to break silently. Now they're normal, type-checked code that
  gets reviewed and versioned alongside everything else.

## How it works

```mermaid
flowchart LR
  A[Visitor submits form] --> B[Website API route]
  B --> C[Customer ack email]
  B --> D[Internal team alert]
  B --> E[Google Sheets log]
  C -.Office365.-> F[(donotreply mailbox)]
  D -.Gmail.-> G[(team inbox)]
```

A small email module holds **two separate mail accounts on purpose**: customer acknowledgements go out
from the company's `donotreply` address (Microsoft 365), while internal alerts come from a Gmail
account. Keeping them apart means a delivery problem with one can't knock out the other.

When a form comes in, the API route picks the right template, sends both emails, and logs to Google
Sheets — and if any one of those stumbles, the others still go through and the visitor still gets a
clean success response.

## What I was careful about

- **KYC file attachments** — the identity-document upload is attached straight to the team alert email,
  which n8n used to handle. Confirmed it works with a real file upload before shipping.
- **Didn't touch the neighbors** — that automation folder also holds two *other*, still-live workflows
  for OnShore Labs. I deleted only the dead Bombino one and left all the shared tooling alone.
- **Tested live, not just compiled** — fired real contact and KYC submissions against a running server
  and watched the emails actually send before merging.
