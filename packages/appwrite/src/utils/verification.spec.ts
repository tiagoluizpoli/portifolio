import { describe, expect, it } from 'vitest';
import { VerificationUtility } from './verification';

describe('VerificationUtility', () => {
  it('returns parity match when only metadata fields differ', () => {
    const legacy = {
      id: 'doc-1',
      title: 'Portfolio',
      nested: {
        active: true,
      },
    };

    const next = {
      id: 'doc-1',
      title: 'Portfolio',
      createdAt: '2026-04-16T00:00:00.000Z',
      updatedAt: '2026-04-16T00:00:01.000Z',
      permissions: ['read("*")'],
      nested: {
        active: true,
        updatedAt: '2026-04-16T00:00:01.000Z',
      },
    };

    const result = VerificationUtility.compare(legacy, next);

    expect(result).toEqual({
      matches: true,
      differences: [],
    });
  });

  it('supports custom ignored keys', () => {
    const legacy = {
      id: 'doc-1',
      locale: 'en',
    };

    const next = {
      id: 'doc-1',
      locale: 'pt',
    };

    const result = VerificationUtility.compare(legacy, next, {
      ignoredKeys: ['locale'],
    });

    expect(result).toEqual({
      matches: true,
      differences: [],
    });
  });

  it('reports deterministic differences for missing keys and mismatched values', () => {
    const legacy = {
      id: 'doc-1',
      title: 'Old',
      tags: ['cms'],
      nested: {
        score: 10,
      },
    };

    const next = {
      id: 'doc-1',
      title: 'New',
      tags: ['cms', 'appwrite'],
      nested: {
        score: '10',
      },
      extra: true,
    };

    const result = VerificationUtility.compare(legacy, next);

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$.extra',
        legacyValue: undefined,
        nextValue: true,
        reason: 'missing-in-legacy',
      },
      {
        path: '$.nested.score',
        legacyValue: 10,
        nextValue: '10',
        reason: 'type-mismatch',
      },
      {
        path: '$.tags',
        legacyValue: 1,
        nextValue: 2,
        reason: 'array-length-mismatch',
      },
      {
        path: '$.tags[1]',
        legacyValue: undefined,
        nextValue: 'appwrite',
        reason: 'missing-in-legacy',
      },
      {
        path: '$.title',
        legacyValue: 'Old',
        nextValue: 'New',
        reason: 'value-mismatch',
      },
    ]);
  });

  it('reports missing value in next array shape', () => {
    const legacy = ['a', 'b'];
    const next = ['a'];

    const result = VerificationUtility.compare(legacy, next);

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$',
        legacyValue: 2,
        nextValue: 1,
        reason: 'array-length-mismatch',
      },
      {
        path: '$[1]',
        legacyValue: 'b',
        nextValue: undefined,
        reason: 'missing-in-next',
      },
    ]);
  });

  it('reports root type mismatch', () => {
    const result = VerificationUtility.compare({ id: 'x' }, ['x']);

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$',
        legacyValue: { id: 'x' },
        nextValue: ['x'],
        reason: 'type-mismatch',
      },
    ]);
  });

  it('compares equal-length arrays element-by-element', () => {
    const result = VerificationUtility.compare(
      {
        values: ['a', 'b'],
      },
      {
        values: ['a', 'c'],
      },
    );

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$.values[1]',
        legacyValue: 'b',
        nextValue: 'c',
        reason: 'value-mismatch',
      },
    ]);
  });

  it('reports missing key in next object', () => {
    const result = VerificationUtility.compare(
      {
        id: 'doc-1',
        nested: {
          keep: true,
          removed: 1,
        },
      },
      {
        id: 'doc-1',
        nested: {
          keep: true,
        },
      },
    );

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$.nested.removed',
        legacyValue: 1,
        nextValue: undefined,
        reason: 'missing-in-next',
      },
    ]);
  });

  it('reports nested type mismatch between array and object', () => {
    const result = VerificationUtility.compare(
      {
        id: 'doc-1',
        collection: ['a'],
      },
      {
        id: 'doc-1',
        collection: { value: 'a' },
      },
    );

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$.collection',
        legacyValue: ['a'],
        nextValue: { value: 'a' },
        reason: 'type-mismatch',
      },
    ]);
  });

  it('reports nested type mismatch between object and primitive', () => {
    const result = VerificationUtility.compare(
      {
        id: 'doc-1',
        nested: {
          value: true,
        },
      },
      {
        id: 'doc-1',
        nested: 1,
      },
    );

    expect(result.matches).toBe(false);
    expect(result.differences).toEqual([
      {
        path: '$.nested',
        legacyValue: { value: true },
        nextValue: 1,
        reason: 'type-mismatch',
      },
    ]);
  });
});
