import { requireAuth } from './_lib/auth.js';
import { db } from './_lib/db.js';
import { readJsonBody, sendJson, withErrors } from './_lib/http.js';
import type { Req, Res } from './_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ customerId?: number; amount?: number }>(req);
  const customerId = Number(body.customerId);
  const amount = Number(body.amount);
  if (!customerId || !(amount > 0)) return sendJson(res, 400, { error: 'customerId and a positive amount are required' });

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`insert into payments (customer_id, amount) values ($1, $2)`, [customerId, amount]);
    await client.query(
      `insert into ledger_entries (account, debit, credit, memo) values
        ('Cash', $1, 0, 'Payment received'),
        ('Accounts receivable', 0, $1, 'Payment received')`,
      [amount],
    );
    await client.query('commit');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    client.release();
  }

  sendJson(res, 200, { ok: true });
}

export default withErrors(handler);
