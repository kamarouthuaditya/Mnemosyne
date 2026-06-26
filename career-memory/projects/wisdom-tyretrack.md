---
type: project
slug: wisdom-tyretrack
name: Wisdom TyreTrack
kind: client
client: Wisdom Transportation
repo_path: C:\Users\Aditya Kamarouthu\Work\OnshoreLabs\projects\wisdom-tyretrack\app\wisdom-tyretrack
remote_url: https://github.com/ak-onshore-labs/wisdom-tyretrack.git
status: active
started_at: 2026-03-29
why: |
  A tyre-lifecycle management system OnShore Labs built for **Wisdom Transportation's** fleet
  operation. It tracks every tyre across trucks and trailers — from inventory through installation,
  reuse, and disposal — and surfaces cost and performance analytics for fleet managers and the
  tyre/maintenance staff who log changes on the shop floor. A **client engagement**: a product
  delivered for Wisdom Transportation, not an internal tool we built for ourselves.
features:
  - slug: tyre-change-wizard
    name: Tyre Change Wizard
  - slug: dashboard-analytics
    name: Dashboard & Analytics
  - slug: store-inventory
    name: Tyre Store & Inventory
  - slug: settings-permissions
    name: Settings & Permissions
---
Tyre lifecycle management system for Wisdom Transportation — tracks every tyre across trucks and
trailers from inventory through installation, reuse, and disposal, and surfaces cost/performance
analytics over time.

**Users:** fleet managers and maintenance/tyre staff, plus an admin angle for user-access
management.

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript, Tailwind 4, Supabase (Postgres + Auth +
RLS + RPC). No separate backend — all domain logic lives in server actions and Supabase RPCs
(`record_tyre_change`, `deactivate_user`). Role-based permissions gate every mutation.

**Current state:** active. Core flows (auth, fleet, store, change wizard, activity, settings,
analytics) shipped. On the `ui-improvements` branch, the tyre-change wizard was rebuilt to cut UX
friction.
