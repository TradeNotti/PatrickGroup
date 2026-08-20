import { requireAuth } from './_lib/auth.js';
import { db } from './_lib/db.js';
import { sendJson, withErrors } from './_lib/http.js';
import type { Req, Res } from './_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });

  const { rows } = await db().query(`select id, name, qty::float8, unit from inventory_items order by name asc`);
  sendJson(res, 200, rows);
}

export default withErrors(handler);
