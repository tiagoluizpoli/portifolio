import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { MigrationService } from './migration.js';
import {
  asTablesClient,
  currentTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

describe('MigrationService destructive authorization behavior (indexes)', () => {
  setupMigrationServiceTest();

  it('skips destructive index deletion for deleted tables, unknown tables, and missing remote indexes', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [{ key: 'locale', type: 'string', required: true, size: 64 }],
        indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: {
        tables: [
          {
            tableId: asTableId('about'),
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: ['idx_locale'],
          },
          {
            tableId: asTableId('legacy_table'),
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: ['idx_legacy'],
          },
        ],
      },
      destructiveAuthorization: {
        tables: [asTableId('legacy_table')],
        indexes: {
          [asTableId('legacy_table')]: ['idx_legacy'],
          [asTableId('ghost_table')]: ['idx_ghost'],
          [asTableId('about')]: ['idx_missing'],
        },
      },
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('legacy_table'),
    });
    expect(tablesClientMock.deleteIndex).not.toHaveBeenCalled();
  });

  it('handles destructive authorization without indexes block', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [{ key: 'locale', type: 'string', required: true, size: 64 }],
        indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: {
        tables: [
          {
            tableId: asTableId('legacy_table'),
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: ['idx_legacy'],
          },
        ],
      },
      destructiveAuthorization: {
        tables: [asTableId('legacy_table')],
      },
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('legacy_table'),
    });
    expect(tablesClientMock.deleteIndex).not.toHaveBeenCalled();
  });

  it('applies authorized column/index deletions for remote table not present in blueprint', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [{ key: 'locale', type: 'string', required: true, size: 64 }],
        indexes: [],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: {
        tables: [
          {
            tableId: asTableId('about'),
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: [],
          },
          {
            tableId: asTableId('legacy_table'),
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: ['idx_legacy'],
          },
        ],
      },
      destructiveAuthorization: {
        columns: {
          [asTableId('legacy_table')]: ['legacy_field'],
        },
        indexes: {
          [asTableId('legacy_table')]: ['idx_legacy'],
        },
      },
    });

    expect(tablesClientMock.deleteTable).not.toHaveBeenCalled();
    expect(tablesClientMock.deleteColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('legacy_table'),
      key: 'legacy_field',
    });
    expect(tablesClientMock.deleteIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('legacy_table'),
      key: 'idx_legacy',
    });
  });
});
