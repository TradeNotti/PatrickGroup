import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { parseOptionalDate, readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ customerId?: number; amount?: number; date?: string }>(req);
  const customerId = Number(body.customerId);
  const amount = Number(body.amount);
  if (!customerId || !(amount > 0)) return sendJson(res, 400, { error: 'customerId and a positive amount are required' });

  const paymentDate = parseOptionalDate(body.date);
  if (paymentDate === 'invalid') return sendJson(res, 400, { error: 'invalid date' });

  const pool = db();
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `insert into payments (customer_id, amount, created_at) values ($1, $2, coalesce($3, now()))`,
      [customerId, amount, paymentDate],
    );
    await client.query(
      `insert into ledger_entries (entry_date, account, debit, credit, memo, source_type, source_id) values
        (coalesce($2, now()), 'Cash', $1, 0, 'Payment received', 'payment', $3),
        (coalesce($2, now()), 'Accounts receivable', 0, $1, 'Payment received', 'payment', $3)`,
      [amount, paymentDate, customerId],
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
