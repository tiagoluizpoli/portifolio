import type { AppwriteGroup, MigratorGroup } from '@repo/config';

export const MOCK_APPWRITE_CONFIG: AppwriteGroup = {
  endpoint: 'https://test.appwrite.io/v1',
  projectId: 'test-project',
  apiKey: 'test-api-key',
  databaseId: 'test-db',
  curatorTeamId: 'test-team',
};

export const MOCK_MIGRATOR_CONFIG: MigratorGroup = {
  mode: 'check',
  seedBucketId: 'test-bucket',
  seedFileName: 'test-seed.json',
};

export const MOCK_CONFIG = {
  appwrite: MOCK_APPWRITE_CONFIG,
  migrator: MOCK_MIGRATOR_CONFIG,
};
