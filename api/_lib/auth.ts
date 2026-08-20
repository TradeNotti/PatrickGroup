import { createHmac, timingSafeEqual } from 'node:crypto';
import { clearCookie, parseCookies, sendJson, setCookie } from './http.js';
import type { Req, Res } from './http.js';

const COOKIE_NAME = 'pg_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function makeToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && Date.now() < exp;
}

export function login(res: Res, password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected || password !== expected) return false;
  setCookie(res, COOKIE_NAME, makeToken(), SESSION_MAX_AGE_SECONDS);
  return true;
}

export function logout(res: Res) {
  clearCookie(res, COOKIE_NAME);
}

export function isAuthed(req: Req): boolean {
  const cookies = parseCookies(req);
  return verifyToken(cookies[COOKIE_NAME]);
}

/** Returns false (and has already responded 401) when unauthenticated. */
export function requireAuth(req: Req, res: Res): boolean {
  if (isAuthed(req)) return true;
  sendJson(res, 401, { error: 'unauthorized' });
  return false;
}
