import { describe, expect, it, vi } from 'vitest';
import { InternalLogger } from './logger';

describe('InternalLogger', () => {
  it('logs duration and status', () => {
    const emit = vi.fn();
    const now = vi
      .fn<() => number>()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(145);
    const logger = new InternalLogger(emit, now);

    const timer = logger.start('test.op');
    logger.finish(timer, 'success');

    expect(emit).toHaveBeenCalledWith({
      operation: 'test.op',
      durationMs: 45,
      status: 'success',
    });
  });
});
