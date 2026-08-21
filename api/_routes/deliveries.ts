import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { parseOptionalDate, readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const url = new URL(req.url ?? '/', 'http://x');
    const distributorId = Number(url.searchParams.get('distributorId')) || null;
    const { rows } = await db().query(
      `select id, distributor_id, route, driver, status, created_at from deliveries
       where ($1::int is null or distributor_id = $1)
       order by created_at desc limit 50`,
      [distributorId],
    );
    return sendJson(res, 200, rows);
  }

  if (req.method === 'DELETE') {
    const id = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id'));
    if (!id) return sendJson(res, 400, { error: 'id is required' });
    const deleted = await db().query(`delete from deliveries where id = $1`, [id]);
    if (deleted.rowCount === 0) return sendJson(res, 404, { error: 'not found' });
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ distributorId?: number; route?: string; driver?: string; status?: string; date?: string }>(req);
  const distributorId = Number(body.distributorId) || null;
  const route = String(body.route || '').trim();
  const driver = String(body.driver || '').trim();
  const status = String(body.status || 'In transit');
  if (!route || !driver) return sendJson(res, 400, { error: 'route and driver are required' });

  const deliveryDate = parseOptionalDate(body.date);
  if (deliveryDate === 'invalid') return sendJson(res, 400, { error: 'invalid date' });

  const { rows } = await db().query(
    `insert into deliveries (distributor_id, route, driver, status, created_at)
     values ($1, $2, $3, $4, coalesce($5, now()))
     returning id, distributor_id, route, driver, status, created_at`,
    [distributorId, route, driver, status, deliveryDate],
  );
  sendJson(res, 201, rows[0]);
}

export default withErrors(handler);
