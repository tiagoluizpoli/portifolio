import { describe, expect, it, vi } from 'vitest';
import { validateAppwriteEnv } from './env.validator';

describe('validateAppwriteEnv', () => {
  it('should validate correctly formatted environment variables', () => {
    const env = {
      APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1',
      APPWRITE_PROJECT_ID: 'project-id',
      APPWRITE_API_KEY: 'api-key',
      APPWRITE_DATABASE_ID: 'db-id',
      APPWRITE_CURATOR_TEAM_ID: 'curators',
    };

    const result = validateAppwriteEnv(env);
    expect(result).toEqual(env);
  });

  it('should throw error for missing variables', () => {
    const env = {
      APPWRITE_ENDPOINT: 'https://cloud.appwrite.io/v1',
    };

    expect(() => validateAppwriteEnv(env)).toThrow(
      /Invalid Appwrite environment variables/,
    );
  });

  it('should validate complete environment', () => {
    vi.stubEnv('APPWRITE_ENDPOINT', 'https://localhost');
    vi.stubEnv('APPWRITE_PROJECT_ID', 'test');
    vi.stubEnv('APPWRITE_API_KEY', 'test');
    vi.stubEnv('APPWRITE_DATABASE_ID', 'test');
    vi.stubEnv('APPWRITE_CURATOR_TEAM_ID', 'test');

    expect(() => validateAppwriteEnv(process.env)).not.toThrow();
  });

  it('should throw error for invalid URL', () => {
    const env = {
      APPWRITE_ENDPOINT: 'not-a-url',
      APPWRITE_PROJECT_ID: 'project-id',
      APPWRITE_API_KEY: 'api-key',
      APPWRITE_DATABASE_ID: 'db-id',
      APPWRITE_CURATOR_TEAM_ID: 'curators',
    };

    expect(() => validateAppwriteEnv(env)).toThrow(
      /APPWRITE_ENDPOINT must be a valid URL/,
    );
  });
});
