# Patrick Group — Management System

A real, database-backed management app for a Tanzanian sunflower-oil
business, built from a Claude Design handoff bundle (an exported `.dc.html`
prototype and its design-system assets) and then rewired onto a real
Postgres database with authentication.

Phone-sized app: a live dashboard, credit tracking with overdue payments,
and 7 module screens (Sales, Inventory, Distribution, Production,
Purchasing, Finance with an auto-posted double-entry ledger). Every number
in the app comes from data you actually record — there is no invented or
demo data. A "Record a sale" flow posts straight to the dashboard, the
customer's credit balance, and the finance ledger.

Sign-in is a single shared password (`APP_PASSWORD`) — there are no
per-user accounts yet.

## Setup

1. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (any
   Postgres — e.g. [Neon](https://neon.tech)), `APP_PASSWORD`, and
   `SESSION_SECRET`.
2. `npm install`
3. `npm run migrate` — creates the tables (safe to re-run any time; every
   statement is `IF NOT EXISTS`).
4. `npm run dev` — runs the Vite dev server and the local API server
   together (proxied under `/api`).

## Build

```sh
npm run build
```

## Deploy on Vercel

This is a Vite app with a handful of Vercel serverless functions under
`api/` — Vercel auto-detects both, no config needed.

1. On [vercel.com](https://vercel.com), **Add New… → Project**.
2. Import this GitHub repo (`TradeNotti/patrickgroup`).
3. In **Environment Variables**, set `DATABASE_URL`, `APP_PASSWORD`, and
   `SESSION_SECRET` (same three as `.env.local` — generate a fresh
   `SESSION_SECRET` for production).
4. Deploy. The `vercel-build` script applies the database migration
   automatically before every build, so schema changes ship with the code.

## Structure

- `scripts/schema.sql` / `scripts/migrate.mjs` — the database schema and
  the idempotent migration runner (also wired into `vercel-build`)
- `api/` — Vercel serverless functions: auth (signed cookie session over a
  single shared password) and one route per resource (sales, customers,
  payments, inventory, deliveries, production batches, purchases, the
  ledger, dashboard/finance aggregates). `api/_lib/` holds the shared DB
  pool, auth, and HTTP helpers.
- `scripts/dev-server.mts` — mounts the same `api/*.ts` handlers on a plain
  Node server for local dev (Vite proxies `/api` to it), so route logic
  never diverges between local dev and Vercel.
- `src/state/queries.ts` — React Query hooks, one per API resource
- `src/components/` — screens (Home, Credit, More) and the 7 module screens
  under `components/modules/`
- `src/styles/` — the Modernist design-system tokens (`modernist.css`) and
  the amber-accent/dark-theme overrides (`theme.css`)
