import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getEnv, type EnvGroupFlags } from '../src/index.js';

const ORIGINAL_ENV = process.env;
const ORIGINAL_CWD = process.cwd();

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
  process.env.MIGRATOR_MODE = 'check';
}

describe('getEnv', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.chdir(ORIGINAL_CWD);
    seedValidEnv();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    process.chdir(ORIGINAL_CWD);
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

    it('returns migrator group values from centralized config', () => {
      process.env.SEED_BUCKET_ID = 'seed_bucket';
      process.env.SEED_FILE_NAME = 'seed_file.json';

      const result = getEnv({ migrator: true });

      expect(result).toEqual({
        migrator: {
          mode: 'check',
          seedBucketId: 'seed_bucket',
          seedFileName: 'seed_file.json',
        },
      });
    });

    it('normalizes migrator mode casing and surrounding whitespace', () => {
      process.env.MIGRATOR_MODE = '  TeMPlAte  ';
      process.env.SEED_BUCKET_ID = 'bucket';
      process.env.SEED_FILE_NAME = 'file.json';

      const result = getEnv({ migrator: true });

      expect(result.migrator.mode).toBe('template');
    });

    it('loads values from default .env file when they are missing in process.env', () => {
      delete process.env.DATABASE_URL;

      const folder = mkdtempSync(join(tmpdir(), 'config-default-env-'));
      const envFilePath = join(folder, '.env');

      try {
        writeFileSync(envFilePath, 'DATABASE_URL=https://from-default-file.test\n');
        process.chdir(folder);

        const result = getEnv({ database: true });

        expect(result.database.url).toBe('https://from-default-file.test');
      } finally {
        process.chdir(ORIGINAL_CWD);
        rmSync(folder, { recursive: true, force: true });
      }
    });

    it('loads values from a custom env file path when provided', () => {
      delete process.env.MIGRATOR_MODE;
      delete process.env.SEED_BUCKET_ID;
      delete process.env.SEED_FILE_NAME;

      const folder = mkdtempSync(join(tmpdir(), 'config-custom-env-'));
      const envFilePath = join(folder, 'runtime.env');

      try {
        writeFileSync(
          envFilePath,
          [
            'MIGRATOR_MODE=seed',
            'SEED_BUCKET_ID=custom_seed_bucket',
            'SEED_FILE_NAME=custom-seed-file.json',
            '',
          ].join('\n'),
        );

        const result = getEnv(
          { migrator: true },
          {
            envFilePath,
          },
        );

        expect(result.migrator).toEqual({
          mode: 'seed',
          seedBucketId: 'custom_seed_bucket',
          seedFileName: 'custom-seed-file.json',
        });
      } finally {
        rmSync(folder, { recursive: true, force: true });
      }
    });

    it('fails when an explicit custom env file path does not exist', () => {
      const missingPath = join(tmpdir(), 'config-does-not-exist.env');

      expect(() =>
        getEnv(
          { appwrite: true },
          {
            envFilePath: missingPath,
          },
        ),
      ).toThrow('@repo/config could not load custom env file');
    });
  });

  describe('Class 3 - Invalid Input', () => {
    it('rejects unknown env group flags at runtime', () => {
      expect(() => {
        getEnv(
          { unknown: true } as unknown as EnvGroupFlags,
          {
            skipEnvFileLoad: true,
          },
        );
      }).toThrow('@repo/config invalid env group flag: "unknown"');
    });
  });

  describe('Class 8 - Catastrophic Failures', () => {
    it('fails fast for invalid requested groups without returning partial output', () => {
      delete process.env.APPWRITE_PROJECT_ID;

      let result: unknown;
      let capturedError: Error | undefined;

      try {
        result = getEnv(
          { appwrite: true, database: true },
          {
            skipEnvFileLoad: true,
          },
        );
      } catch (error) {
        capturedError = error as Error;
      }

      expect(result).toBeUndefined();
      expect(capturedError).toBeDefined();
      expect(capturedError?.message).toContain(
        '@repo/config invalid "appwrite" env group',
      );
    });

    it('defaults migrator mode to check when missing', () => {
      delete process.env.MIGRATOR_MODE;

      const result = getEnv(
        { migrator: true },
        {
          skipEnvFileLoad: true,
        },
      );
      
      expect(result.migrator.mode).toBe('check');
    });

    it('fails for unsupported migrator mode values', () => {
      process.env.MIGRATOR_MODE = 'audit';

      expect(() => {
        getEnv(
          { migrator: true },
          {
            skipEnvFileLoad: true,
          },
        );
      }).toThrow('@repo/config invalid "migrator" env group');
    });

    it('fails when seed mode is missing seed source environment variables', () => {
      process.env.MIGRATOR_MODE = 'seed';
      delete process.env.SEED_BUCKET_ID;
      delete process.env.SEED_FILE_NAME;

      expect(() => {
        getEnv(
          { migrator: true },
          {
            skipEnvFileLoad: true,
          },
        );
      }).toThrow('@repo/config invalid "migrator" env group');
    });
  });
});

describe('config -> appwrite integration', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.chdir(ORIGINAL_CWD);
    seedValidEnv();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    process.chdir(ORIGINAL_CWD);
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
