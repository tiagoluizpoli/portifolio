import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import { AppwriteSystemException } from '../errors/appwrite-errors.js';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { MigrationService } from './migration.js';
import type { InvalidBlueprintFixture } from './migration.spec-setup.js';
import {
  asTablesClient,
  currentTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

describe('MigrationService migrate core behavior', () => {
  setupMigrationServiceTest();

  it('applies idempotent structural changes using object-parameter SDK calls', async () => {
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
      {
        id: asTableId('skills'),
        name: 'Skills',
        uniqueLogicKeys: { byTitle: ['title'] },
        columns: [{ key: 'title', type: 'string', required: true, size: 64 }],
        indexes: [{ key: 'idx_title', type: 'key', attributes: ['title'] }],
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
            columnKeys: ['locale'],
            indexKeys: [],
          },
        ],
      },
    });

    expect(result).toEqual({
      createdTables: ['skills'],
      createdColumns: [
        { tableId: asTableId('skills'), columnKey: 'title' },
        { tableId: asTableId('about'), columnKey: 'name' },
      ],
      createdIndexes: [
        { tableId: asTableId('skills'), indexKey: 'idx_title' },
        { tableId: asTableId('about'), indexKey: 'idx_locale' },
      ],
    });

    expect(tablesClientMock.createTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('skills'),
      name: 'Skills',
    });

    expect(tablesClientMock.createVarcharColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('about'),
      key: 'name',
      size: 128,
      required: true,
      xdefault: undefined,
      array: undefined,
    });

    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(2);
  });

  it('returns no-op result when schema is already synced', async () => {
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

    const result = await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: {
        tables: [
          {
            tableId: asTableId('about'),
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: ['idx_locale'],
          },
        ],
      },
    });

    expect(result).toEqual({
      createdTables: [],
      createdColumns: [],
      createdIndexes: [],
    });

    expect(tablesClientMock.createTable).not.toHaveBeenCalled();
    expect(tablesClientMock.createVarcharColumn).not.toHaveBeenCalled();
    expect(tablesClientMock.createIndex).not.toHaveBeenCalled();
  });

  it('maps migration apply failures to appwrite exceptions', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('skills'),
        name: 'Skills',
        uniqueLogicKeys: { byTitle: ['title'] },
        columns: [{ key: 'title', type: 'string', required: true, size: 64 }],
        indexes: [],
      },
    ];

    tablesClientMock.createTable.mockRejectedValue({ code: 500 });

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.migrate({
        blueprintSet: customBlueprints,
        remoteState: { tables: [] },
      }),
    ).rejects.toBeInstanceOf(AppwriteSystemException);
  });

  it('loads remote state when migrate is called without remoteState input', async () => {
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

    tablesClientMock.listTables.mockResolvedValue({
      total: 1,
      tables: [{ $id: asTableId('about'), name: 'About' }],
    });
    tablesClientMock.listColumns.mockResolvedValue({
      total: 1,
      columns: [{ key: 'locale' }],
    });
    tablesClientMock.listIndexes.mockResolvedValue({
      total: 1,
      indexes: [{ key: 'idx_locale' }],
    });

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const result = await service.migrate({ blueprintSet: customBlueprints });

    expect(result).toEqual({
      createdTables: [],
      createdColumns: [],
      createdIndexes: [],
    });
    expect(tablesClientMock.listTables).toHaveBeenCalledTimes(1);
  });

  it('uses default blueprints when migrate input does not provide blueprintSet', async () => {
    const tablesClientMock = currentTablesClientMock();

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await service.migrate({
      remoteState: {
        tables: [],
      },
    });

    expect(tablesClientMock.createTable).toHaveBeenCalled();
  });

  it('Class 3 rejects invalid blueprint data before migration apply', async () => {
    const tablesClientMock = currentTablesClientMock();

    const invalidBlueprint: InvalidBlueprintFixture = {
      id: asTableId('invalid_table'),
      name: 'Invalid Table',
      uniqueLogicKeys: {
        emptyCombination: [],
      },
      columns: [
        {
          key: 'name',
          type: 'string',
          required: true,
          size: 64,
        },
      ],
      indexes: [],
    };

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.migrate({
        blueprintSet: [invalidBlueprint] as unknown as TableBlueprint[],
        remoteState: { tables: [] },
      }),
    ).rejects.toThrow();
    expect(tablesClientMock.createTable).not.toHaveBeenCalled();
  });
});
