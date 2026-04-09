import {
  AppwriteProvider,
  type Models,
  type Storage,
  type TablesDB,
} from '@repo/appwrite-core/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MigratePortfolioUseCase } from '../application/migrate-portfolio.use-case.js';
import { SchemaManager } from '../infrastructure/schema.manager.js';
import { StorageManager } from '../infrastructure/storage.manager.js';

vi.mock('@repo/appwrite-core/server', () => ({
  AppwriteProvider: {
    getTablesDB: vi.fn(),
    getStorage: vi.fn(),
    getEnv: vi.fn(() => ({ APPWRITE_DATABASE_ID: 'portfolio' })),
    getCuratorRole: vi.fn(() => 'role:team:curators'),
    initialize: vi.fn(),
  },
  ID: { unique: vi.fn(() => 'unique-id') },
  PortfolioService: {
    init: vi.fn(),
  },
}));

vi.mock('@repo/appwrite-core', () => ({
  uploadAssetSchema: { parse: vi.fn((data) => ({ data })) },
}));

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(() => Buffer.from('dummy data')),
}));

vi.mock('node:path', () => ({
  join: vi.fn((...args) => args.join('/')),
}));

vi.mock('../domain/data.parser.js', () => ({
  DataParser: {
    parse: vi.fn(() => ({})),
    getBatches: vi.fn(() => [
      { tableId: 'home', rows: [{ firstName: 'Test' }] },
    ]),
  },
}));

describe('MigratePortfolioUseCase', () => {
  let useCase: MigratePortfolioUseCase;
  let mockTables: {
    createTransaction: ReturnType<typeof vi.fn>;
    upsertRow: ReturnType<typeof vi.fn>;
    updateTransaction: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };
  let mockStorage: {
    getBucket: ReturnType<typeof vi.fn>;
    listFiles: ReturnType<typeof vi.fn>;
    getFileDownload: ReturnType<typeof vi.fn>;
    createFile: ReturnType<typeof vi.fn>;
    deleteFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTables = {
      createTransaction: vi.fn().mockResolvedValue({ $id: 'tx-123' }),
      upsertRow: vi.fn().mockResolvedValue({}),
      updateTransaction: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
    };
    mockStorage = {
      getBucket: vi.fn().mockResolvedValue({}),
      listFiles: vi.fn().mockResolvedValue({ files: [] }),
      getFileDownload: vi.fn().mockResolvedValue(Buffer.from('test')),
      createFile: vi.fn().mockResolvedValue({}),
      deleteFile: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(AppwriteProvider.getTablesDB).mockReturnValue(
      mockTables as unknown as TablesDB,
    );
    vi.mocked(AppwriteProvider.getStorage).mockReturnValue(
      mockStorage as unknown as Storage,
    );
    // Mock SchemaManager to avoid testing its internal logic here
    vi.spyOn(SchemaManager.prototype, 'run').mockResolvedValue(undefined);
    // Mock StorageManager.uploadAsset to avoid physical disk/network calls in tests
    vi.spyOn(StorageManager.prototype, 'uploadAsset').mockResolvedValue({
      $id: 'file-123',
    } as unknown as Models.File); // Models.File is complex to mock fully
    useCase = new MigratePortfolioUseCase();
  });

  it('should be instantiable', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw error if migration fails', async () => {
    mockTables.createTransaction.mockRejectedValue(
      new Error('Transaction Error'),
    );

    await expect(useCase.execute()).rejects.toThrow('Migration failed');
  });

  it('should finish migration successfully if no errors', async () => {
    mockTables.upsertRow.mockResolvedValue({});

    await useCase.execute();

    expect(mockTables.createTransaction).toHaveBeenCalled();
    expect(mockTables.upsertRow).toHaveBeenCalled();
    expect(mockTables.updateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ commit: true }),
    );
  });
});
