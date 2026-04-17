import { z } from 'zod';

export const databaseGroupSchema = z.object({
  url: z.url(),
});

export type DatabaseGroup = z.infer<typeof databaseGroupSchema>;

function toIssueMessage(path: ReadonlyArray<PropertyKey>): string {
  if (path.length === 0) {
    return '<root>';
  }

  return path.map((segment) => String(segment)).join('.');
}

export function resolveDatabaseGroup(): DatabaseGroup {
  const parsed = databaseGroupSchema.safeParse({
    url: process.env.DATABASE_URL,
  });

  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => toIssueMessage(issue.path))
      .join(', ');

    throw new Error(
      `@repo/config invalid "database" env group. Missing or invalid fields: ${fields}`,
    );
  }

  return parsed.data;
}
