import { MigrationService } from '@repo/appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_CONFIG } from '../tests/helpers/config.mock';
import { MigrateService } from '@/services/migrate-service';

vi.mock('@repo/appwrite');

describe('MigrateService', () => {
  beforeEach(() => {
    process.env.APPWRITE_DATABASE_ID = 'test-db';
    vi.clearAllMocks();
  });

  it('runs migrate and logs results', async () => {
    const mockResult = {
      createdTables: ['table1'],
      createdColumns: [{ tableId: 'table1', columnKey: 'col1' }],
      createdIndexes: [],
    };

    const mockMigrationService = {
      migrate: vi.fn().mockResolvedValue(mockResult),
    };

    vi.mocked(MigrationService).mockImplementation(
      class {
        migrate = mockMigrationService.migrate;
      } as never,
    );

    const service = new MigrateService();
    await service.execute({ mode: 'migrate', config: MOCK_CONFIG });

    expect(mockMigrationService.migrate).toHaveBeenCalled();
  });
});
