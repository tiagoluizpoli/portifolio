import { z } from 'zod';

const nonSeedModeSchema = z.enum(['check', 'migrate', 'template']);

const normalizedMigratorSchema = z.object({
  mode: z.string().trim().toLowerCase().default('check'),
  seedBucketId: z.string().trim().min(1).optional(),
  seedFileName: z.string().trim().min(1).optional(),
});

export const migratorGroupSchema = normalizedMigratorSchema.pipe(
  z.discriminatedUnion('mode', [
    z.object({
      mode: z.literal('seed'),
      seedBucketId: z.string().trim().min(1),
      seedFileName: z.string().trim().min(1),
    }),
    z.object({
      mode: nonSeedModeSchema,
      seedBucketId: z.string().trim().min(1).optional(),
      seedFileName: z.string().trim().min(1).optional(),
    }),
  ]),
);

export type MigratorGroup = z.infer<typeof migratorGroupSchema>;

function toIssueMessage(path: ReadonlyArray<PropertyKey>): string {
  if (path.length === 0) {
    return '<root>';
  }

  return path.map((segment) => String(segment)).join('.');
}

export function resolveMigratorGroup(): MigratorGroup {
  const parsed = migratorGroupSchema.safeParse({
    mode: process.env.MIGRATOR_MODE,
    seedBucketId: process.env.SEED_BUCKET_ID,
    seedFileName: process.env.SEED_FILE_NAME,
  });

  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => toIssueMessage(issue.path))
      .join(', ');

    throw new Error(
      `@repo/config invalid "migrator" env group. Missing or invalid fields: ${fields}`,
    );
  }

  return parsed.data;
}
