import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RepositoryFactory } from '../repositories/repository-factory.js';
import { SeedEngine } from './seed-engine.js';
import type { StorageService } from './storage.js';

let mockRepository = {
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

const mockRepositoryFactory = {
  getRepository: vi.fn().mockImplementation(() => mockRepository),
} as unknown as RepositoryFactory;

import type { Mock } from 'vitest';

describe('SeedEngine', () => {
  let engine: SeedEngine;
  let mockStorageService: { resolveFileIdByName: Mock; download: Mock };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepository = {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    mockStorageService = {
      resolveFileIdByName: vi.fn(),
      download: vi.fn(),
    };

    engine = new SeedEngine(
      mockRepositoryFactory,
      mockStorageService as unknown as StorageService,
    );
  });

  describe('downloadPayload', () => {
    it('downloads and parses JSON payload', async () => {
      const mockPayload = { tables: { about: [] } };
      vi.mocked(mockStorageService.resolveFileIdByName).mockResolvedValue(
        'file-123',
      );
      vi.mocked(mockStorageService.download).mockResolvedValue(
        Buffer.from(JSON.stringify(mockPayload)),
      );

      const result = await engine.downloadPayload({
        bucketId: 'bucket-456',
        fileName: 'seed.json',
      });

      expect(mockStorageService.resolveFileIdByName).toHaveBeenCalledWith({
        bucketId: 'bucket-456',
        fileName: 'seed.json',
      });
      expect(mockStorageService.download).toHaveBeenCalledWith({
        bucketId: 'bucket-456',
        fileId: 'file-123',
      });
      expect(result).toEqual(mockPayload);
    });
  });

  describe('fetchRemoteState', () => {
    it('fetches state for multiple tables concurrently', async () => {
      vi.spyOn(engine, 'listAllRows').mockImplementation(async (tableId) => {
        return [{ id: `${tableId}-123` }];
      });

      const result = await engine.fetchRemoteState({
        tableIds: ['about', 'home'],
        pageSize: 100,
      });

      expect(engine.listAllRows).toHaveBeenCalledTimes(2);
      expect(engine.listAllRows).toHaveBeenCalledWith('about', 100);
      expect(engine.listAllRows).toHaveBeenCalledWith('home', 100);

      expect(result).toEqual({
        about: [{ id: 'about-123' }],
        home: [{ id: 'home-123' }],
      });
    });
  });

  describe('listAllRows', () => {
    it('paginates correctly until exhaustion', async () => {
      mockRepository.findMany
        .mockResolvedValueOnce([{ id: 'row1' }, { id: 'row2' }]) // page 1: full (2 items)
        .mockResolvedValueOnce([{ id: 'row3' }]); // page 2: partial (1 item, stops here)

      const result = await engine.listAllRows('about', 2);

      expect(mockRepositoryFactory.getRepository).toHaveBeenCalledWith('about');
      expect(mockRepository.findMany).toHaveBeenCalledTimes(2);

      expect(result).toEqual([{ id: 'row1' }, { id: 'row2' }, { id: 'row3' }]);
    });

    it('handles empty table', async () => {
      mockRepository.findMany.mockResolvedValueOnce([]);

      const result = await engine.listAllRows('about', 100);

      expect(mockRepository.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('executeUpsert', () => {
    it('processes create operations', async () => {
      const plan = {
        operations: [
          {
            action: 'create' as const,
            tableId: 'about',
            data: { key: 'value' },
            rowIndex: 0,
          },
        ],
      };

      const result = await engine.executeUpsert(plan);

      expect(mockRepositoryFactory.getRepository).toHaveBeenCalledWith('about');
      expect(mockRepository.create).toHaveBeenCalledWith({
        data: { key: 'value' },
      });
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(result.created).toBe(1);
    });

    it('processes update operations', async () => {
      const plan = {
        operations: [
          {
            action: 'update' as const,
            tableId: 'about',
            rowId: 'row-123',
            data: { key: 'value' },
            rowIndex: 0,
          },
        ],
      };

      const result = await engine.executeUpsert(plan);

      expect(mockRepositoryFactory.getRepository).toHaveBeenCalledWith('about');
      expect(mockRepository.update).toHaveBeenCalledWith({
        id: 'row-123',
        data: { key: 'value' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result.updated).toBe(1);
    });

    it('handles ignore operations silently', async () => {
      const plan = {
        operations: [
          {
            action: 'ignore',
            tableId: 'about',
            data: { key: 'value' },
            rowIndex: 0,
          },
        ],
      };

      // @ts-expect-error - Intentionally bypassing UpsertPlan type definition to cover fallback branch
      const result = await engine.executeUpsert(plan);

      expect(mockRepositoryFactory.getRepository).toHaveBeenCalledWith('about');
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(result.created).toBe(0);
      expect(result.updated).toBe(0);
    });

    it('throws error if update operation lacks rowId', async () => {
      const plan = {
        operations: [
          {
            action: 'update' as const,
            tableId: 'about',
            data: { key: 'value' },
            rowIndex: 0,
          },
        ],
      };

      await expect(engine.executeUpsert(plan)).rejects.toThrow(
        /Missing rowId for update operation at about#0/,
      );
    });

    it('reports progress if callback is provided', async () => {
      const plan = {
        operations: [
          {
            action: 'create' as const,
            tableId: 'about',
            data: { key: 'value' },
            rowIndex: 0,
          },
        ],
      };

      const onProgress = vi.fn();
      await engine.executeUpsert(plan, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        plan.operations[0],
        expect.objectContaining({ created: 1 }),
      );
    });
  });
});
