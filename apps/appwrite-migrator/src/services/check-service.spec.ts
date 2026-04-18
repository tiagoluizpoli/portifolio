import { MigrationService } from '@repo/appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_CONFIG } from '../tests/helpers/config.mock';
import { PendingStructuralChangesError } from '@/core/errors';
import { CheckService } from '@/services/check-service';

vi.mock('@repo/appwrite');

describe('CheckService', () => {
  beforeEach(() => {
    process.env.APPWRITE_DATABASE_ID = 'test-db';
    vi.clearAllMocks();
  });

  it('passes when structural delta is empty', async () => {
    const mockDelta = { missingTables: [], missingColumns: [] };

    vi.mocked(MigrationService).mockImplementation(
      class {
        calculateStructuralDelta = vi.fn().mockResolvedValue(mockDelta);
      } as never,
    );

    const service = new CheckService();
    await expect(
      service.execute({ mode: 'check', config: MOCK_CONFIG }),
    ).resolves.toBeUndefined();
  });

  it('throws PendingStructuralChangesError when delta has missing tables', async () => {
    const mockDelta = {
      missingTables: [{ id: 'table1' } as unknown as Record<string, unknown>],
      missingColumns: [],
    };

    vi.mocked(MigrationService).mockImplementation(
      class {
        calculateStructuralDelta = vi.fn().mockResolvedValue(mockDelta);
      } as never,
    );

    const service = new CheckService();
    await expect(
      service.execute({ mode: 'check', config: MOCK_CONFIG }),
    ).rejects.toBeInstanceOf(PendingStructuralChangesError);
  });
});
