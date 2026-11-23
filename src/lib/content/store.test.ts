import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { type Database, migrateDatabase, openDatabase } from './db';
import { CONTENT_TTL_MS, createContentStore } from './store';
import { content } from './table';

const validHero = {
  name: 'Tiago Luiz Seuaciuc de Poli',
  title: { en: 'Senior Software Engineer', pt: 'Engenheiro de Software Sênior' },
  pitch: { en: 'I build backends.', pt: 'Construo backends.' },
  location: { en: 'São Paulo, Brazil · Remote', pt: 'São Paulo, Brasil · Remoto' },
};

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
});

async function putHero(data: unknown) {
  await db.insert(content).values({ key: 'hero', data }).onConflictDoUpdate({ target: content.key, set: { data } });
}

test('valid content loads and is typed', async () => {
  await putHero(validHero);
  const store = await createContentStore({ db });
  const { hero } = store.read();
  expect(hero.title.pt).toBe('Engenheiro de Software Sênior');
  expect(hero.name).toBe('Tiago Luiz Seuaciuc de Poli');
});

test('a missing Section row fails boot', async () => {
  await expect(createContentStore({ db })).rejects.toMatchObject({ path: 'hero' });
});

test('a translatable field missing one locale fails with the exact path', async () => {
  await putHero({ ...validHero, title: { en: 'Senior Software Engineer' } });
  await expect(createContentStore({ db })).rejects.toMatchObject({ path: 'hero.title.pt' });
});

test('an optional field present in one locale only fails', async () => {
  await putHero({ ...validHero, cv: { en: 'cv-en.pdf' } });
  await expect(createContentStore({ db })).rejects.toMatchObject({ path: 'hero.cv.pt' });
});

test('unknown keys are ignored and logged', async () => {
  await putHero({ ...validHero, tagline: 'x', title: { ...validHero.title, de: 'y' } });
  const log = { warn: vi.fn(), error: vi.fn() };
  const store = await createContentStore({ db, log });
  expect(store.read().hero).not.toHaveProperty('tagline');
  expect(store.read().hero.title).toEqual(validHero.title);
  const warnings = log.warn.mock.calls.flat().join('\n');
  expect(warnings).toContain('hero.tagline');
  expect(warnings).toContain('hero.title.de');
});

test('content is served stale while a refresh runs and replaced after it', async () => {
  await putHero(validHero);
  let now = 0;
  const store = await createContentStore({ db, clock: () => now });
  await putHero({ ...validHero, name: 'Updated' });

  now = CONTENT_TTL_MS - 1;
  expect(store.read().hero.name).toBe(validHero.name);

  now = CONTENT_TTL_MS;
  expect(store.read().hero.name).toBe(validHero.name);
  await vi.waitFor(() => expect(store.read().hero.name).toBe('Updated'));
});

test('when Postgres is down after boot, the last good copy is still served', async () => {
  await putHero(validHero);
  const own = openDatabase(container.getConnectionUri());
  let now = 0;
  const log = { warn: vi.fn(), error: vi.fn() };
  const store = await createContentStore({ db: own.db, clock: () => now, log });
  expect(await store.isHealthy()).toBe(true);
  await own.close();

  now = CONTENT_TTL_MS;
  expect(store.read().hero.name).toBe(validHero.name);
  await vi.waitFor(() => expect(log.error).toHaveBeenCalled());
  expect(store.read().hero.name).toBe(validHero.name);
  expect(await store.isHealthy()).toBe(false);
});

test('revalidate picks up changed content', async () => {
  await putHero(validHero);
  const store = await createContentStore({ db });
  await putHero({ ...validHero, name: 'Changed' });
  await store.revalidate();
  expect(store.read().hero.name).toBe('Changed');
});

test('revalidate rejects invalid content with the Zod path and keeps the last good copy', async () => {
  await putHero(validHero);
  const log = { warn: vi.fn(), error: vi.fn() };
  const store = await createContentStore({ db, log });
  await putHero({ ...validHero, title: { en: 'only en' } });
  await expect(store.revalidate()).rejects.toMatchObject({ path: 'hero.title.pt' });
  expect(store.read().hero.title.pt).toBe('Engenheiro de Software Sênior');
  expect(log.error).toHaveBeenCalled();
});

test('a stats failure does not fail a content revalidate', async () => {
  await putHero(validHero);
  const log = { warn: vi.fn(), error: vi.fn() };
  const store = await createContentStore({ db, log, fetchStats: () => Promise.reject(new Error('boom')) });
  await expect(store.revalidate()).resolves.toBeUndefined();
});
