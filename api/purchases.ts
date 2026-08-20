import { requireAuth } from './_lib/auth';
import { db } from './_lib/db';
import { readJsonBody, sendJson, withErrors } from './_lib/http';
import type { Req, Res } from './_lib/http';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const { rows } = await db().query(
      `select id, supplier, item, qty::float8, price::float8, status, created_at
       from purchases order by created_at desc limit 50`,
    );
    return sendJson(res, 200, rows);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ supplier?: string; item?: string; qty?: number; price?: number }>(req);
  const supplier = String(body.supplier || '').trim();
  const item = String(body.item || '').trim();
  const qty = Number(body.qty) || 0;
  const price = Number(body.price) || 0;
  if (!supplier || !item) return sendJson(res, 400, { error: 'supplier and item are required' });

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    const inserted = await client.query(
      `insert into purchases (supplier, item, qty, price, status) values ($1, $2, $3, $4, 'Ordered')
       returning id, supplier, item, qty::float8, price::float8, status, created_at`,
      [supplier, item, qty, price],
    );
    if (price > 0) {
      await client.query(
        `insert into ledger_entries (account, debit, credit, memo) values
          ('Inventory – purchases', $1, 0, $2),
          ('Accounts payable', 0, $1, $2)`,
        [price, `Purchase from ${supplier}`],
      );
    }
    await client.query('commit');
    sendJson(res, 201, inserted.rows[0]);
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }
}

export default withErrors(handler);
