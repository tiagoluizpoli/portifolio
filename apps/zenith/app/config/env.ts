import { type AppwriteEnv, appwriteEnvSchema } from '@repo/appwrite-core';

const rawEnv = {
  APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT || '',
  APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  APPWRITE_API_KEY:
    process.env.APPWRITE_API_KEY || import.meta.env.APPWRITE_API_KEY || '',
  APPWRITE_DATABASE_ID:
    process.env.APPWRITE_DATABASE_ID ||
    import.meta.env.APPWRITE_DATABASE_ID ||
    '',
  APPWRITE_CURATOR_TEAM_ID:
    process.env.APPWRITE_CURATOR_TEAM_ID ||
    import.meta.env.APPWRITE_CURATOR_TEAM_ID ||
    '',
};

// Skip validation during build if requested
const shouldSkip =
  process.env.SKIP_ENV_VALIDATION === 'true' ||
  import.meta.env.VITE_SKIP_ENV_VALIDATION === 'true';

export const env = shouldSkip
  ? (rawEnv as AppwriteEnv)
  : appwriteEnvSchema.parse(rawEnv);
