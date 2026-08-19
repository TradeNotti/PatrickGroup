import { requireAuth } from './_lib/auth.ts';
import { db } from './_lib/db.ts';
import { readJsonBody, sendJson, withErrors } from './_lib/http.ts';
import type { Req, Res } from './_lib/http.ts';

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
