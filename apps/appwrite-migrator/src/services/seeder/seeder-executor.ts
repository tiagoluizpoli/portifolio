import type {
  SeedExecutionInput,
  SeedExecutionStats,
  SeedUpsertOperation,
} from '@/services/seeder';

export class SeedRateLimitError extends Error {
  readonly operation: SeedUpsertOperation;
  readonly attempts: number;

  constructor(input: { operation: SeedUpsertOperation; attempts: number }) {
    super(
      `Seed execution failed due to repeated rate limiting after ${input.attempts} attempt(s).`,
    );
    this.name = 'SeedRateLimitError';
    this.operation = input.operation;
    this.attempts = input.attempts;
  }
}

function isRateLimitError(error: unknown): boolean {
  const candidate = error as { code?: unknown; status?: unknown };
  return candidate.code === 429 || candidate.status === 429;
}

async function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class SeederExecutor {
  async executeUpsertPlan(
    input: SeedExecutionInput,
  ): Promise<SeedExecutionStats> {
    const maxRetries = input.maxRetries ?? 2;
    const retryDelayMs = input.retryDelayMs ?? 0;

    const stats: SeedExecutionStats = {
      processed: 0,
      created: 0,
      updated: 0,
      ignored: 0,
      retries: 0,
    };

    for (const operation of input.plan.operations) {
      if (operation.action === 'ignore') {
        stats.ignored += 1;
        stats.processed += 1;
        continue;
      }

      let attempts = 0;

      while (true) {
        attempts += 1;

        try {
          await input.executeOperation(operation);

          if (operation.action === 'create') {
            stats.created += 1;
          }

          if (operation.action === 'update') {
            stats.updated += 1;
          }

          stats.processed += 1;
          break;
        } catch (error) {
          const canRetry = isRateLimitError(error) && attempts <= maxRetries;

          if (!canRetry) {
            if (isRateLimitError(error)) {
              throw new SeedRateLimitError({
                operation,
                attempts,
              });
            }

            throw error;
          }

          stats.retries += 1;
          await delay(retryDelayMs);
        }
      }
    }

    return stats;
  }
}
