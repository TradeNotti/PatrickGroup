import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const limit = Math.min(Number(new URL(req.url ?? '/', 'http://x').searchParams.get('limit')) || 20, 100);
    const { rows } = await db().query(
      `select id, batch_code, seed_kg::float8, oil_l::float8, created_at
       from production_batches order by created_at desc limit $1`,
      [limit],
    );
    return sendJson(res, 200, rows);
  }

  if (req.method === 'DELETE') {
    const id = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id'));
    if (!id) return sendJson(res, 400, { error: 'id is required' });
    const deleted = await db().query(`delete from production_batches where id = $1`, [id]);
    if (deleted.rowCount === 0) return sendJson(res, 404, { error: 'not found' });
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ id?: string; seed?: number; oil?: number }>(req);
  const batchCode = String(body.id || '').trim();
  const seedKg = Number(body.seed);
  const oilL = Number(body.oil);
  if (!batchCode || !(seedKg > 0) || !(oilL > 0)) {
    return sendJson(res, 400, { error: 'batch, seed and oil are required' });
  }

  const { rows } = await db().query(
    `insert into production_batches (batch_code, seed_kg, oil_l) values ($1, $2, $3)
     returning id, batch_code, seed_kg::float8, oil_l::float8, created_at`,
    [batchCode, seedKg, oilL],
  );
  sendJson(res, 201, rows[0]);
}

export default withErrors(handler);
