---
type: achievement
project: bombino
feature: mail-automation
title: Eliminated an external automation service from the form-email pipeline
impact: "Cut a hosted n8n dependency out of production, removing vendor lock-in and a class of untyped-template bugs, while keeping all five website form flows (contact, quote, pickup, customs, KYC) sending acknowledgement + team-alert emails — verified live before shipping."
occurred_on: 2026-06-11
tags: [automation, refactor, email-deliverability, cost-reduction, reliability]
---
The website's contact, quote, pickup, customs, and KYC forms each depended on a separately hosted
**n8n** workflow to send their emails. I judged the workflow did nothing the app couldn't do itself —
receive a submission, branch on form type, send two emails — and the required libraries were already
in the repo.

I replaced it with a small in-app email module: two isolated SMTP transports (Office365 for customer
acknowledgements, Gmail for internal alerts) so one mailbox's deliverability issues can't sink the
other, type-checked templates ported from n8n's fragile `{{ }}` expressions, and log-and-continue
error handling so email failures never break a form submission. KYC's ID-document attachment was
preserved and tested with a real upload.

Notable for the **engineering judgment**: scoped the change precisely (deleted only the dead Bombino
workflow, left two live OnShore Labs workflows and shared tooling intact), de-risked the one shaky
dependency (Office365 basic auth) by testing it live, and shipped a net **−service, +type-safety**
result to `main` (c419ee1).
