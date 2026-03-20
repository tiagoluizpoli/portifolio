import { AppwriteProvider } from '@repo/appwrite-core';
import type { Storage, TablesDB } from 'node-appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaManager } from '../infrastructure/schema.manager';

vi.mock('@repo/appwrite-core', () => ({
  AppwriteProvider: {
    getTablesDB: vi.fn(),
    initialize: vi.fn(),
    getStorage: vi.fn(),
    getEnv: vi.fn(() => ({ APPWRITE_DATABASE_ID: 'test-db' })),
    getCuratorRole: vi.fn(() => 'role:team:curators'),
  },
}));

describe('SchemaManager', () => {
  let schemaManager: SchemaManager;
  const mockTables = {
    get: vi.fn(),
    getTable: vi.fn(),
    createTable: vi.fn(),
    createStringColumn: vi.fn(),
    createIntegerColumn: vi.fn(),
    createIndex: vi.fn(),
  };
  const mockStorage = {
    getBucket: vi.fn(),
    createBucket: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppwriteProvider.getTablesDB).mockReturnValue(
      mockTables as unknown as TablesDB,
    );
    vi.mocked(AppwriteProvider.getStorage).mockReturnValue(
      mockStorage as unknown as Storage,
    );
    schemaManager = new SchemaManager();
  });

  it('should attempt to create tables if they do not exist', async () => {
    mockTables.get.mockResolvedValue({}); // DB exists
    const createdTables = new Set<string>();
    mockTables.getTable.mockImplementation(
      async (params: { tableId: string }) => {
        if (!createdTables.has(params.tableId)) {
          createdTables.add(params.tableId);
          throw { code: 404 };
        }
        const counts: Record<string, number> = {
          home: 8,
          experience: 6,
          education: 6,
          skills: 5,
          solutions: 5,
          socials: 4,
          contact_info: 5,
        };
        return {
          $id: params.tableId,
          columns: new Array(counts[params.tableId] || 0).fill({}),
        };
      },
    );
    mockStorage.getBucket.mockRejectedValue({ code: 404 });

    await schemaManager.run();

    expect(mockTables.createTable).toHaveBeenCalled();
    expect(mockTables.createStringColumn).toHaveBeenCalled();
    expect(mockTables.createIndex).toHaveBeenCalled();
    expect(mockStorage.createBucket).toHaveBeenCalledWith(
      expect.objectContaining({
        bucketId: 'assets',
        name: expect.any(String),
        permissions: expect.arrayContaining([
          'read("any")',
          'write("role:team:curators")',
        ]),
        fileSecurity: true,
      }),
    );
  });
});
