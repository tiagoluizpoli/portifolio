import type { TablesDB } from 'node-appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppwriteCatastrophicConfigError,
  AppwriteSystemException,
} from '../errors/appwrite-errors.js';
import type { TableBlueprint } from '../migrations/blueprints.js';

interface MigrationTablesClientMock {
  listTables: ReturnType<typeof vi.fn>;
  listColumns: ReturnType<typeof vi.fn>;
  listIndexes: ReturnType<typeof vi.fn>;
  createTable: ReturnType<typeof vi.fn>;
  createStringColumn: ReturnType<typeof vi.fn>;
  createIntegerColumn: ReturnType<typeof vi.fn>;
  createFloatColumn: ReturnType<typeof vi.fn>;
  createBooleanColumn: ReturnType<typeof vi.fn>;
  createDatetimeColumn: ReturnType<typeof vi.fn>;
  createEmailColumn: ReturnType<typeof vi.fn>;
  createEnumColumn: ReturnType<typeof vi.fn>;
  createUrlColumn: ReturnType<typeof vi.fn>;
  createIpColumn: ReturnType<typeof vi.fn>;
  createIndex: ReturnType<typeof vi.fn>;
  deleteTable: ReturnType<typeof vi.fn>;
  deleteColumn: ReturnType<typeof vi.fn>;
  deleteIndex: ReturnType<typeof vi.fn>;
}

interface ListByTableIdInput {
  tableId: string;
}

interface InvalidBlueprintFixture {
  id: string;
  name: string;
  uniqueLogicKeys: Record<string, string[]>;
  columns: Array<Record<string, unknown>>;
  indexes: Array<Record<string, unknown>>;
}

let tablesClientMock: MigrationTablesClientMock;
const getTablesClientMock = vi.fn(() => tablesClientMock);

vi.mock('../client.js', () => ({
  getTablesClient: () => getTablesClientMock(),
}));

import { MigrationService } from './migration.js';

function asTablesClient(input: MigrationTablesClientMock): TablesDB {
  return input as unknown as TablesDB;
}

