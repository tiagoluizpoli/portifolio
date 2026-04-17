import { initializeAppwrite } from '@repo/appwrite';
import type { AppwriteEnv } from '@repo/appwrite-core';
import { AppwriteProvider } from '@repo/appwrite-core/server';
import { getEnv } from '@repo/config';

export function bootstrapAppwriteRuntime() {
  const env = getEnv({ appwrite: true });

  initializeAppwrite({
    endpoint: env.appwrite.endpoint,
    projectId: env.appwrite.projectId,
    apiKey: env.appwrite.apiKey,
  });

  const legacyConfig: AppwriteEnv = {
    APPWRITE_ENDPOINT: env.appwrite.endpoint,
    APPWRITE_ENDPOINT_PUBLIC:
      env.appwrite.endpointPublic ?? env.appwrite.endpoint,
    APPWRITE_PROJECT_ID: env.appwrite.projectId,
    APPWRITE_API_KEY: env.appwrite.apiKey,
    APPWRITE_DATABASE_ID: env.appwrite.databaseId,
    APPWRITE_CURATOR_TEAM_ID: env.appwrite.curatorTeamId,
  };

  AppwriteProvider.initialize(legacyConfig);

  return {
    appwrite: env.appwrite,
  };
}
