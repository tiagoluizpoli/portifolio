import { z } from 'zod';

export const appwriteEnvSchema = z.object({
  APPWRITE_ENDPOINT: z.string().url('APPWRITE_ENDPOINT must be a valid URL'),
  APPWRITE_ENDPOINT_PUBLIC: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url('APPWRITE_ENDPOINT_PUBLIC must be a valid URL').optional(),
  ),
  APPWRITE_PROJECT_ID: z.string().min(1, 'APPWRITE_PROJECT_ID is required'),
  APPWRITE_API_KEY: z.string().min(1, 'APPWRITE_API_KEY is required'),
  APPWRITE_DATABASE_ID: z.string().min(1, 'APPWRITE_DATABASE_ID is required'),
  APPWRITE_CURATOR_TEAM_ID: z
    .string()
    .min(1, 'APPWRITE_CURATOR_TEAM_ID is required for private write-access'),
});

export type AppwriteEnv = z.infer<typeof appwriteEnvSchema>;

export function validateAppwriteEnv(
  env: Record<string, string | undefined>,
): AppwriteEnv {
  const result = appwriteEnvSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missingVars = Object.keys(errors).join(', ');
    throw new Error(
      `Invalid Appwrite environment variables: ${missingVars}. Issues: ${JSON.stringify(errors)}`,
    );
  }

  return result.data;
}
