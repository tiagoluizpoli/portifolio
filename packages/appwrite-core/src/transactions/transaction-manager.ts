/**
 * TransactionManager — FR-015: Centralized LIFO compensating transaction orchestrator.
 *
 * Ensures that multi-step AppWrite mutations are wrapped in a compensation stack.
 * If any step throws, all previously executed steps are rolled back in reverse order
 * (Last-In-First-Out), maintaining data integrity across the service boundary.
 *
 * Architecture: Runs exclusively server-side inside `createServerFn` handlers.
 * Client code NEVER has visibility into rollback logic.
 *
 * @example
 * ```ts
 * import { getTransactionManager } from '@repo/appwrite-core';
 *
 * const tm = getTransactionManager();
 * await tm.execute(async (tx) => {
 *   const item = await portfolioService.createItem(payload);
 *   tx.push({ id: 'step1', rollback: () => portfolioService.deleteItem(item.$id) });
 *
 *   const config = await updateSystemConfig(item.$id);
 *   tx.push({ id: 'step2', rollback: () => revertConfig(config) });
 * });
 * ```
 */

// ---------------------------------------------------------------------------
// Interfaces (data-model.md contract)
// ---------------------------------------------------------------------------

export type CompensatingActionStatus = 'PENDING' | 'EXECUTED' | 'FAILED';

export interface CompensatingAction {
  /** Unique identifier for this compensation step (used for debug logging). */
  id: string;
  /** Rollback function — must be idempotent where possible. */
  rollback: () => Promise<void>;
  // NOTE: `status` is intentionally omitted from the public interface.
  // It is an internal lifecycle field managed exclusively by TransactionManager.
  // Allowing callers to set it would corrupt the LIFO rollback skip-guard.
}

export interface ITransactionManager {
  /**
   * Register a compensating action. Call this immediately after each successful
   * step so the rollback is registered before attempting the next step.
   */
  push: (action: CompensatingAction) => void;

  /**
   * High-level orchestrator: runs `task`, automatically rolling back on failure.
   * This is the primary API surface — prefer `execute()` over managing
   * `push/commit/rollback` manually.
   *
   * @throws Re-throws the original error after completing rollback.
   */
  execute: <T>(task: (tx: ITransactionManager) => Promise<T>) => Promise<T>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class TransactionManager implements ITransactionManager {
  private readonly stack: Array<
    CompensatingAction & { status: CompensatingActionStatus }
  > = [];

  push(action: CompensatingAction): void {
    this.stack.push({ ...action, status: 'PENDING' });
  }

  async commit(): Promise<void> {
    for (const action of this.stack) {
      action.status = 'EXECUTED';
    }
    this.stack.length = 0;
  }

  async rollback(): Promise<void> {
    // LIFO: iterate from the end of the stack
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const action = this.stack[i];
      if (action.status === 'EXECUTED') continue; // already committed — skip
      try {
        await action.rollback();
        action.status = 'EXECUTED';
      } catch (rollbackError) {
        action.status = 'FAILED';
        // Log but do NOT re-throw — we must attempt all rollbacks
        console.error(
          `[TransactionManager] Rollback step "${action.id}" failed:`,
          rollbackError,
        );
      }
    }
    this.stack.length = 0;
  }

  async execute<T>(task: (tx: ITransactionManager) => Promise<T>): Promise<T> {
    try {
      const result = await task(this);
      await this.commit();
      return result;
    } catch (error) {
      console.error(
        '[TransactionManager] Task failed — initiating LIFO rollback.',
        error,
      );
      await this.rollback();
      throw error;
    }
  }
}

// ---------------------------------------------------------------------------
// Factory — create a fresh, request-scoped manager per invocation
// ---------------------------------------------------------------------------

/**
 * Factory function: returns a new `TransactionManager` instance.
 *
 * Call this at the top of each `createServerFn` handler — do NOT share a
 * manager across requests, as its internal stack is not request-isolated.
 */
export function getTransactionManager(): ITransactionManager {
  return new TransactionManager();
}
