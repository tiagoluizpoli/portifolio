import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { MigrationService } from './migration.js';
import type { InvalidBlueprintFixture } from './migration.spec-setup.js';
import {
  asTablesClient,
  currentTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

describe('MigrationService load/delta behavior', () => {
  setupMigrationServiceTest();

  it('calculates structural delta for missing tables and columns', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [
          {
            key: 'locale',
            type: 'enum',
            required: true,
            elements: ['en', 'pt'],
          },
          { key: 'name', type: 'string', required: true, size: 128 },
        ],
        indexes: [],
      },
      {
        id: asTableId('skills'),
        name: 'Skills',
        uniqueLogicKeys: { byTitle: ['title'] },
        columns: [{ key: 'title', type: 'string', required: true, size: 64 }],
        indexes: [],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.calculateStructuralDelta({
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
      }),
    ).resolves.toEqual({
      missingTables: [customBlueprints[1]],
      missingColumns: [
        {
          tableId: asTableId('about'),
          tableName: 'About',
          columns: [customBlueprints[0].columns[1]],
        },
      ],
    });
  });

  it('returns empty structural delta when remote state is synced', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [
          {
            key: 'locale',
            type: 'enum',
            required: true,
            elements: ['en', 'pt'],
          },
        ],
        indexes: [],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.calculateStructuralDelta({
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
      }),
    ).resolves.toEqual({
      missingTables: [],
      missingColumns: [],
    });
  });

  it('loads remote state when calculating structural delta without injected state', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [
          {
            key: 'locale',
            type: 'enum',
            required: true,
            elements: ['en', 'pt'],
          },
        ],
        indexes: [],
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
      total: 0,
      indexes: [],
    });

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const delta = await service.calculateStructuralDelta({
      blueprintSet: customBlueprints,
    });

    expect(delta).toEqual({
      missingTables: [],
      missingColumns: [],
    });
    expect(tablesClientMock.listTables).toHaveBeenCalledTimes(1);
  });

  it('uses default blueprints when none are provided for structural delta', async () => {
    const tablesClientMock = currentTablesClientMock();

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const delta = await service.calculateStructuralDelta({
      remoteState: {
        tables: [],
      },
    });

    expect(delta.missingTables.length).toBeGreaterThan(0);
    expect(delta.missingColumns).toEqual([]);
  });

  it('sorts missing columns by table id when multiple tables have pending columns', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('skills'),
        name: 'Skills',
        uniqueLogicKeys: { byTitle: ['title'] },
        columns: [{ key: 'title', type: 'string', required: true, size: 64 }],
        indexes: [],
      },
      {
        id: asTableId('about'),
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [
          {
            key: 'locale',
            type: 'enum',
            required: true,
            elements: ['en', 'pt'],
          },
        ],
        indexes: [],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const delta = await service.calculateStructuralDelta({
      blueprintSet: customBlueprints,
      remoteState: {
        tables: [
          {
            tableId: asTableId('skills'),
            tableName: 'Skills',
            columnKeys: [],
            indexKeys: [],
          },
          {
            tableId: asTableId('about'),
            tableName: 'About',
            columnKeys: [],
            indexKeys: [],
          },
        ],
      },
    });

    expect(delta.missingColumns.map((entry) => entry.tableId)).toEqual([
      'about',
      'skills',
    ]);
  });

  it('Class 3 rejects invalid blueprint data in structural delta calculation', async () => {
    const tablesClientMock = currentTablesClientMock();

    const invalidBlueprint: InvalidBlueprintFixture = {
      id: asTableId('1invalid'),
      name: 'Invalid Table',
      uniqueLogicKeys: { byInvalidField: ['notAColumn'] },
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
      service.calculateStructuralDelta({
        blueprintSet: [invalidBlueprint] as unknown as TableBlueprint[],
        remoteState: { tables: [] },
      }),
    ).rejects.toThrow();
    expect(tablesClientMock.listTables).not.toHaveBeenCalled();
  });
});
