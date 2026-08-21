import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const limit = Math.min(Number(new URL(req.url ?? '/', 'http://x').searchParams.get('limit')) || 20, 100);
    const { rows } = await db().query(
      `select id, item_name, direction, qty::float8, reference, created_at
       from inventory_movements order by created_at desc limit $1`,
      [limit],
    );
    return sendJson(res, 200, rows);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ item?: string; qty?: number; direction?: 'In' | 'Out' }>(req);
  const item = String(body.item || '').trim();
  const qty = Number(body.qty);
  const direction = body.direction === 'Out' ? 'Out' : 'In';
  if (!item || !(qty > 0)) return sendJson(res, 400, { error: 'item and a positive qty are required' });

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const upserted = await client.query(
      `insert into inventory_items (name, qty) values ($1, 0)
       on conflict (name) do update set name = excluded.name
       returning id`,
      [item],
    );
    const itemId = upserted.rows[0].id;
    const delta = direction === 'In' ? qty : -qty;
    await client.query(`update inventory_items set qty = greatest(0, qty + $1) where id = $2`, [delta, itemId]);
    await client.query(
      `insert into inventory_movements (item_id, item_name, direction, qty, reference) values ($1, $2, $3, $4, 'Manual entry')`,
      [itemId, item, direction, qty],
    );
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }

  sendJson(res, 201, { ok: true });
}

export default withErrors(handler);
