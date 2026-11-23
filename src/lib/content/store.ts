import { inArray } from 'drizzle-orm';
import { type Logger as BaseLogger, logger } from '../log';
import { type Database, isReachable } from './db';
import { type Content, type SectionKey, sectionSchemas } from './schemas';
import { type GithubStats, readStatsSnapshot, writeStats } from './stats';
import { content } from './table';

export const CONTENT_TTL_MS = 3 * 60 * 60 * 1000;

export const STATS_TTL_MS = 60 * 60 * 1000;
const STATS_RETRY_MS = 60 * 1000;

export type Clock = () => number;
export type Logger = Pick<BaseLogger, 'warn' | 'error'> & Partial<Pick<BaseLogger, 'info'>>;

export interface ContentStoreDeps {
  db: Database;
  clock?: Clock;
  log?: Logger;
  /** Fetches fresh GitHub stats (unvalidated). Absent = no token configured: only the stored snapshot is used. */
  fetchStats?: () => Promise<unknown>;
}

export interface ContentStore {
  /** Validated content from memory; never waits on Postgres. Triggers a background refresh once the TTL has passed. */
  read(): Content;
  /** Last good GitHub stats, or undefined when there is no valid snapshot (the Hero hides the sentence). */
  stats(): GithubStats | undefined;
  /** True when Postgres answers. */
  isHealthy(): Promise<boolean>;
  /** Reloads and validates all Sections now, then refreshes stats. Rejects (keeping the last good copy) when content is invalid; a stats failure is only logged. */
  revalidate(): Promise<void>;
  /** Validates `data` against the Section's schema, writes the row and reloads. Rejects with ContentError (nothing written) when invalid. */
  saveSection(key: SectionKey, data: unknown): Promise<void>;
  /** Raw data of every Section row (never github_stats). */
  exportSections(): Promise<Record<SectionKey, unknown>>;
  /** Validates the whole snapshot, then replaces every Section row in one transaction. Rejects with ContentError (nothing changed) when any Section is missing or invalid. */
  importSections(snapshot: unknown): Promise<void>;
}

/** Invalid or missing content. `path` is the exact JSON path, e.g. `hero.title.pt`. */
export class ContentError extends Error {
  constructor(
    readonly path: string,
    message: string,
  ) {
    super(`${path}: ${message}`);
    this.name = 'ContentError';
  }
}

const sectionKeys = Object.keys(sectionSchemas) as SectionKey[];

/** Boot: loads and validates all Sections. Rejects with ContentError when any is missing or invalid. */
export async function createContentStore({
  db,
  clock = Date.now,
  log = logger,
  fetchStats,
}: ContentStoreDeps): Promise<ContentStore> {
  let current = await loadContent(db, log);
  let loadedAt = clock();
  let refreshing: Promise<void> | undefined;

  async function reload() {
    current = await loadContent(db, log);
    loadedAt = clock();
  }

  function refresh() {
    refreshing ??= reload()
      .catch((error: unknown) => log.error('content refresh failed; serving last good copy', { error }))
      .finally(() => {
        refreshing = undefined;
      });
  }

  // Snapshot first, then a background refresh; neither can block or fail boot.
  let statsSnapshot = await readStatsSnapshot(db).catch((error: unknown) => {
    log.error('github stats snapshot unreadable; treating as absent', { error });
    return undefined;
  });
  let statsDueAt = clock();
  let statsRefreshing: Promise<void> | undefined;

  function refreshStats() {
    if (!fetchStats) return;
    statsRefreshing ??= fetchStats()
      .then((raw) => writeStats(db, raw))
      .then((written) => {
        statsSnapshot = written;
        statsDueAt = clock() + STATS_TTL_MS;
      })
      .catch((error: unknown) => {
        statsDueAt = clock() + STATS_RETRY_MS;
        log.error('github stats refresh failed; serving last snapshot', { error });
      })
      .finally(() => {
        statsRefreshing = undefined;
      });
    return statsRefreshing;
  }
  void refreshStats();

  return {
    stats() {
      if (clock() >= statsDueAt) refreshStats();
      return statsSnapshot;
    },
    read() {
      const age = clock() - loadedAt;
      if (age >= CONTENT_TTL_MS) refresh();
      return current;
    },
    isHealthy: () => isReachable(db),
    async saveSection(key, data) {
      validate(key, data);
      await db
        .insert(content)
        .values({ key, data })
        .onConflictDoUpdate({ target: content.key, set: { data, updatedAt: new Date() } });
      await reload();
    },
    async exportSections() {
      const rows = await db.select().from(content).where(inArray(content.key, sectionKeys));
      return Object.fromEntries(rows.map((row) => [row.key, row.data])) as Record<SectionKey, unknown>;
    },
    async importSections(snapshot) {
      const source = isObject(snapshot) ? snapshot : {};
      for (const key of sectionKeys) {
        if (!(key in source)) throw new ContentError(key, 'missing from snapshot');
        validate(key, source[key]);
      }
      await db.transaction(async (tx) => {
        await tx.delete(content).where(inArray(content.key, sectionKeys));
        await tx.insert(content).values(sectionKeys.map((key) => ({ key, data: source[key] })));
      });
      await reload();
    },
    async revalidate() {
      try {
        await reload();
        log.info?.('content reloaded');
      } catch (error) {
        log.error('revalidate rejected; serving last good copy', {
          error,
          path: error instanceof ContentError ? error.path : undefined,
        });
        throw error;
      }
      await refreshStats();
    },
  };
}

/** Parses `data` with the Section's schema; throws ContentError with the exact JSON path. */
function validate(key: SectionKey, data: unknown) {
  const result = sectionSchemas[key].safeParse(data);
  if (!result.success) {
    const [issue] = result.error.issues;
    throw new ContentError([key, ...issue.path].join('.'), issue.message);
  }
  return result.data;
}

async function loadContent(db: Database, log: Logger): Promise<Content> {
  const rows = await db.select().from(content).where(inArray(content.key, sectionKeys));
  const dataByKey = new Map(rows.map((row) => [row.key, row.data]));
  const loaded: Partial<Record<SectionKey, unknown>> = {};
  for (const key of sectionKeys) {
    if (!dataByKey.has(key)) throw new ContentError(key, 'missing content row');
    const data = dataByKey.get(key);
    const parsed = validate(key, data);
    for (const unknownPath of unknownKeys(data, parsed, key))
      log.warn('ignoring unknown content key', { path: unknownPath });
    loaded[key] = parsed;
  }
  return loaded as Content;
}

/** Paths present in the raw input but stripped by the schema. */
function unknownKeys(input: unknown, parsed: unknown, path: string): string[] {
  if (!isObject(input) || !isObject(parsed)) return [];
  return Object.keys(input).flatMap((key) =>
    key in parsed ? unknownKeys(input[key], parsed[key], `${path}.${key}`) : [`${path}.${key}`],
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
