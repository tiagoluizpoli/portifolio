import { sql } from 'drizzle-orm';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export type Database = PostgresJsDatabase;

// Resolved against the process cwd: the repo root in dev/tests, /app in the image.
const MIGRATIONS_FOLDER = 'drizzle';

export function openDatabase(url: string) {
  const client = postgres(url);
  return { db: drizzle(client), close: () => client.end() };
}

export async function migrateDatabase(db: Database) {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}

export async function isReachable(db: Database) {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
