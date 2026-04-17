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

function isEnvGroupKey(value: string): value is EnvGroupKey {
  return value in groupSchemas;
}

export function getEnv<TFlags extends EnvGroupFlags>(
  flags: TFlags,
): EnvGroupResult<TFlags> {
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
