import { initializeAppwrite } from '@repo/appwrite';
import type { AppwriteEnv } from '@repo/appwrite-core';
import { getEnv } from '@repo/config';

let bootstrappedEnv: AppwriteEnv | null = null;

export function bootstrapAppwriteRuntime(): AppwriteEnv {
  if (bootstrappedEnv) {
    return bootstrappedEnv;
  }

  const { appwrite } = getEnv({ appwrite: true });

  initializeAppwrite({
    endpoint: appwrite.endpoint,
    projectId: appwrite.projectId,
    apiKey: appwrite.apiKey,
  });

  bootstrappedEnv = {
    APPWRITE_ENDPOINT: appwrite.endpoint,
    APPWRITE_ENDPOINT_PUBLIC: appwrite.endpointPublic ?? appwrite.endpoint,
    APPWRITE_PROJECT_ID: appwrite.projectId,
    APPWRITE_API_KEY: appwrite.apiKey,
    APPWRITE_DATABASE_ID: appwrite.databaseId,
    APPWRITE_CURATOR_TEAM_ID: appwrite.curatorTeamId,
  };

  return bootstrappedEnv;
}
