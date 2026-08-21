import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

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

  if (req.method === 'DELETE') {
    const id = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id'));
    if (!id) return sendJson(res, 400, { error: 'id is required' });
    const pool = db();
    const found = await pool.query<{ source_type: string | null; source_id: number | null }>(
      `select source_type, source_id from ledger_entries where id = $1`,
      [id],
    );
    if (found.rows.length === 0) return sendJson(res, 404, { error: 'not found' });
    const { source_type, source_id } = found.rows[0];
    if (source_type && source_id != null) {
      await pool.query(`delete from ledger_entries where source_type = $1 and source_id = $2`, [source_type, source_id]);
    } else {
      await pool.query(`delete from ledger_entries where id = $1`, [id]);
    }
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ debitAccount?: string; creditAccount?: string; amount?: number; memo?: string; date?: string }>(req);
  const debitAccount = String(body.debitAccount || '').trim();
  const creditAccount = String(body.creditAccount || '').trim();
  const amount = Number(body.amount);
  const memo = String(body.memo || '').trim() || null;
  if (!debitAccount || !creditAccount) return sendJson(res, 400, { error: 'debit and credit accounts are required' });
  if (!(amount > 0)) return sendJson(res, 400, { error: 'amount must be a positive number' });

  let entryDate: Date | null = null;
  if (body.date) {
    entryDate = new Date(body.date);
    if (isNaN(entryDate.getTime())) return sendJson(res, 400, { error: 'invalid date' });
  }

  const pool = db();
  const group = await pool.query<{ id: number }>(`select nextval('ledger_manual_seq')::int as id`);
  const groupId = group.rows[0].id;
  await pool.query(
    `insert into ledger_entries (entry_date, account, debit, credit, memo, source_type, source_id) values
      (coalesce($5, now()), $1, $3, 0, $4, 'manual', $6),
      (coalesce($5, now()), $2, 0, $3, $4, 'manual', $6)`,
    [debitAccount, creditAccount, amount, memo, entryDate, groupId],
  );
  sendJson(res, 201, { ok: true });
}

export default withErrors(handler);
