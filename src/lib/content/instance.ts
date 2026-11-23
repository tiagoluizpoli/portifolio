import { logger } from '../log';
import { migrateDatabase, openDatabase } from './db';
import { createGithubFetcher } from './stats';
import { createContentStore } from './store';

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const { db } = openDatabase(DATABASE_URL);
await migrateDatabase(db);

/** The process-wide content store, booted (migrations + valid content) before the server listens. */
export const contentStore = await createContentStore({
  db,
  fetchStats: process.env.GITHUB_TOKEN ? createGithubFetcher(process.env.GITHUB_TOKEN) : undefined,
});

logger.info('content store booted', { stats: Boolean(process.env.GITHUB_TOKEN) });
