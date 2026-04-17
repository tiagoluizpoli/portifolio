import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getEnv, type EnvGroupFlags } from '../src/index.js';

const ORIGINAL_ENV = process.env;

function seedValidEnv() {
  process.env.APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
  process.env.APPWRITE_ENDPOINT_PUBLIC = 'https://cdn.appwrite.io/v1';
  process.env.APPWRITE_PROJECT_ID = 'project_1';
  process.env.APPWRITE_API_KEY = 'api_key_1';
  process.env.APPWRITE_DATABASE_ID = 'database_1';
  process.env.APPWRITE_CURATOR_TEAM_ID = 'curator_team_1';
  process.env.APPWRITE_BUCKET_PICTURES_ID = 'bucket_pictures_1';
  process.env.APPWRITE_BUCKET_PDFS_ID = 'bucket_pdfs_1';

  process.env.DATABASE_URL = 'https://database.internal';
  process.env.STORAGE_PUBLIC_BASE_URL = 'https://cdn.example.com';
}

describe('getEnv', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    seedValidEnv();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('Class 1 - Happy Path', () => {
    it('returns only requested groups with validated values', () => {
      const result = getEnv({ appwrite: true, database: true });

      expect(result).toEqual({
        appwrite: {
          endpoint: 'https://cloud.appwrite.io/v1',
          endpointPublic: 'https://cdn.appwrite.io/v1',
          projectId: 'project_1',
          apiKey: 'api_key_1',
          databaseId: 'database_1',
          curatorTeamId: 'curator_team_1',
          bucketPicturesId: 'bucket_pictures_1',
          bucketPdfsId: 'bucket_pdfs_1',
        },
        database: {
          url: 'https://database.internal',
        },
      });
      expect('storage' in result).toBe(false);
    });
  });

  describe('Class 3 - Invalid Input', () => {
    it('rejects unknown env group flags at runtime', () => {
      expect(() => {
        getEnv({ unknown: true } as unknown as EnvGroupFlags);
      }).toThrow('@repo/config invalid env group flag: "unknown"');
    });
  });

  describe('Class 8 - Catastrophic Failures', () => {
    it('fails fast for invalid requested groups without returning partial output', () => {
      delete process.env.APPWRITE_PROJECT_ID;

      let result: unknown;
      let capturedError: Error | undefined;

      try {
        result = getEnv({ appwrite: true, database: true });
      } catch (error) {
        capturedError = error as Error;
      }

      expect(result).toBeUndefined();
      expect(capturedError).toBeDefined();
      expect(capturedError?.message).toContain(
        '@repo/config invalid "appwrite" env group',
      );
    });
  });
});

describe('config -> appwrite integration', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    seedValidEnv();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('uses typed appwrite group output to initialize Appwrite clients', async () => {
    const appwriteModule = await import('@repo/appwrite');
    const { appwrite } = getEnv({ appwrite: true });

    expect(() => new appwriteModule.AuthService()).toThrow(
      'Appwrite is not initialized. Call initializeAppwrite first.',
    );

    appwriteModule.initializeAppwrite({
      endpoint: appwrite.endpoint,
      projectId: appwrite.projectId,
      apiKey: appwrite.apiKey,
    });

    expect(() => new appwriteModule.AuthService()).not.toThrow();
  });
});
