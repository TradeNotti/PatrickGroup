// Single catch-all Vercel Function for every /api/<route> request. The Hobby
// plan caps a deployment at 12 serverless functions, and one file per
// resource under api/ blew past that — so all resource logic lives in
// api/_routes/*.ts (ignored by Vercel's function discovery because of the
// leading underscore) and this file is the only real entrypoint, dispatched
// by path. Local dev (scripts/dev-server.mts) imports the same _routes files
// directly, so route logic never diverges between dev and prod.
import { sendJson } from './_lib/http.js';
import type { Req, Res } from './_lib/http.js';

import auth from './_routes/auth.js';
import customers from './_routes/customers.js';
import dashboard from './_routes/dashboard.js';
import deliveries from './_routes/deliveries.js';
import distributors from './_routes/distributors.js';
import financeSummary from './_routes/finance-summary.js';
import inventoryItems from './_routes/inventory-items.js';
import inventoryMovements from './_routes/inventory-movements.js';
import ledger from './_routes/ledger.js';
import payments from './_routes/payments.js';
import productionBatches from './_routes/production-batches.js';
import purchases from './_routes/purchases.js';
import sales from './_routes/sales.js';

type Handler = (req: Req, res: Res) => Promise<void>;

const routes: Record<string, Handler> = {
  auth,
  customers,
  dashboard,
  deliveries,
  distributors,
  'finance-summary': financeSummary,
  'inventory-items': inventoryItems,
  'inventory-movements': inventoryMovements,
  ledger,
  payments,
  'production-batches': productionBatches,
  purchases,
  sales,
};

export default async function handler(req: Req, res: Res) {
  const url = new URL(req.url ?? '/', 'http://x');
  const name = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
  const route = routes[name];
  if (!route) return sendJson(res, 404, { error: 'not found' });
  await route(req, res);
}
