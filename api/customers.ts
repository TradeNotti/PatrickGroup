import { requireAuth } from './_lib/auth';
import { db } from './_lib/db';
import { sendJson, withErrors } from './_lib/http';
import { customerBalances } from './_lib/queries';
import type { Req, Res } from './_lib/http';

async function handler(req: Req, res: Res) {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });

  const rows = await customerBalances(db());
  sendJson(res, 200, rows);
}

export default withErrors(handler);
