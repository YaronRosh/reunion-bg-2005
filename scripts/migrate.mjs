// מריץ את הסכמה מול Supabase אם יש חיבור, ומוסיף מארגנים לפי ADMIN_EMAILS (מופרדים בפסיק).
import pg from 'pg';
import { readFileSync } from 'node:fs';
const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
if (!url) { console.log('migrate: no database url, skipping (demo mode)'); process.exit(0); }
const c = new pg.Client({ connectionString: url.replace(/[?&]sslmode=[^&]*/, ''), ssl: { rejectUnauthorized: false } });
try {
  await c.connect();
  await c.query(readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  for (const e of admins) await c.query('insert into admin_emails(email) values ($1) on conflict do nothing', [e]);
  console.log('migrate: ok, admins:', admins.length);
} catch (e) { console.error('migrate: failed', e.message); process.exit(1); } finally { await c.end().catch(() => {}); }
