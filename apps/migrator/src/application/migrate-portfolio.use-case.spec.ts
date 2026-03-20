import { AppwriteProvider } from '@repo/appwrite-core';
import type { Models, Storage, TablesDB } from 'node-appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MigratePortfolioUseCase } from '../application/migrate-portfolio.use-case';
import { StorageManager } from '../infrastructure/storage.manager';

vi.mock('@repo/appwrite-core', () => ({
  AppwriteProvider: {
    getTablesDB: vi.fn(),
    getStorage: vi.fn(),
    getEnv: vi.fn(() => ({ APPWRITE_DATABASE_ID: 'portfolio' })),
    getCuratorRole: vi.fn(() => 'role:team:curators'),
    initialize: vi.fn(),
  },
}));

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(() => Buffer.from('dummy data')),
}));

vi.mock('node:path', () => ({
  join: vi.fn((...args) => args.join('/')),
}));

describe('MigratePortfolioUseCase', () => {
  let useCase: MigratePortfolioUseCase;
  const mockTables = {
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    upsertRow: vi.fn(),
    get: vi.fn().mockResolvedValue({}),
    getTable: vi.fn().mockResolvedValue({ columns: new Array(10).fill({}) }),
    createTable: vi.fn().mockResolvedValue({}),
    createStringColumn: vi.fn().mockResolvedValue({}),
    createIntegerColumn: vi.fn().mockResolvedValue({}),
    createIndex: vi.fn().mockResolvedValue({}),
  };
  const mockStorage = {
    getBucket: vi.fn().mockResolvedValue({}),
    listFiles: vi.fn().mockResolvedValue({ files: [] }),
    getFileDownload: vi.fn().mockResolvedValue(Buffer.from('test')),
    createFile: vi.fn().mockResolvedValue({}),
    deleteFile: vi.fn().mockResolvedValue({}),
    uploadAsset: vi.fn().mockResolvedValue({ $id: 'file-123' }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AppwriteProvider.getTablesDB).mockReturnValue(
      mockTables as unknown as TablesDB,
    );
    vi.mocked(AppwriteProvider.getStorage).mockReturnValue(
      mockStorage as unknown as Storage,
    );
    // Mock StorageManager.uploadAsset to avoid physical disk/network calls in tests
    vi.spyOn(StorageManager.prototype, 'uploadAsset').mockResolvedValue({
      $id: 'file-123',
    } as unknown as Models.File);
    useCase = new MigratePortfolioUseCase();
  });

  it('should be instantiable', () => {
    expect(useCase).toBeDefined();
  });

  it('should rollback transaction if ingestion fails', async () => {
    mockTables.createTransaction.mockResolvedValue({ $id: 'tx-123' });
    mockTables.upsertRow.mockRejectedValue(new Error('Ingestion Error'));

    await expect(useCase.execute()).rejects.toThrow(
      'Migration failed and was rolled back',
    );

    expect(mockTables.updateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: 'tx-123',
        rollback: true,
      }),
    );
  });

  it('should finish migration successfully if no errors', async () => {
    mockTables.createTransaction.mockResolvedValue({ $id: 'tx-123' });
    mockTables.upsertRow.mockResolvedValue({});
    mockTables.updateTransaction.mockResolvedValue({});

    await useCase.execute();

    expect(mockTables.updateTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionId: 'tx-123',
        commit: true,
      }),
    );
  });
});
