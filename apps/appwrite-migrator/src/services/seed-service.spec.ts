import { RepositoryFactory, StorageService } from '@repo/appwrite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_CONFIG } from '../tests/helpers/config.mock';
import { SeedService } from '@/services/seed-service';

vi.mock('@repo/appwrite', async () => {
  const actual = await vi.importActual('@repo/appwrite');

  return {
    ...actual,
    StorageService: vi.fn(),
    RepositoryFactory: vi.fn(),
  };
});

describe('SeedService', () => {
  beforeEach(() => {
    process.env.APPWRITE_DATABASE_ID = 'test-db';
    process.env.SEED_BUCKET_ID = 'test-bucket';
    process.env.SEED_FILE_NAME = 'test-seed.json';
    vi.clearAllMocks();
  });

  it('runs seed process with valid payload', async () => {
    const mockStorageService = {
      resolveFileIdByName: vi.fn().mockResolvedValue('file-id'),
      download: vi.fn().mockResolvedValue(
        Buffer.from(
          JSON.stringify({
            tables: {
              about: {
                rows: [
                  {
                    name: 'Tiago',
                    title: 'Engineer',
                    bio: 'Building systems',
                    locale: 'en',
                  },
                ],
              },
            },
          }),
        ),
      ),
    };

    vi.mocked(StorageService).mockImplementation(
      class {
        resolveFileIdByName = mockStorageService.resolveFileIdByName;
        download = mockStorageService.download;
      } as never,
    );

    const mockRepository = {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(RepositoryFactory).mockImplementation(
      class {
        getRepository = vi.fn().mockReturnValue(mockRepository);
      } as never,
    );

    const service = new SeedService();
    await service.execute({ mode: 'seed', config: MOCK_CONFIG });

    expect(mockStorageService.resolveFileIdByName).toHaveBeenCalled();
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
