// Shared Postgres pool, reused across warm serverless invocations.
// Files/folders under api/_lib are ignored by Vercel's file-based routing
// (the leading underscore) but are importable by the route handlers.
import { Pool } from 'pg';

let pool: Pool | undefined;

export function db(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');
    const useSSL = !/localhost|127\.0\.0\.1/.test(connectionString);
    pool = new Pool({
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
      max: 3,
    });
  }
  return pool;
}
