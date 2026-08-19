import { requireAuth } from './_lib/auth.ts';
import { db } from './_lib/db.ts';
import { sendJson } from './_lib/http.ts';
import type { Req, Res } from './_lib/http.ts';

export default async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });

  const { rows } = await db().query(`select id, name, qty::float8, unit from inventory_items order by name asc`);
  sendJson(res, 200, rows);
}
