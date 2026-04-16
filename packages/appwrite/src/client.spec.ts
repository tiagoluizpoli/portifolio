import { describe, expect, it } from 'vitest';
import {
  getAccountClient,
  getStorageClient,
  getTablesClient,
  initializeAppwrite,
} from './client';

describe('initializeAppwrite', () => {
  it('throws before initialization when accessing internal clients', async () => {
    await import('vitest').then(async ({ vi }) => {
      vi.resetModules();
      const clientModule = await import('./client');

      expect(() => clientModule.getAccountClient()).toThrow(
        'Appwrite is not initialized. Call initializeAppwrite first.',
      );
      expect(() => clientModule.getTablesClient()).toThrow(
        'Appwrite is not initialized. Call initializeAppwrite first.',
      );
      expect(() => clientModule.getStorageClient()).toThrow(
        'Appwrite is not initialized. Call initializeAppwrite first.',
      );
    });
  });

  it('initializes runtime clients with endpoint and project', () => {
    initializeAppwrite({
      endpoint: 'https://cloud.appwrite.io/v1',
      projectId: 'project_1',
    });

    expect(getAccountClient()).toBeDefined();
    expect(getTablesClient()).toBeDefined();
    expect(getStorageClient()).toBeDefined();
  });

  it('accepts optional api key', () => {
    initializeAppwrite({
      endpoint: 'https://cloud.appwrite.io/v1',
      projectId: 'project_1',
      apiKey: 'secret',
    });

    expect(getTablesClient()).toBeDefined();
  });
});
