import { requireAuth } from './_lib/auth.ts';
import { db } from './_lib/db.ts';
import { sendJson } from './_lib/http.ts';
import type { Req, Res } from './_lib/http.ts';

export default async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });

  const pool = db();
  const [entries, totals] = await Promise.all([
    pool.query(
      `select id, entry_date, account, debit::float8, credit::float8, memo
       from ledger_entries order by entry_date desc, id desc limit 50`,
    ),
    pool.query(`select coalesce(sum(debit),0)::float8 as debit, coalesce(sum(credit),0)::float8 as credit from ledger_entries`),
  ]);

  sendJson(res, 200, {
    entries: entries.rows,
    totalDebit: totals.rows[0].debit,
    totalCredit: totals.rows[0].credit,
  });
}
