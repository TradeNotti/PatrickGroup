import { requireAuth } from './_lib/auth.js';
import { db } from './_lib/db.js';
import { readJsonBody, sendJson, withErrors } from './_lib/http.js';
import type { Req, Res } from './_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const pool = db();
    const [entries, totals] = await Promise.all([
      pool.query(
        `select id, entry_date, account, debit::float8, credit::float8, memo
         from ledger_entries order by entry_date desc, id desc limit 50`,
      ),
      pool.query(`select coalesce(sum(debit),0)::float8 as debit, coalesce(sum(credit),0)::float8 as credit from ledger_entries`),
    ]);

    return sendJson(res, 200, {
      entries: entries.rows,
      totalDebit: totals.rows[0].debit,
      totalCredit: totals.rows[0].credit,
    });
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ debitAccount?: string; creditAccount?: string; amount?: number; memo?: string }>(req);
  const debitAccount = String(body.debitAccount || '').trim();
  const creditAccount = String(body.creditAccount || '').trim();
  const amount = Number(body.amount);
  const memo = String(body.memo || '').trim() || null;
  if (!debitAccount || !creditAccount) return sendJson(res, 400, { error: 'debit and credit accounts are required' });
  if (!(amount > 0)) return sendJson(res, 400, { error: 'amount must be a positive number' });

  await db().query(
    `insert into ledger_entries (account, debit, credit, memo) values
      ($1, $3, 0, $4),
      ($2, 0, $3, $4)`,
    [debitAccount, creditAccount, amount, memo],
  );
  sendJson(res, 201, { ok: true });
}

export default withErrors(handler);
