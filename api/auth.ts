import { isAuthed, login, logout } from './_lib/auth';
import { readJsonBody, sendJson, withErrors } from './_lib/http';
import type { Req, Res } from './_lib/http';

async function handler(req: Req, res: Res) {
  if (req.method === 'GET') {
    return sendJson(res, 200, { authed: isAuthed(req) });
  }

  if (req.method === 'POST') {
    const body = await readJsonBody<{ action?: string; password?: string }>(req);
    if (body.action === 'logout') {
      logout(res);
      return sendJson(res, 200, { ok: true });
    }
    const ok = login(res, String(body.password ?? ''));
    if (!ok) return sendJson(res, 401, { error: 'Incorrect password' });
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 405, { error: 'method not allowed' });
}

export default withErrors(handler);
