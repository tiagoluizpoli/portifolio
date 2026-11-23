import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { eq, ne } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { type Database, migrateDatabase, openDatabase } from './db';
import { createGithubFetcher, readStatsSnapshot, writeStats } from './stats';
import { STATS_TTL_MS, createContentStore } from './store';
import { content } from './table';

const hero = {
  name: 'Tiago',
  title: { en: 'Engineer', pt: 'Engenheiro' },
  pitch: { en: 'a', pt: 'a' },
  location: { en: 'b', pt: 'b' },
};
const stats = (contributions: number) => ({
  contributions,
  publicRepos: 40,
  languages: ['TypeScript', 'Go'],
  fetchedAt: '2026-01-01T00:00:00.000Z',
});

let container: StartedPostgreSqlContainer;
let db: Database;
let close: () => Promise<void>;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17-alpine').start();
  ({ db, close } = openDatabase(container.getConnectionUri()));
  await migrateDatabase(db);
}, 120_000);

afterAll(async () => {
  await close();
  await container.stop();
});

beforeEach(async () => {
  await db.delete(content);
  await db.insert(content).values({ key: 'hero', data: hero });
});

const quiet = () => ({ warn: vi.fn(), error: vi.fn() });

test('a stats write leaves every Section row untouched', async () => {
  const before = await db.select().from(content).where(ne(content.key, 'github_stats'));
  await writeStats(db, stats(5));
  await writeStats(db, stats(6));
  const after = await db.select().from(content).where(ne(content.key, 'github_stats'));
  expect(after).toEqual(before);
  expect(await readStatsSnapshot(db)).toMatchObject({ contributions: 6 });
});

test('writeStats rejects invalid stats without writing', async () => {
  await expect(writeStats(db, { ...stats(1), languages: [] })).rejects.toThrow();
  expect(await db.select().from(content).where(eq(content.key, 'github_stats'))).toEqual([]);
});

test('boot fetches, stores and serves stats', async () => {
  const store = await createContentStore({ db, log: quiet(), fetchStats: async () => stats(10) });
  expect(store.stats()).toMatchObject({ contributions: 10 });
  expect(await readStatsSnapshot(db)).toMatchObject({ contributions: 10 });
});

test('GitHub down at boot: the last snapshot is served', async () => {
  await writeStats(db, stats(7));
  const log = quiet();
  const store = await createContentStore({ db, log, fetchStats: async () => Promise.reject(new Error('down')) });
  expect(store.stats()).toMatchObject({ contributions: 7 });
  expect(log.error).toHaveBeenCalled();
});

test('no snapshot and GitHub down: stats are absent', async () => {
  const store = await createContentStore({
    db,
    log: quiet(),
    fetchStats: async () => Promise.reject(new Error('down')),
  });
  expect(store.stats()).toBeUndefined();
});

test('an invalid snapshot is treated as absent and refetched', async () => {
  await db.insert(content).values({ key: 'github_stats', data: { contributions: -1 } });
  const offline = await createContentStore({ db, log: quiet() });
  expect(offline.stats()).toBeUndefined();
  const store = await createContentStore({ db, log: quiet(), fetchStats: async () => stats(11) });
  expect(store.stats()).toMatchObject({ contributions: 11 });
});

test('an invalid fetch result is not stored and keeps the last snapshot', async () => {
  await writeStats(db, stats(7));
  const store = await createContentStore({ db, log: quiet(), fetchStats: async () => ({ nope: true }) });
  expect(store.stats()).toMatchObject({ contributions: 7 });
  expect(await readStatsSnapshot(db)).toMatchObject({ contributions: 7 });
});

test('stale stats are served while one coalesced refresh runs after the TTL', async () => {
  let now = 0;
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const fetchStats = vi.fn(async () => {
    calls += 1;
    if (calls > 1) await gate;
    return stats(calls);
  });
  const store = await createContentStore({ db, clock: () => now, log: quiet(), fetchStats });
  expect(fetchStats).toHaveBeenCalledTimes(1);

  now = STATS_TTL_MS - 1;
  store.stats();
  expect(fetchStats).toHaveBeenCalledTimes(1);

  now = STATS_TTL_MS;
  for (let i = 0; i < 5; i++) expect(store.stats()).toMatchObject({ contributions: 1 });
  expect(fetchStats).toHaveBeenCalledTimes(2);
  release();
  await vi.waitFor(() => expect(store.stats()).toMatchObject({ contributions: 2 }));
});

test('the GitHub fetcher maps the GraphQL response', async () => {
  const body = {
    data: {
      user: {
        contributionsCollection: { contributionCalendar: { totalContributions: 321 } },
        repositories: {
          totalCount: 3,
          nodes: [
            { primaryLanguage: { name: 'Go' } },
            { primaryLanguage: { name: 'TypeScript' } },
            { primaryLanguage: { name: 'TypeScript' } },
            { primaryLanguage: null },
          ],
        },
      },
    },
  };
  const fetchFn = vi.fn(async () => Response.json(body)) as unknown as typeof fetch;
  const result = await createGithubFetcher('t', () => 0, fetchFn)();
  expect(result).toEqual({
    contributions: 321,
    publicRepos: 3,
    languages: ['TypeScript', 'Go'],
    fetchedAt: '1970-01-01T00:00:00.000Z',
  });
});
