// Local dev-only stand-in for Vercel's file-based /api routing. Each
// api/<name>.ts file exports a default (req, res) handler with the same
// signature Vercel's Node runtime calls — this server just dispatches to
// the same file, so route logic never diverges between local dev and prod.
import { config } from 'dotenv';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

config({ path: '.env.local' });

const apiDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'api');
const port = Number(process.env.API_PORT) || 8787;

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/')) {
      res.statusCode = 404;
      return res.end('not found');
    }
    const name = url.pathname.slice('/api/'.length).replace(/\/+$/, '');
    const file = path.join(apiDir, `${name}.ts`);
    if (name.startsWith('_') || !existsSync(file)) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'not found' }));
    }
    const mod = await import(file);
    await mod.default(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'internal error' }));
    }
  }
});

server.listen(port, () => console.log(`[api] listening on http://localhost:${port}`));
