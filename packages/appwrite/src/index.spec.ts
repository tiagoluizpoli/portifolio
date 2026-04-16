import { describe, expect, it } from 'vitest';

describe('package entrypoint', () => {
  it('loads without requiring environment variables at import time', async () => {
    await expect(import('./index')).resolves.toBeDefined();
  });
});
