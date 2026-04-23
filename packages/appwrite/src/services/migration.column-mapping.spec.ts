import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { MigrationService } from './migration.js';
import {
  asTablesClient,
  currentTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

describe('MigrationService column type mapping behavior', () => {
  setupMigrationServiceTest();

  it('creates all supported column types and maps index variants', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('catalog'),
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
      { tableId: asTableId('catalog'), indexKey: 'idx_name_unique' },
      { tableId: asTableId('catalog'), indexKey: 'idx_name_fulltext' },
    ]);

    expect(tablesClientMock.createIntegerColumn).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'intValue', xdefault: 42 }),
    );
    expect(tablesClientMock.createIntegerColumn).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'intNoDefault', xdefault: undefined }),
    );

    expect(tablesClientMock.createTextColumn).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'stringFallbackSize' }),
    );

    expect(tablesClientMock.createEnumColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'enumFallbackElements',
        elements: [],
      }),
    );

    expect(tablesClientMock.createIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('catalog'),
      key: 'idx_name_unique',
      type: 'unique',
      columns: ['name'],
      orders: ['desc'],
    });

    expect(tablesClientMock.createIndex).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('catalog'),
      key: 'idx_name_fulltext',
      type: 'fulltext',
      columns: ['name'],
      orders: ['asc'],
    });
  });

  it('creates url columns through createUrlColumn mapping', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('links'),
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
      tableId: asTableId('links'),
      key: 'url',
      required: false,
      xdefault: 'https://example.com',
      array: undefined,
    });
  });

  it('does not send xdefault when a column is required', async () => {
    const tablesClientMock = currentTablesClientMock();

    const customBlueprints: TableBlueprint[] = [
      {
        id: asTableId('required_defaults'),
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

    expect(tablesClientMock.createTextColumn).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'name',
        required: true,
        xdefault: undefined,
      }),
    );
  });
});
