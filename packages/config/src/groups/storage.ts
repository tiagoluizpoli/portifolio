import { z } from 'zod';

export const storageGroupSchema = z.object({
  publicBaseUrl: z.url(),
});

export type StorageGroup = z.infer<typeof storageGroupSchema>;

function toIssueMessage(path: ReadonlyArray<PropertyKey>): string {
  if (path.length === 0) {
    return '<root>';
  }

  return path.map((segment) => String(segment)).join('.');
}

export function resolveStorageGroup(): StorageGroup {
  const parsed = storageGroupSchema.safeParse({
    publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL,
  });

  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => toIssueMessage(issue.path))
      .join(', ');

    throw new Error(
      `@repo/config invalid "storage" env group. Missing or invalid fields: ${fields}`,
    );
  }

  return parsed.data;
}
