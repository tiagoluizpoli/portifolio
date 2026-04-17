import type { z } from 'zod';
import { appwriteGroupSchema, resolveAppwriteGroup } from './appwrite.js';
import { databaseGroupSchema, resolveDatabaseGroup } from './database.js';
import { resolveStorageGroup, storageGroupSchema } from './storage.js';

export const groupSchemas = {
  appwrite: appwriteGroupSchema,
  database: databaseGroupSchema,
  storage: storageGroupSchema,
} as const;

export type EnvGroupKey = keyof typeof groupSchemas;

export type EnvGroupMap = {
  [K in EnvGroupKey]: z.infer<(typeof groupSchemas)[K]>;
};

export type EnvGroupResolverMap = {
  [K in EnvGroupKey]: () => EnvGroupMap[K];
};

export const groupResolvers: EnvGroupResolverMap = {
  appwrite: resolveAppwriteGroup,
  database: resolveDatabaseGroup,
  storage: resolveStorageGroup,
};
