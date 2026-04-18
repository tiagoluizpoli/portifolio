import { describe, expect, it, vi } from 'vitest';
import {
  DestructiveOfficer,
  DestructiveStateParseError,
  type DestructiveStateStore,
} from './destructive-officer.js';

function createStoreMock(initial: string | null = null): {
  store: DestructiveStateStore;
  writes: Array<{ fileName: string; content: string }>;
} {
  let current = initial;
  const writes: Array<{ fileName: string; content: string }> = [];

  const store: DestructiveStateStore = {
    read: vi.fn(async () => current),
    write: vi.fn(async (input) => {
      writes.push(input);
      current = input.content;
    }),
  };

  return { store, writes };
}

describe('DestructiveOfficer', () => {
  it('detects remote-only tables, columns, and indexes', () => {
    const { store } = createStoreMock();
    const officer = new DestructiveOfficer(store);

    const discrepancies = officer.detectDiscrepancies({
      remoteState: {
        tables: [
          {
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['name', 'title', 'bio', 'locale', 'legacyField'],
            indexKeys: ['idx_locale', 'idx_legacy'],
          },
          {
            tableId: 'legacy_table',
            tableName: 'Legacy',
            columnKeys: ['foo'],
            indexKeys: [],
          },
        ],
      },
    });

    expect(discrepancies.tables).toEqual(['legacy_table']);
    expect(discrepancies.columns.about).toEqual(['legacyField']);
    expect(discrepancies.indexes.about).toEqual(['idx_legacy']);
  });

  it('syncs living state with false defaults for newly detected discrepancies', async () => {
    const { store, writes } = createStoreMock();
    const officer = new DestructiveOfficer(store);

    const result = await officer.syncLivingState({
      now: '2026-04-17T10:00:00.000Z',
      remoteState: {
        tables: [
          {
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['name', 'title', 'bio', 'locale', 'legacyField'],
            indexKeys: ['idx_locale', 'idx_legacy'],
          },
        ],
      },
    });

    expect(result.state.tables).toEqual({});
    expect(result.state.columns.about).toEqual({ legacyField: false });
    expect(result.state.indexes.about).toEqual({ idx_legacy: false });
    expect(result.authorized).toEqual({
      tables: [],
      columns: {},
      indexes: {},
    });
    expect(writes).toHaveLength(1);
  });

  it('preserves manual approval flags and exposes authorized entries', async () => {
    const initial = JSON.stringify(
      {
        version: 1,
        updatedAt: '2026-04-17T09:00:00.000Z',
        tables: {},
        columns: {
          about: {
            legacyField: true,
          },
        },
        indexes: {
          about: {
            idx_legacy: true,
          },
        },
      },
      null,
      2,
    );

    const { store } = createStoreMock(initial);
    const officer = new DestructiveOfficer(store);

    const result = await officer.syncLivingState({
      now: '2026-04-17T10:00:00.000Z',
      remoteState: {
        tables: [
          {
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['name', 'title', 'bio', 'locale', 'legacyField'],
            indexKeys: ['idx_locale', 'idx_legacy'],
          },
        ],
      },
    });

    expect(result.state.columns.about.legacyField).toBe(true);
    expect(result.state.indexes.about.idx_legacy).toBe(true);
    expect(result.authorized.columns).toEqual({ about: ['legacyField'] });
    expect(result.authorized.indexes).toEqual({ about: ['idx_legacy'] });
  });

  it('prunes applied entries from living state', () => {
    const { store } = createStoreMock();
    const officer = new DestructiveOfficer(store);

    const next = officer.pruneApplied({
      now: '2026-04-17T11:00:00.000Z',
      state: {
        version: 1,
        updatedAt: '2026-04-17T10:00:00.000Z',
        tables: { legacy_table: true },
        columns: { about: { legacyField: true } },
        indexes: { about: { idx_legacy: true } },
      },
      applied: {
        tables: ['legacy_table'],
        columns: { about: ['legacyField'] },
        indexes: { about: ['idx_legacy'] },
      },
    });

    expect(next.tables).toEqual({});
    expect(next.columns).toEqual({});
    expect(next.indexes).toEqual({});
    expect(next.updatedAt).toBe('2026-04-17T11:00:00.000Z');
  });

  it('throws parse error when remote living state is invalid JSON', async () => {
    const { store } = createStoreMock('{not-valid-json');
    const officer = new DestructiveOfficer(store);

    await expect(
      officer.syncLivingState({
        remoteState: {
          tables: [],
        },
      }),
    ).rejects.toBeInstanceOf(DestructiveStateParseError);
  });
});
