---
type: project
slug: bombino
name: Bombino
repo_path: C:\Users\Aditya Kamarouthu\Work\OnshoreLabs\projects\bombino
status: active
started_at: 2026-04-25
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
