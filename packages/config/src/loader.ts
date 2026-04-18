import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import {
  type EnvGroupKey,
  type EnvGroupMap,
  groupResolvers,
  groupSchemas,
} from './groups/index.js';

export type EnvGroupFlags = {
  [K in EnvGroupKey]?: true;
};

export type EnvGroupResult<TFlags extends EnvGroupFlags> = {
  [K in keyof TFlags as TFlags[K] extends true
    ? K
    : never]: K extends EnvGroupKey ? EnvGroupMap[K] : never;
};

export interface EnvLoadOptions {
  envFilePath?: string;
  skipEnvFileLoad?: boolean;
}

let lastDefaultEnvFilePath: string | null = null;

function isEnvGroupKey(value: string): value is EnvGroupKey {
  return value in groupSchemas;
}

export function getEnv<TFlags extends EnvGroupFlags>(
  flags: TFlags,
  options?: EnvLoadOptions,
): EnvGroupResult<TFlags> {
  maybeLoadEnvFile(options);

  const requestedEntries = Object.entries(flags ?? {});

  for (const [key] of requestedEntries) {
    if (!isEnvGroupKey(key)) {
      throw new Error(`@repo/config invalid env group flag: "${key}"`);
    }
  }

  const requestedKeys = requestedEntries
    .filter(([, value]) => value === true)
    .map(([key]) => key as EnvGroupKey);

  const output: Partial<EnvGroupMap> = {};

  for (const group of requestedKeys) {
    (output as Record<EnvGroupKey, EnvGroupMap[EnvGroupKey]>)[group] =
      groupResolvers[group]();
  }

  return output as EnvGroupResult<TFlags>;
}

function maybeLoadEnvFile(options?: EnvLoadOptions): void {
  if (options?.skipEnvFileLoad) {
    return;
  }

  const hasCustomEnvFile = typeof options?.envFilePath === 'string';
  const defaultEnvFilePath = resolve(process.cwd(), '.env');

  if (!hasCustomEnvFile && lastDefaultEnvFilePath === defaultEnvFilePath) {
    return;
  }

  const envFilePath = options?.envFilePath ?? defaultEnvFilePath;

  if (!hasCustomEnvFile) {
    lastDefaultEnvFilePath = defaultEnvFilePath;
  }

  if (!existsSync(envFilePath)) {
    if (hasCustomEnvFile) {
      throw new Error(
        `@repo/config could not load custom env file: "${envFilePath}"`,
      );
    }

    return;
  }

  try {
    const parsed = parseEnv(readFileSync(envFilePath, 'utf8'));

    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unknown load error';

    throw new Error(
      `@repo/config failed to load env file "${envFilePath}": ${message}`,
    );
  }
}
