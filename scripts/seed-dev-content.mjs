// Seeds the Development content table from the approved draft (docs/content/v2-draft.md, #25).
// Applies migrations first, so it works on an empty database. Run from the repo root:
//   DATABASE_URL=postgres://... node scripts/seed-dev-content.mjs
// Re-running overwrites every Section row. Absent until the owner supplies them: whatsappUrl, email, cv, Church images.
import { readFile } from 'node:fs/promises';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const seed = JSON.parse(await readFile(new URL('./seed-dev-content.json', import.meta.url), 'utf8'));
const url = process.env.DATABASE_URL ?? '';
// Own connection: drizzle swaps the client's JSON serializers, which breaks sql.json below.
const migrationClient = postgres(url, { onnotice: () => {} });
await migrate(drizzle({ client: migrationClient }), { migrationsFolder: 'drizzle' });
await migrationClient.end();
const sql = postgres(url);
for (const [key, data] of Object.entries(seed)) {
  await sql`INSERT INTO content (key, data) VALUES (${key}, ${sql.json(data)})
    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
  console.log(`seeded ${key}`);
}
await sql.end();
