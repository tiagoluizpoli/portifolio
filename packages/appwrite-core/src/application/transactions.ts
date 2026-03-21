/**
 * Utility for implementing compensating transactions (manual rollbacks).
 * As per FR-015, multi-step operations must undo previous steps upon failure.
 */
export async function withCompensatingTransaction<T>(
  steps: {
    execute: () => Promise<T>;
    rollback: (result: T) => Promise<void>;
  }[],
): Promise<T[]> {
  const completed: {
    result: T;
    rollback: (result: T) => Promise<void>;
  }[] = [];

  try {
    for (const step of steps) {
      const result = await step.execute();
      completed.push({ result, rollback: step.rollback });
    }
    return completed.map((c) => c.result);
  } catch (error) {
    console.error('Transaction failed. Rolling back...', error);
    // Rollback in reverse order
    for (let i = completed.length - 1; i >= 0; i--) {
      try {
        await completed[i].rollback(completed[i].result);
      } catch (rollbackError) {
        console.error('Rollback step failed!', rollbackError);
      }
    }
    throw error;
  }
}
