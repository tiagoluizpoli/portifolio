import { z } from 'zod';

export const appwriteGroupSchema = z.object({
  endpoint: z.url(),
  endpointPublic: z.url().optional(),
  projectId: z.string().min(1),
  apiKey: z.string().min(1),
  databaseId: z.string().min(1),
  curatorTeamId: z.string().min(1),
  bucketPicturesId: z.string().min(1).optional(),
  bucketPdfsId: z.string().min(1).optional(),
});

export type AppwriteGroup = z.infer<typeof appwriteGroupSchema>;

function toIssueMessage(path: ReadonlyArray<PropertyKey>): string {
  if (path.length === 0) {
    return '<root>';
  }

  return path.map((segment) => String(segment)).join('.');
}

export function resolveAppwriteGroup(): AppwriteGroup {
  const parsed = appwriteGroupSchema.safeParse({
    endpoint: process.env.APPWRITE_ENDPOINT,
    endpointPublic: process.env.APPWRITE_ENDPOINT_PUBLIC,
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    curatorTeamId: process.env.APPWRITE_CURATOR_TEAM_ID,
    bucketPicturesId: process.env.APPWRITE_BUCKET_PICTURES_ID,
    bucketPdfsId: process.env.APPWRITE_BUCKET_PDFS_ID,
  });

  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => toIssueMessage(issue.path))
      .join(', ');

    throw new Error(
      `@repo/config invalid "appwrite" env group. Missing or invalid fields: ${fields}`,
    );
  }

  return parsed.data;
}
