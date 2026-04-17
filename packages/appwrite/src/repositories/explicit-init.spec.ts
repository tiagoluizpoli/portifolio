import { describe, expect, it } from 'vitest';

describe('Repository explicit initialization', () => {
  it('throws catastrophic error when repository is constructed before initializeAppwrite', async () => {
    const { vi } = await import('vitest');
    vi.resetModules();

    const { AboutRepository } = await import('./specialized-repositories.js');

    expect(() => new AboutRepository('db')).toThrow(
      'Appwrite is not initialized. Call initializeAppwrite first.',
    );
  });
});
