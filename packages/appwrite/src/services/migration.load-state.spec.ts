import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it, vi } from 'vitest';
import {
  AppwriteCatastrophicConfigError,
  AppwriteSystemException,
} from '../errors/appwrite-errors.js';
import { MigrationService } from './migration.js';
import type { ListByTableIdInput } from './migration.spec-setup.js';
import {
  asTablesClient,
  currentTablesClientMock,
  getTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

vi.mock('../client.js', () => ({
  getTablesClient: () => getTablesClientMock(),
}));

describe('MigrationService load state behavior', () => {
  setupMigrationServiceTest();

  it('loads remote table, column, and index state', async () => {
    const tablesClientMock = currentTablesClientMock();

    tablesClientMock.listTables.mockResolvedValue({
      total: 2,
      tables: [
        { $id: asTableId('skills'), name: 'Skills' },
        { $id: asTableId('about'), name: 'About' },
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
          tableId: asTableId('about'),
          tableName: 'About',
          columnKeys: ['locale'],
          indexKeys: ['idx_locale'],
        },
        {
          tableId: asTableId('skills'),
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
      tableId: asTableId('skills'),
    });
    expect(tablesClientMock.listIndexes).toHaveBeenCalledWith({
      databaseId: 'db-override',
      tableId: asTableId('about'),
    });
  });

  it('maps SDK failures to appwrite exceptions', async () => {
    const tablesClientMock = currentTablesClientMock();
    tablesClientMock.listTables.mockRejectedValue({ code: 500 });

    const service = new MigrationService({
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(service.loadRemoteState()).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
  });

  it('throws catastrophic config error when database id is missing', () => {
    const tablesClientMock = currentTablesClientMock();
    delete process.env.APPWRITE_DATABASE_ID;

    expect(
      () =>
        new MigrationService({
          tablesClient: asTablesClient(tablesClientMock),
        }),
    ).toThrow(AppwriteCatastrophicConfigError);
  });

  it('uses getTablesClient when no client is injected', async () => {
    const tablesClientMock = currentTablesClientMock();

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

    const service = new MigrationService({ databaseId: 'db-main' });
    await service.loadRemoteState();

    expect(getTablesClientMock).toHaveBeenCalledTimes(1);
  });
});
