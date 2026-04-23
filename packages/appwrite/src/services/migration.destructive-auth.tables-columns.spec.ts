import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { MigrationService } from './migration.js';
import {
  asTablesClient,
  currentTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

describe('MigrationService destructive authorization behavior (tables/columns)', () => {
  setupMigrationServiceTest();

  it('deletes only explicitly authorized remote-only table, columns, and indexes', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [
          { key: 'locale', type: 'string', required: true, size: 64 },
          { key: 'name', type: 'string', required: true, size: 128 },
        ],
        indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const result = await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: {
        tables: [
          {
            tableId: asTableId('about'),
            tableName: 'About',
            columnKeys: ['locale', 'name', 'legacy_field'],
            indexKeys: ['idx_locale', 'idx_legacy'],
          },
          {
            tableId: asTableId('legacy_table'),
            tableName: 'Legacy Table',
            columnKeys: ['foo'],
            indexKeys: [],
          },
        ],
      },
      destructiveAuthorization: {
        tables: [asTableId('legacy_table'), asTableId('about')],
        columns: {
          [asTableId('about')]: ['legacy_field', 'locale'],
        },
        indexes: {
          [asTableId('about')]: ['idx_legacy', 'idx_locale'],
        },
      },
    });

    expect(result).toEqual({
      createdTables: [],
      createdColumns: [],
      createdIndexes: [],
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledTimes(1);
    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('legacy_table'),
    });

    expect(tablesClientMock.deleteColumn).toHaveBeenCalledTimes(1);
    expect(tablesClientMock.deleteColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('about'),
      key: 'legacy_field',
    });

    expect(tablesClientMock.deleteIndex).toHaveBeenCalledTimes(1);
    expect(tablesClientMock.deleteIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('about'),
      key: 'idx_legacy',
    });
  });

  it('skips destructive column deletion for deleted tables, unknown tables, and missing remote columns', async () => {
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
            indexKeys: [],
          },
        ],
      },
      destructiveAuthorization: {
        tables: [asTableId('legacy_table')],
        columns: {
          [asTableId('legacy_table')]: ['legacy_field'],
          [asTableId('ghost_table')]: ['ghost_column'],
          [asTableId('about')]: ['missing_remote_column'],
        },
      },
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('legacy_table'),
    });
    expect(tablesClientMock.deleteColumn).not.toHaveBeenCalled();
  });

  it('does not delete anything when destructive authorization is omitted', async () => {
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
            columnKeys: ['locale', 'legacy_field'],
            indexKeys: ['idx_locale', 'idx_legacy'],
          },
        ],
      },
    });

    expect(tablesClientMock.deleteTable).not.toHaveBeenCalled();
    expect(tablesClientMock.deleteColumn).not.toHaveBeenCalled();
    expect(tablesClientMock.deleteIndex).not.toHaveBeenCalled();
  });

  it('ignores authorized table deletion when table does not exist remotely', async () => {
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
        ],
      },
      destructiveAuthorization: {
        tables: [asTableId('ghost_table')],
      },
    });

    expect(tablesClientMock.deleteTable).not.toHaveBeenCalled();
  });
});
