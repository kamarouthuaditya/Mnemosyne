---
type: project
slug: bombino
name: Bombino
kind: client
client: Bombino Express
repo_path: C:\Users\Aditya Kamarouthu\Work\OnshoreLabs\projects\bombino
status: active
started_at: 2026-04-25
why: |
  Bombino Express is a logistics / courier company that hired OnShore Labs to build and run its
  digital presence end to end — the customer-facing shipping app, an internal admin panel, the public
  marketing website, and the automations behind its lead and form handling. This is a **client
  engagement**: OnShore owns delivery across all four surfaces. The "why" here isn't an internal
  problem we set out to solve for ourselves — it's the scope a client trusted us to own.
features:
  - slug: consumer-app
    name: Bombino Express App (bombino-express)
  - slug: admin-panel
    name: Admin Panel (admin-website-bombino)
  - slug: mail-automation
    name: Mail Automation
  - slug: marketing-website
    name: Bombino Express Website (website-bombino)
---

Bombino Express — logistics/courier company. OnshoreLabs builds their consumer
shipping app (bombino-express, mobile-first React/Vite + Express), an admin
panel (Next.js, blog CMS + user management), and the marketing website
(website-bombino — Next.js App Router; repo
`https://github.com/ak-onshore-labs/website-bombino.git`) plus its backend
automations (n8n workflows for leads/forms/content, hosted on n8n cloud, synced
locally via n8nac under website/workflows/onshorelabs). The marketing site owns
public forms — contact, quote, pickup, customs, KYC — each sending transactional
email and logging to Google Sheets.
