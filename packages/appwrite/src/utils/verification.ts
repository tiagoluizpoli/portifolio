const DEFAULT_IGNORED_KEYS = ['createdAt', 'updatedAt', 'permissions'] as const;

export interface VerificationDifference {
  path: string;
  legacyValue: unknown;
  nextValue: unknown;
  reason:
    | 'type-mismatch'
    | 'value-mismatch'
    | 'missing-in-legacy'
    | 'missing-in-next'
    | 'array-length-mismatch';
}

export interface VerificationResult {
  matches: boolean;
  differences: VerificationDifference[];
}

export interface VerificationOptions {
  ignoredKeys?: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeValue(
  value: unknown,
  ignoredKeys: ReadonlySet<string>,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item, ignoredKeys));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const normalizedEntries = Object.entries(value)
    .filter(([key]) => !ignoredKeys.has(key))
    .map(
      ([key, nestedValue]) =>
        [key, normalizeValue(nestedValue, ignoredKeys)] as const,
    )
    .sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(normalizedEntries);
}

function deepCompare(
  legacy: unknown,
  next: unknown,
  path: string,
  output: VerificationDifference[],
) {
  if (Array.isArray(legacy) || Array.isArray(next)) {
    if (!Array.isArray(legacy) || !Array.isArray(next)) {
      output.push({
        path,
        legacyValue: legacy,
        nextValue: next,
        reason: 'type-mismatch',
      });
      return;
    }

    if (legacy.length !== next.length) {
      output.push({
        path,
        legacyValue: legacy.length,
        nextValue: next.length,
        reason: 'array-length-mismatch',
      });
    }

    const length = Math.max(legacy.length, next.length);
    for (let index = 0; index < length; index += 1) {
      const childPath = `${path}[${index}]`;
      const hasLegacy = index in legacy;
      const hasNext = index in next;

      if (!hasLegacy && hasNext) {
        output.push({
          path: childPath,
          legacyValue: undefined,
          nextValue: next[index],
          reason: 'missing-in-legacy',
        });
        continue;
      }

      if (hasLegacy && !hasNext) {
        output.push({
          path: childPath,
          legacyValue: legacy[index],
          nextValue: undefined,
          reason: 'missing-in-next',
        });
        continue;
      }

      deepCompare(legacy[index], next[index], childPath, output);
    }

    return;
  }

  if (isPlainObject(legacy) || isPlainObject(next)) {
    if (!isPlainObject(legacy) || !isPlainObject(next)) {
      output.push({
        path,
        legacyValue: legacy,
        nextValue: next,
        reason: 'type-mismatch',
      });
      return;
    }

    const allKeys = Array.from(
      new Set([...Object.keys(legacy), ...Object.keys(next)]),
    ).sort((a, b) => a.localeCompare(b));

    for (const key of allKeys) {
      const childPath = path === '$' ? `$.${key}` : `${path}.${key}`;
      const hasLegacy = key in legacy;
      const hasNext = key in next;

      if (!hasLegacy && hasNext) {
        output.push({
          path: childPath,
          legacyValue: undefined,
          nextValue: next[key],
          reason: 'missing-in-legacy',
        });
        continue;
      }

      if (hasLegacy && !hasNext) {
        output.push({
          path: childPath,
          legacyValue: legacy[key],
          nextValue: undefined,
          reason: 'missing-in-next',
        });
        continue;
      }

      deepCompare(legacy[key], next[key], childPath, output);
    }

    return;
  }

  if (typeof legacy !== typeof next) {
    output.push({
      path,
      legacyValue: legacy,
      nextValue: next,
      reason: 'type-mismatch',
    });
    return;
  }

  if (!Object.is(legacy, next)) {
    output.push({
      path,
      legacyValue: legacy,
      nextValue: next,
      reason: 'value-mismatch',
    });
  }
}

export const VerificationUtility = {
  compare(
    legacyShape: unknown,
    nextShape: unknown,
    options: VerificationOptions = {},
  ): VerificationResult {
    const ignoredKeys = new Set([
      ...DEFAULT_IGNORED_KEYS,
      ...(options.ignoredKeys ?? []),
    ]);

    const normalizedLegacy = normalizeValue(legacyShape, ignoredKeys);
    const normalizedNext = normalizeValue(nextShape, ignoredKeys);

    const differences: VerificationDifference[] = [];
    deepCompare(normalizedLegacy, normalizedNext, '$', differences);

    return {
      matches: differences.length === 0,
      differences,
    };
  },
};