describe('MigrationService', () => {
  beforeEach(() => {
    getTablesClientMock.mockClear();
    tablesClientMock = {
      listTables: vi.fn(),
      listColumns: vi.fn(),
      listIndexes: vi.fn(),
      createTable: vi.fn(),
      createStringColumn: vi.fn(),
      createIntegerColumn: vi.fn(),
      createFloatColumn: vi.fn(),
      createBooleanColumn: vi.fn(),
      createDatetimeColumn: vi.fn(),
      createEmailColumn: vi.fn(),
      createEnumColumn: vi.fn(),
      createUrlColumn: vi.fn(),
      createIpColumn: vi.fn(),
      createIndex: vi.fn(),
      deleteTable: vi.fn(),
      deleteColumn: vi.fn(),
      deleteIndex: vi.fn(),
    };

    process.env.APPWRITE_DATABASE_ID = 'db-main';
  });

  it('loads remote table, column, and index state', async () => {
    tablesClientMock.listTables.mockResolvedValue({
      total: 2,
      tables: [
        { $id: 'skills', name: 'Skills' },
        { $id: 'about', name: 'About' },
      ],
    });

    tablesClientMock.listColumns.mockImplementation(
      async (input: ListByTableIdInput) => {
        if (input.tableId === 'skills') {
          return {
            total: 2,
            columns: [{ key: 'type' }, { key: 'title' }],
          };
        }

        return {
          total: 1,
          columns: [{ key: 'locale' }],
        };
      },
    );

    tablesClientMock.listIndexes.mockImplementation(
      async (input: ListByTableIdInput) => {
        if (input.tableId === 'skills') {
          return {
            total: 2,
            indexes: [{ key: 'idx_sort' }, { key: 'idx_type' }],
          };
        }

        return {
          total: 1,
          indexes: [{ key: 'idx_locale' }],
        };
      },
    );

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(service.loadRemoteState()).resolves.toEqual({
      tables: [
        {
          tableId: 'about',
          tableName: 'About',
          columnKeys: ['locale'],
          indexKeys: ['idx_locale'],
        },
        {
          tableId: 'skills',
          tableName: 'Skills',
          columnKeys: ['title', 'type'],
          indexKeys: ['idx_sort', 'idx_type'],
        },
      ],
    });

    expect(tablesClientMock.listTables).toHaveBeenCalledWith({
      databaseId: 'db-override',
    });
    expect(tablesClientMock.listColumns).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'skills',
    });
    expect(tablesClientMock.listIndexes).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'about',
    });
  });

  it('maps SDK failures to appwrite exceptions', async () => {
    tablesClientMock.listTables.mockRejectedValue({ code: 500 });

    const service = new MigrationService({
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(service.loadRemoteState()).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
  });

  it('throws catastrophic config error when database id is missing', () => {
    delete process.env.APPWRITE_DATABASE_ID;

    expect(
      () =>
        new MigrationService({
          tablesClient: asTablesClient(tablesClientMock),
        }),
    ).toThrow(AppwriteCatastrophicConfigError);
  });

  it('uses getTablesClient when no client is injected', async () => {
    tablesClientMock.listTables.mockResolvedValue({
      total: 1,
      tables: [{ $id: 'about', name: 'About' }],
    });
    tablesClientMock.listColumns.mockResolvedValue({
      total: 1,
      columns: [{ key: 'locale' }],
    });
    tablesClientMock.listIndexes.mockResolvedValue({
      total: 1,
      indexes: [{ key: 'idx_locale' }],
    });

    const service = new MigrationService({ databaseId: 'db-main' });
    await service.loadRemoteState();

    expect(getTablesClientMock).toHaveBeenCalledTimes(1);
  });

  it('calculates structural delta for missing tables and columns', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
        id: 'skills',
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
              tableId: 'about',
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
          tableId: 'about',
          tableName: 'About',
          columns: [customBlueprints[0].columns[1]],
        },
      ],
    });
  });

  it('returns empty structural delta when remote state is synced', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
              tableId: 'about',
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
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
      tables: [{ $id: 'about', name: 'About' }],
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
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'skills',
        name: 'Skills',
        uniqueLogicKeys: { byTitle: ['title'] },
        columns: [{ key: 'title', type: 'string', required: true, size: 64 }],
        indexes: [],
      },
      {
        id: 'about',
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
            tableId: 'skills',
            tableName: 'Skills',
            columnKeys: [],
            indexKeys: [],
          },
          {
            tableId: 'about',
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
    const invalidBlueprint: InvalidBlueprintFixture = {
      id: '1invalid',
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

  it('applies idempotent structural changes using object-parameter SDK calls', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [
          { key: 'locale', type: 'string', required: true, size: 64 },
          { key: 'name', type: 'string', required: true, size: 128 },
        ],
        indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
      },
      {
        id: 'skills',
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
            tableId: 'about',
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
        { tableId: 'skills', columnKey: 'title' },
        { tableId: 'about', columnKey: 'name' },
      ],
      createdIndexes: [
        { tableId: 'skills', indexKey: 'idx_title' },
        { tableId: 'about', indexKey: 'idx_locale' },
      ],
    });

    expect(tablesClientMock.createTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'skills',
      name: 'Skills',
    });

    expect(tablesClientMock.createStringColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'about',
      key: 'name',
      size: 128,
      required: true,
      xdefault: undefined,
      array: undefined,
    });

    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(2);
  });

  it('returns no-op result when schema is already synced', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
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
    expect(tablesClientMock.createStringColumn).not.toHaveBeenCalled();
    expect(tablesClientMock.createIndex).not.toHaveBeenCalled();
  });

  it('maps migration apply failures to appwrite exceptions', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'skills',
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
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
        name: 'About',
        uniqueLogicKeys: { byLocale: ['locale'] },
        columns: [{ key: 'locale', type: 'string', required: true, size: 64 }],
        indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
      },
    ];

    tablesClientMock.listTables.mockResolvedValue({
      total: 1,
      tables: [{ $id: 'about', name: 'About' }],
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

  it('creates all supported column types and maps index variants', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'catalog',
        name: 'Catalog',
        uniqueLogicKeys: { byName: ['name'] },
        columns: [
          {
            key: 'name',
            type: 'string',
            required: false,
            size: 128,
            default: 'default-name',
          },
          {
            key: 'stringNoDefault',
            type: 'string',
            required: false,
            size: 64,
          },
          {
            key: 'stringFallbackSize',
            type: 'string',
            required: false,
          },
          {
            key: 'intValue',
            type: 'integer',
            required: false,
            default: 42.8,
          },
          { key: 'intNoDefault', type: 'integer', required: false },
          {
            key: 'floatValue',
            type: 'float',
            required: false,
            default: 2.5,
          },
          { key: 'floatNoDefault', type: 'float', required: false },
          {
            key: 'flagTrue',
            type: 'boolean',
            required: false,
            default: true,
          },
          { key: 'flagNoDefault', type: 'boolean', required: false },
          {
            key: 'publishedAt',
            type: 'datetime',
            required: false,
            default: '2026-01-01T00:00:00.000Z',
          },
          { key: 'publishedAtNoDefault', type: 'datetime', required: false },
          {
            key: 'supportEmail',
            type: 'email',
            required: false,
            default: 'support@example.com',
          },
          { key: 'supportEmailNoDefault', type: 'email', required: false },
          {
            key: 'locale',
            type: 'enum',
            required: false,
            elements: ['en', 'pt'],
            default: 'en',
          },
          {
            key: 'localeNoDefault',
            type: 'enum',
            required: false,
            elements: ['en', 'pt'],
          },
          {
            key: 'enumFallbackElements',
            type: 'enum',
            required: false,
          },
          {
            key: 'website',
            type: 'url',
            required: false,
            default: 'https://example.com',
          },
          { key: 'websiteNoDefault', type: 'url', required: false },
          {
            key: 'ipAddress',
            type: 'ip',
            required: false,
            default: '127.0.0.1',
          },
          { key: 'ipNoDefault', type: 'ip', required: false },
        ],
        indexes: [
          {
            key: 'idx_name_unique',
            type: 'unique',
            attributes: ['name'],
            orders: ['DESC'],
          },
          {
            key: 'idx_name_fulltext',
            type: 'fulltext',
            attributes: ['name'],
            orders: ['ASC'],
          },
        ],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const result = await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: { tables: [] },
    });

    expect(result.createdTables).toEqual(['catalog']);
    expect(result.createdColumns).toHaveLength(
      customBlueprints[0].columns.length,
    );
    expect(result.createdIndexes).toEqual([
      { tableId: 'catalog', indexKey: 'idx_name_unique' },
      { tableId: 'catalog', indexKey: 'idx_name_fulltext' },
    ]);

    expect(tablesClientMock.createIntegerColumn).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'intValue', xdefault: 42 }),
    );
    expect(tablesClientMock.createIntegerColumn).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'intNoDefault', xdefault: undefined }),
    );

    expect(tablesClientMock.createStringColumn).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'stringFallbackSize', size: 255 }),
    );

    expect(tablesClientMock.createEnumColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'enumFallbackElements',
        elements: [],
      }),
    );

    expect(tablesClientMock.createIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'catalog',
      key: 'idx_name_unique',
      type: 'unique',
      columns: ['name'],
      orders: ['desc'],
    });

    expect(tablesClientMock.createIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'catalog',
      key: 'idx_name_fulltext',
      type: 'fulltext',
      columns: ['name'],
      orders: ['asc'],
    });
  });

  it('creates url columns through createUrlColumn mapping', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'links',
        name: 'Links',
        uniqueLogicKeys: { byUrl: ['url'] },
        columns: [
          {
            key: 'url',
            type: 'url',
            required: false,
            default: 'https://example.com',
          },
        ],
        indexes: [],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: { tables: [] },
    });

    expect(tablesClientMock.createUrlColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'links',
      key: 'url',
      required: false,
      xdefault: 'https://example.com',
      array: undefined,
    });
  });

  it('does not send xdefault when a column is required', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'required_defaults',
        name: 'Required Defaults',
        uniqueLogicKeys: { byName: ['name'] },
        columns: [
          {
            key: 'name',
            type: 'string',
            required: true,
            size: 128,
            default: 'should-not-be-sent',
          },
        ],
        indexes: [],
      },
    ];

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: { tables: [] },
    });

    expect(tablesClientMock.createStringColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'name',
        required: true,
        xdefault: undefined,
      }),
    );
  });

  it('Class 3 rejects invalid blueprint data before migration apply', async () => {
    const invalidBlueprint: InvalidBlueprintFixture = {
      id: 'invalid_table',
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

  it('deletes only explicitly authorized remote-only table, columns, and indexes', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['locale', 'name', 'legacy_field'],
            indexKeys: ['idx_locale', 'idx_legacy'],
          },
          {
            tableId: 'legacy_table',
            tableName: 'Legacy Table',
            columnKeys: ['foo'],
            indexKeys: [],
          },
        ],
      },
      destructiveAuthorization: {
        tables: ['legacy_table', 'about'],
        columns: {
          about: ['legacy_field', 'locale'],
        },
        indexes: {
          about: ['idx_legacy', 'idx_locale'],
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
      tableId: 'legacy_table',
    });

    expect(tablesClientMock.deleteColumn).toHaveBeenCalledTimes(1);
    expect(tablesClientMock.deleteColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'about',
      key: 'legacy_field',
    });

    expect(tablesClientMock.deleteIndex).toHaveBeenCalledTimes(1);
    expect(tablesClientMock.deleteIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'about',
      key: 'idx_legacy',
    });
  });

  it('skips destructive column deletion for deleted tables, unknown tables, and missing remote columns', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: [],
          },
          {
            tableId: 'legacy_table',
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: [],
          },
        ],
      },
      destructiveAuthorization: {
        tables: ['legacy_table'],
        columns: {
          legacy_table: ['legacy_field'],
          ghost_table: ['ghost_column'],
          about: ['missing_remote_column'],
        },
      },
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'legacy_table',
    });
    expect(tablesClientMock.deleteColumn).not.toHaveBeenCalled();
  });

  it('does not delete anything when destructive authorization is omitted', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
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

  it('skips destructive index deletion for deleted tables, unknown tables, and missing remote indexes', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: ['idx_locale'],
          },
          {
            tableId: 'legacy_table',
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: ['idx_legacy'],
          },
        ],
      },
      destructiveAuthorization: {
        tables: ['legacy_table'],
        indexes: {
          legacy_table: ['idx_legacy'],
          ghost_table: ['idx_ghost'],
          about: ['idx_missing'],
        },
      },
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'legacy_table',
    });
    expect(tablesClientMock.deleteIndex).not.toHaveBeenCalled();
  });

  it('handles destructive authorization without indexes block', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'legacy_table',
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: ['idx_legacy'],
          },
        ],
      },
      destructiveAuthorization: {
        tables: ['legacy_table'],
      },
    });

    expect(tablesClientMock.deleteTable).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'legacy_table',
    });
    expect(tablesClientMock.deleteIndex).not.toHaveBeenCalled();
  });

  it('ignores authorized table deletion when table does not exist remotely', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: [],
          },
        ],
      },
      destructiveAuthorization: {
        tables: ['ghost_table'],
      },
    });

    expect(tablesClientMock.deleteTable).not.toHaveBeenCalled();
  });

  it('applies authorized column/index deletions for remote table not present in blueprint', async () => {
    const customBlueprints: TableBlueprint[] = [
      {
        id: 'about',
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
            tableId: 'about',
            tableName: 'About',
            columnKeys: ['locale'],
            indexKeys: [],
          },
          {
            tableId: 'legacy_table',
            tableName: 'Legacy Table',
            columnKeys: ['legacy_field'],
            indexKeys: ['idx_legacy'],
          },
        ],
      },
      destructiveAuthorization: {
        columns: {
          legacy_table: ['legacy_field'],
        },
        indexes: {
          legacy_table: ['idx_legacy'],
        },
      },
    });

    expect(tablesClientMock.deleteTable).not.toHaveBeenCalled();
    expect(tablesClientMock.deleteColumn).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'legacy_table',
      key: 'legacy_field',
    });
    expect(tablesClientMock.deleteIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: 'legacy_table',
      key: 'idx_legacy',
    });
  });
});
