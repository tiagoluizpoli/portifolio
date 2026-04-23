import { extractErrorMetadata } from '../errors/appwrite-errors.js';

export const INDEX_CREATION_MAX_ATTEMPTS = 5;
export const INDEX_CREATION_RETRY_DELAY_MS = 500;

export function isColumnNotAvailableError(error: unknown): boolean {
  const { message } = extractErrorMetadata(error);
  return /column not available/i.test(message ?? '');
}

export interface RetryPolicy {
  maxAttempts: number;
  retryDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
  sleep?: (milliseconds: number) => Promise<void>;
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function runWithRetry<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
): Promise<T> {
  const sleep = policy.sleep ?? defaultSleep;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!policy.shouldRetry(error) || attempt === policy.maxAttempts) {
        throw error;
      }

      await sleep(policy.retryDelayMs);
    }
  }

  /* v8 ignore next */
  throw new Error('Retry policy exhausted without result.');
}
