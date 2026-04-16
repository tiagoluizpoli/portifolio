export type OperationStatus = 'success' | 'error';

export interface OperationLogEntry {
  operation: string;
  durationMs: number;
  status: OperationStatus;
}

export class InternalLogger {
  constructor(
    private readonly emit: (entry: OperationLogEntry) => void = () => {},
    private readonly now: () => number = () => Date.now(),
  ) {}

  start(operation: string): { operation: string; startedAt: number } {
    return {
      operation,
      startedAt: this.now(),
    };
  }

  finish(
    timer: { operation: string; startedAt: number },
    status: OperationStatus,
  ) {
    this.emit({
      operation: timer.operation,
      durationMs: this.now() - timer.startedAt,
      status,
    });
  }
}
