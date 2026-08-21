import { randomBytes } from 'node:crypto';
import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/db.js';
import { readJsonBody, sendJson, withErrors } from '../_lib/http.js';
import type { Req, Res } from '../_lib/http.js';

// Matches the format the companion Distributor Rankings site
// (github.com/TradeNotti/Distributors.PatrickGroup) itself generates: 24
// random bytes, base64url so it drops straight into a /d/{token} URL.
// Generating it here means a distributor's ranking link exists the moment
// they're added, instead of waiting on that other site's next deploy to
// backfill it.
function generateAccessToken(): string {
  return randomBytes(24).toString('base64url');
}

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    const { rows } = await db().query(`
      select d.id, d.name, d.territory, d.phone, d.created_at, d.access_token,
        count(dl.id)::int as delivery_count
      from distributors d
      left join deliveries dl on dl.distributor_id = d.id
      group by d.id
      order by d.name asc
    `);
    return sendJson(res, 200, rows);
  }

  if (req.method === 'DELETE') {
    const id = Number(new URL(req.url ?? '/', 'http://x').searchParams.get('id'));
    if (!id) return sendJson(res, 400, { error: 'id is required' });
    const pool = db();
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(`update deliveries set distributor_id = null where distributor_id = $1`, [id]);
      await client.query(`update sales_orders set distributor_id = null where distributor_id = $1`, [id]);
      const deleted = await client.query(`delete from distributors where id = $1`, [id]);
      await client.query('commit');
      if (deleted.rowCount === 0) return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });

  const body = await readJsonBody<{ name?: string; territory?: string; phone?: string }>(req);
  const name = String(body.name || '').trim();
  const territory = String(body.territory || '').trim() || null;
  const phone = String(body.phone || '').trim() || null;
  if (!name) return sendJson(res, 400, { error: 'name is required' });

  let rows;
  for (;;) {
    try {
      ({ rows } = await db().query(
        `insert into distributors (name, territory, phone, access_token) values ($1, $2, $3, $4)
         on conflict (name) do update set territory = coalesce(excluded.territory, distributors.territory), phone = coalesce(excluded.phone, distributors.phone)
         returning id, name, territory, phone, created_at, access_token`,
        [name, territory, phone, generateAccessToken()],
      ));
      break;
    } catch (err) {
      // Astronomically unlikely access_token collision (192 bits of
      // entropy) — retry with a freshly generated token instead of failing
      // the request. Any other error propagates normally.
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') continue;
      throw err;
    }
  }
  sendJson(res, 201, { ...rows[0], delivery_count: 0 });
}

export default withErrors(handler);
