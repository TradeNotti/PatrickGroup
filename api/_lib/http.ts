/// <reference types="node" />
import type { IncomingMessage, ServerResponse } from 'node:http';

export type Req = IncomingMessage & { method?: string; url?: string; body?: unknown };
export type Res = ServerResponse;

export function sendJson(res: Res, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export async function readJsonBody<T = Record<string, unknown>>(req: Req): Promise<T> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return req.body ? (JSON.parse(req.body) as T) : ({} as T);
    return req.body as T;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

/** Parses an optional user-supplied date string (from a "backdate this
 *  entry" form field). Returns null when absent (caller should fall back to
 *  now()), or the string 'invalid' when present but unparseable, so the
 *  caller can 400 instead of silently storing an "Invalid Date". */
export function parseOptionalDate(value: unknown): Date | null | 'invalid' {
  if (value === undefined || value === null || value === '') return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? 'invalid' : d;
}

export function parseCookies(req: Req): Record<string, string> {
  const header = req.headers.cookie;
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

// No `Secure` flag: the app is used both over plain http (local dev) and
// https (Vercel) and this is a single shared-password internal tool, not a
// multi-tenant public service — HttpOnly + SameSite=Lax is the meaningful
// protection here (blocks JS exfiltration and cross-site sends).
export function setCookie(res: Res, name: string, value: string, maxAgeSeconds: number) {
  const attrs = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearCookie(res: Res, name: string) {
  res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

/** Wraps a handler so any thrown/rejected error becomes a JSON {error}
 *  response instead of Vercel's generic HTML error page — keeps failures
 *  (bad env vars, a DB that's unreachable, etc.) visible and debuggable
 *  from the client instead of surfacing as an opaque blank screen. */
export function withErrors(fn: (req: Req, res: Res) => Promise<void>) {
  return async (req: Req, res: Res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) sendJson(res, 500, { error: err instanceof Error ? err.message : 'internal error' });
    }
  };
}
