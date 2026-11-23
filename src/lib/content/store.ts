import { inArray } from 'drizzle-orm';
import { type Database, isReachable } from './db';
import { type Content, type SectionKey, sectionSchemas } from './schemas';
import { content } from './table';

export const CONTENT_TTL_MS = 3 * 60 * 60 * 1000;

export type Clock = () => number;
export type Logger = Pick<Console, 'warn' | 'error'>;

export interface ContentStoreDeps {
  db: Database;
  clock?: Clock;
  log?: Logger;
}

export interface ContentStore {
  /** Validated content from memory; never waits on Postgres. Triggers a background refresh once the TTL has passed. */
  read(): Content;
  /** True when Postgres answers. */
  isHealthy(): Promise<boolean>;
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
  log = console,
}: ContentStoreDeps): Promise<ContentStore> {
  let current = await loadContent(db, log);
  let loadedAt = clock();
  let refreshing: Promise<void> | undefined;

  function refresh() {
    refreshing ??= loadContent(db, log)
      .then((next) => {
        current = next;
        loadedAt = clock();
      })
      .catch((error: unknown) => log.error('content refresh failed; serving last good copy', error))
      .finally(() => {
        refreshing = undefined;
      });
  }

  return {
    read() {
      const age = clock() - loadedAt;
      if (age >= CONTENT_TTL_MS) refresh();
      return current;
    },
    isHealthy: () => isReachable(db),
  };
}

async function loadContent(db: Database, log: Logger): Promise<Content> {
  const rows = await db.select().from(content).where(inArray(content.key, sectionKeys));
  const dataByKey = new Map(rows.map((row) => [row.key, row.data]));
  const loaded: Partial<Record<SectionKey, unknown>> = {};
  for (const key of sectionKeys) {
    if (!dataByKey.has(key)) throw new ContentError(key, 'missing content row');
    const data = dataByKey.get(key);
    const result = sectionSchemas[key].safeParse(data);
    if (!result.success) {
      const [issue] = result.error.issues;
      const issuePath = [key, ...issue.path].join('.');
      throw new ContentError(issuePath, issue.message);
    }
    for (const unknownPath of unknownKeys(data, result.data, key))
      log.warn(`ignoring unknown content key ${unknownPath}`);
    loaded[key] = result.data;
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
