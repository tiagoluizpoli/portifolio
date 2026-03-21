/**
 * Orchestrates compensating transactions by maintaining a stack of rollback operations.
 */
export class TransactionManager {
  private undoStack: Array<() => Promise<void>> = [];

  /**
   * Registers a rollback operation to be executed if the transaction fails.
   */
  public add(rollbackFn: () => Promise<void>): void {
    this.undoStack.push(rollbackFn);
  }

  /**
   * Executes all registered rollback operations in reverse order (LIFO).
   * If a rollback fails, it logs a fatal error as per FR-015.
   */
  public async rollback(): Promise<void> {
    console.warn(
      `[TransactionManager] Initiating rollback for ${this.undoStack.length} operations...`,
    );

    // Execute rollbacks in reverse order
    while (this.undoStack.length > 0) {
      const undo = this.undoStack.pop();
      if (undo) {
        try {
          await undo();
        } catch (error) {
          // FR-015: If a rollback itself fails, log a critical/fatal error
          console.error({
            level: 'FATAL',
            timestamp: new Date().toISOString(),
            msg: 'Rollback operation failed during transaction recovery.',
            error: error instanceof Error ? error.message : String(error),
            ctx: {
              remainingSteps: this.undoStack.length,
            },
          });
        }
      }
    }
  }

  /**
   * Clears the undo stack without executing (on success).
   */
  public commit(): void {
    this.undoStack = [];
  }
}
