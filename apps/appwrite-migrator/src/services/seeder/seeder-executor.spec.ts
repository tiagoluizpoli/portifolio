import { describe, expect, it } from 'vitest';
import { SeederExecutor, SeedRateLimitError } from './seeder-executor';

describe('SeederExecutor', () => {
  it('executes upsert plan successfully with create/update/ignore', async () => {
    const executor = new SeederExecutor();

    const plan = {
      operations: [
        {
          tableId: 'about' as const,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
        {
          tableId: 'about' as const,
          rowIndex: 1,
          action: 'update' as const,
          rowId: 'about-1',
          data: { locale: 'en', name: 'Tiago Updated' },
        },
        {
          tableId: 'about' as const,
          rowIndex: 2,
          action: 'ignore' as const,
          rowId: 'about-2',
          data: { locale: 'pt', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 1,
        ignore: 1,
      },
    };

    const calls: string[] = [];

    const stats = await executor.executeUpsertPlan({
      plan,
      executeOperation: async (operation) => {
        calls.push(`${operation.action}:${operation.rowIndex}`);
      },
    });

    expect(stats).toEqual({
      processed: 3,
      created: 1,
      updated: 1,
      ignored: 1,
      retries: 0,
    });

    expect(calls).toEqual(['create:0', 'update:1']);
  });

  it('retries on rate limiting 429 and succeeds', async () => {
    const executor = new SeederExecutor();

    const plan = {
      operations: [
        {
          tableId: 'about' as const,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 0,
        ignore: 0,
      },
    };

    let attempts = 0;

    const stats = await executor.executeUpsertPlan({
      plan,
      maxRetries: 3,
      retryDelayMs: 0,
      executeOperation: async () => {
        attempts += 1;
        if (attempts < 3) {
          throw { code: 429 };
        }
      },
    });

    expect(attempts).toBe(3);
    expect(stats.retries).toBe(2);
    expect(stats.created).toBe(1);
    expect(stats.processed).toBe(1);
  });

  it('throws SeedRateLimitError after exhausting retries on 429', async () => {
    const executor = new SeederExecutor();

    const plan = {
      operations: [
        {
          tableId: 'about' as const,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 0,
        ignore: 0,
      },
    };

    await expect(
      executor.executeUpsertPlan({
        plan,
        maxRetries: 1,
        retryDelayMs: 0,
        executeOperation: async () => {
          throw { code: 429 };
        },
      }),
    ).rejects.toBeInstanceOf(SeedRateLimitError);
  });

  it('rethrows non-rate-limit errors without retries', async () => {
    const executor = new SeederExecutor();

    const plan = {
      operations: [
        {
          tableId: 'about' as const,
          rowIndex: 0,
          action: 'create' as const,
          data: { locale: 'en', name: 'Tiago' },
        },
      ],
      summary: {
        create: 1,
        update: 0,
        ignore: 0,
      },
    };

    const failure = new Error('boom');

    await expect(
      executor.executeUpsertPlan({
        plan,
        executeOperation: async () => {
          throw failure;
        },
      }),
    ).rejects.toThrow('boom');
  });
});
