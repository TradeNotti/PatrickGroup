# Patrick Group — Operating System

A React + TypeScript (Vite) implementation of the Patrick Group phone app,
built from a Claude Design handoff bundle (an exported `.dc.html` prototype
and its design-system assets).

Phone-sized management app for a Tanzanian sunflower-oil business: a live
dashboard, a Company → Territory → Distributor → Wholesaler → Retailer →
Order drill-down, credit tracking with overdue payments, and 7 module
screens (Sales, Inventory, Distribution, Production, Purchasing, Finance
with a double-entry ledger). Includes an Owner/Manager role switcher, a
dark/light theme toggle, and a "Record a sale" data-entry flow that posts
to the dashboard, credit, and the finance ledger.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Deploy on Vercel

This is a standard Vite + React app — Vercel auto-detects it, no config needed.

1. On [vercel.com](https://vercel.com), **Add New… → Project**.
2. Import this GitHub repo (`TradeNotti/patrickgroup`).
3. Leave the defaults (Framework Preset: Vite, Build Command: `npm run build`,
   Output Directory: `dist`) and click **Deploy**.

## Structure

- `src/data/` — static business data + the seeded drill-down tree generator
- `src/state/` — app state (`useAppState`) and derived view-model (`useDerived`,
  a port of the original prototype's `renderVals()`)
- `src/components/` — screens (Home, Explore, Credit, More) and the 7 module
  screens under `components/modules/`
- `src/styles/` — the Modernist design-system tokens (`modernist.css`) and the
  amber-accent/dark-theme overrides (`theme.css`)
