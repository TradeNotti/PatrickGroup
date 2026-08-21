// Applies scripts/schema.sql to DATABASE_URL. Every statement in that file
// is idempotent (CREATE TABLE/INDEX IF NOT EXISTS), so re-running this on
// every deploy is safe — see the "vercel-build" script in package.json.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL && existsSync('.env.local')) {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    // Fail the build on Production — deploying without applying migrations
    // would be silently wrong. Preview/Development builds (e.g. a branch
    // whose Vercel project doesn't have DATABASE_URL scoped to Preview) are
    // allowed to proceed without a database; the app just won't work until
    // one is configured for that environment, but at least the build succeeds.
    if (process.env.VERCEL_ENV === 'production') {
      console.error('DATABASE_URL is not set — required for a production build. Aborting.');
      process.exit(1);
    }
    console.warn('DATABASE_URL is not set — skipping migration (non-production build).');
    return;
  }

  const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query(sql);
    console.log('Migration applied successfully.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
