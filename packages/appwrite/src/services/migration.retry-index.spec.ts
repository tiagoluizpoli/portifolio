import { asTableId } from '@repo/appwrite-core';
import { describe, expect, it } from 'vitest';
import type { TableBlueprint } from '../migrations/blueprints.js';
import { MigrationService } from './migration.js';
import {
  asTablesClient,
  currentTablesClientMock,
  setupMigrationServiceTest,
} from './migration.spec-setup.js';

describe('MigrationService retry/index behavior', () => {
  setupMigrationServiceTest();

  const customBlueprints: TableBlueprint[] = [
    {
      id: asTableId('about'),
      name: 'About',
      uniqueLogicKeys: { byLocale: ['locale'] },
      columns: [{ key: 'locale', type: 'string', required: true, size: 64 }],
      indexes: [{ key: 'idx_locale', type: 'key', attributes: ['locale'] }],
    },
  ];

  it('retries index creation when column is temporarily unavailable', async () => {
    const tablesClientMock = currentTablesClientMock();

    tablesClientMock.createIndex
      .mockRejectedValueOnce({ message: 'Column not available: locale' })
      .mockResolvedValueOnce({});

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    const result = await service.migrate({
      blueprintSet: customBlueprints,
      remoteState: { tables: [] },
    });

    expect(result.createdIndexes).toEqual([
      { tableId: asTableId('about'), indexKey: 'idx_locale' },
    ]);
    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(2);
  });

  it('fails without retry when index error message is not a string', async () => {
    const tablesClientMock = currentTablesClientMock();

    tablesClientMock.createIndex.mockRejectedValueOnce({
      message: { text: 'Column not available: locale' },
    });

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.migrate({
        blueprintSet: customBlueprints,
        remoteState: { tables: [] },
      }),
    ).rejects.toThrow(/Unknown Appwrite error/);

    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(1);
  });

  it('fails without retry when index error is not an object', async () => {
    const tablesClientMock = currentTablesClientMock();

    tablesClientMock.createIndex.mockRejectedValueOnce(null);

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.migrate({
        blueprintSet: customBlueprints,
        remoteState: { tables: [] },
      }),
    ).rejects.toThrow(/Unknown Appwrite error/);

    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(1);
  });

  it('fails without retry when index error object has no message field', async () => {
    const tablesClientMock = currentTablesClientMock();

    tablesClientMock.createIndex.mockRejectedValueOnce({ reason: 'not-ready' });

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.migrate({
        blueprintSet: customBlueprints,
        remoteState: { tables: [] },
      }),
    ).rejects.toThrow(/Unknown Appwrite error/);

    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(1);
  });

  it('throws after max retry attempts when column stays unavailable', async () => {
    const tablesClientMock = currentTablesClientMock();

    tablesClientMock.createIndex.mockRejectedValue(
      new Error('Column not available: locale'),
    );

    const service = new MigrationService({
      databaseId: 'db-override',
      tablesClient: asTablesClient(tablesClientMock),
    });

    await expect(
      service.migrate({
        blueprintSet: customBlueprints,
        remoteState: { tables: [] },
      }),
    ).rejects.toThrow(/Column not available: locale/);

    expect(tablesClientMock.createIndex).toHaveBeenCalledTimes(5);
  });
});
