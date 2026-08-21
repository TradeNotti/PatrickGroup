import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const { rows } = await db().query(`
      select d.id, d.name, d.territory, d.phone, d.created_at,
        count(dl.id)::int as delivery_count
      from distributors d
      left join deliveries dl on dl.distributor_id = d.id
      group by d.id
      order by d.name asc
    `);
    return sendJson(res, 200, rows);
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ name?: string; territory?: string; phone?: string }>(req);
  const name = String(body.name || '').trim();
  const territory = String(body.territory || '').trim() || null;
  const phone = String(body.phone || '').trim() || null;
  if (!name) return sendJson(res, 400, { error: 'name is required' });

  const { rows } = await db().query(
    `insert into distributors (name, territory, phone) values ($1, $2, $3)
     on conflict (name) do update set territory = coalesce(excluded.territory, distributors.territory), phone = coalesce(excluded.phone, distributors.phone)
     returning id, name, territory, phone, created_at`,
    [name, territory, phone],
  );
  sendJson(res, 201, { ...rows[0], delivery_count: 0 });
}

export default withErrors(handler);
