import { requireAuth } from './_lib/auth.ts';
import { db } from './_lib/db.ts';
import { readJsonBody, sendJson } from './_lib/http.ts';
import type { Req, Res } from './_lib/http.ts';

export default async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const { rows } = await db().query(
      `select id, route, driver, status, created_at from deliveries order by created_at desc limit 50`,
    );
    return sendJson(res, 200, rows);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ route?: string; driver?: string; status?: string }>(req);
  const route = String(body.route || '').trim();
  const driver = String(body.driver || '').trim();
  const status = String(body.status || 'In transit');
  if (!route || !driver) return sendJson(res, 400, { error: 'route and driver are required' });

  const { rows } = await db().query(
    `insert into deliveries (route, driver, status) values ($1, $2, $3) returning id, route, driver, status, created_at`,
    [route, driver, status],
  );
  sendJson(res, 201, rows[0]);
}
