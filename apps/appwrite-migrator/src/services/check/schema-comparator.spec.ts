import { describe, expect, it } from 'vitest';
import { SchemaComparator } from './schema-comparator.js';

describe('SchemaComparator', () => {
  it('detects remote-only tables, columns, and indexes', () => {
    const comparator = new SchemaComparator();

    const discrepancies = comparator.detectDiscrepancies({
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

  it('returns sorted unique discrepancies', () => {
    const comparator = new SchemaComparator();

    const discrepancies = comparator.detectDiscrepancies({
      remoteState: {
        tables: [
          {
            tableId: 'zzz_table',
            tableName: 'ZZZ',
            columnKeys: ['foo'],
            indexKeys: [],
          },
          {
            tableId: 'aaa_table',
            tableName: 'AAA',
            columnKeys: ['bar'],
            indexKeys: [],
          },
          {
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['legacyB', 'legacyA', 'legacyA', 'name'],
            indexKeys: ['idx_zeta', 'idx_alpha', 'idx_alpha', 'idx_locale'],
          },
        ],
      },
    });

    expect(discrepancies.tables).toEqual(['aaa_table', 'zzz_table']);
    expect(discrepancies.columns.about).toEqual(['legacyA', 'legacyB']);
    expect(discrepancies.indexes.about).toEqual(['idx_alpha', 'idx_zeta']);
  });
});
