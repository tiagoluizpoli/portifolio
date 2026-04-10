import {
  AppwriteProvider,
  type Storage,
  type TablesDB,
} from '@repo/appwrite-core/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SchemaManager } from '../infrastructure/schema.manager.js';

vi.mock('@repo/appwrite-core/server', () => ({
  AppwriteProvider: {
    getTablesDB: vi.fn(),
    initialize: vi.fn(),
    getStorage: vi.fn(),
    getEnv: vi.fn(() => ({ APPWRITE_DATABASE_ID: 'test-db' })),
    getCuratorRole: vi.fn(() => 'role:team:curators'),
  },
  Permission: { read: vi.fn(), write: vi.fn() },
  Role: { any: vi.fn(), team: vi.fn(), curator: vi.fn() },
  IndexType: { Key: 'key' },
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
    create: vi.fn(),
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
          home: 10,
          about: 2,
          metric_sources: 4,
          impact_metrics: 5,
          experience: 6,
          education: 6,
          skills: 7,
          solutions: 6,
          socials: 5,
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
    expect(mockStorage.createBucket).toHaveBeenCalled();
  });
});
