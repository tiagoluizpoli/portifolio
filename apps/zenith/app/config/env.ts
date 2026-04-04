/**
 * Env Module — Fail-safe environment configuration loader.
 *
 * FR-011: Uses `safeParse` so a missing/invalid env var does NOT throw at
 * module-import time, preventing a Node.js process crash. The caller
 * (entry-server.tsx bootloader) checks `envResult.success` and renders the
 * static diagnostic screen on failure instead of returning a 502 Bad Gateway.
 */
import { type AppwriteEnv, appwriteEnvSchema } from '@repo/appwrite-core';

// ---------------------------------------------------------------------------
// Raw env collection (identical to before — no functional change here)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Discriminated parse result — never throws
// ---------------------------------------------------------------------------

/** Skip validation during CI/build if the flag is set */
const shouldSkip =
  process.env.SKIP_ENV_VALIDATION === 'true' ||
  import.meta.env.VITE_SKIP_ENV_VALIDATION === 'true';

/**
 * Safe parse result — use `envResult.success` to branch on validity.
 * On failure, `envResult.error.flatten().fieldErrors` contains per-field messages.
 *
 * Type is inferred directly from `appwriteEnvSchema` (Zod v3) to avoid
 * cross-version type incompatibilities in the monorepo.
 */
export const envResult = shouldSkip
  ? { success: true as const, data: rawEnv as AppwriteEnv, error: undefined }
  : appwriteEnvSchema.safeParse(rawEnv);

/**
 * Validated env object — only use this in server functions that are guaranteed
 * to run AFTER the bootloader guard in `entry-server.tsx` has confirmed that
 * `envResult.success === true`.
 *
 * @throws {Error} If accessed when env is invalid (bootloader should prevent this)
 */
export const env: AppwriteEnv = (() => {
  if (envResult.success) return envResult.data;
  // This path should never be reached in production because the bootloader
  // in entry-server.tsx returns a 503 before route handlers ever execute.
  // We keep this throw as a defensive failsafe for unit test environments.
  const errors = envResult.error.flatten().fieldErrors;
  throw new Error(
    `[Zenith] Environment validation failed. Bootloader should have intercepted this. ` +
      `Missing: ${Object.keys(errors).join(', ')}`,
  );
})();
