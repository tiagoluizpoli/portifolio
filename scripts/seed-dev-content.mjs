// Seeds the Development content table from the approved draft (docs/content/v2-draft.md, #25).
// Run once by hand after the app has booted once (migrations create the table):
//   DATABASE_URL=postgres://... node scripts/seed-dev-content.mjs
// Re-running overwrites every Section row. Absent until the owner supplies them: whatsappUrl, email, cv, Church images.
import { readFile } from 'node:fs/promises';
import postgres from 'postgres';

const seed = JSON.parse(await readFile(new URL('./seed-dev-content.json', import.meta.url), 'utf8'));
const sql = postgres(process.env.DATABASE_URL ?? '');
for (const [key, data] of Object.entries(seed)) {
  await sql`INSERT INTO content (key, data) VALUES (${key}, ${sql.json(data)})
    ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
  console.log(`seeded ${key}`);
}
await sql.end();
