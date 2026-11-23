import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import seed from '../../../scripts/seed-dev-content.json';
import { type Database, migrateDatabase, openDatabase } from './db';
import { type SectionKey, sectionSchemas } from './schemas';
import { CONTENT_TTL_MS, createContentStore } from './store';
import { content } from './table';

const validHero = seed.hero;
const sectionKeys = Object.keys(sectionSchemas) as SectionKey[];

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

async function put(key: SectionKey, data: unknown) {
  await db.insert(content).values({ key, data }).onConflictDoUpdate({ target: content.key, set: { data } });
}

/** Writes every Section from the seed, with `key` replaced by `data`. */
async function putAll(key: SectionKey = 'hero', data: unknown = seed[key]) {
  for (const k of sectionKeys) await put(k, k === key ? data : seed[k]);
}

const putHero = (data: unknown) => putAll('hero', data);

test('valid content loads and is typed', async () => {
  await putHero(validHero);
  const store = await createContentStore({ db });
  const { hero } = store.read();
  expect(hero.title.pt).toBe('Engenheiro de Software Sênior');
  expect(hero.name).toBe('Tiago Luiz Seuaciuc de Poli');
});

test('the approved-draft seed satisfies every schema and renders typed', async () => {
  await putAll();
  const store = await createContentStore({ db });
  const c = store.read();
  expect(c.showcase.projects[0]).toMatchObject({ name: 'Church', status: 'coming-soon' });
  expect(c.experience.roles).toHaveLength(5);
  expect(c.skills.groups[0].name.pt).toBe('Linguagens');
  expect(c.about.languages).toHaveLength(2);
  expect(c.contact.githubUrl).toContain('github.com');
});

test.each(sectionKeys)('a missing %s row fails boot', async (missing) => {
  for (const k of sectionKeys) if (k !== missing) await put(k, seed[k]);
  await expect(createContentStore({ db })).rejects.toMatchObject({ path: missing });
});

test('every Section schema rejects an invalid edit with the exact path', async () => {
  const bad: [SectionKey, unknown, string][] = [
    ['showcase', { projects: [{ ...seed.showcase.projects[0], status: 'live' }] }, 'showcase.projects.0.status'],
    [
      'showcase',
      { projects: [{ ...seed.showcase.projects[0], summary: { en: 'only en' } }] },
      'showcase.projects.0.summary.pt',
    ],
    [
      'showcase',
      {
        projects: [
          { ...seed.showcase.projects[0], images: Array(4).fill({ path: 'a.png', alt: { en: 'a', pt: 'a' } }) },
        ],
      },
      'showcase.projects.0.images',
    ],
    [
      'experience',
      { roles: [{ ...seed.experience.roles[0], highlights: Array(3).fill({ en: 'a', pt: 'a' }) }] },
      'experience.roles.0.highlights',
    ],
    ['experience', { roles: [{ ...seed.experience.roles[0], start: 'March 2026' }] }, 'experience.roles.0.start'],
    [
      'skills',
      { groups: [{ name: { en: 'x', pt: 'x' }, items: [{ name: 'X', icon: 'logos:not-a-real-icon' }] }] },
      'skills.groups.0.items.0.icon',
    ],
    [
      'about',
      { ...seed.about, languages: [{ name: { en: 'English' }, level: { en: 'a', pt: 'a' } }] },
      'about.languages.0.name.pt',
    ],
    ['contact', { ...seed.contact, cv: { pt: 'cv-pt.pdf' } }, 'contact.cv.en'],
    ['contact', { ...seed.contact, githubUrl: 'not a url' }, 'contact.githubUrl'],
  ];
  for (const [key, data, path] of bad) {
    await putAll(key, data);
    await expect(createContentStore({ db }), path).rejects.toMatchObject({ path });
  }
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
  const warnings = JSON.stringify(log.warn.mock.calls);
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
