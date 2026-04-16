import { describe, expect, it, vi } from 'vitest';
import { AppwriteCatastrophicConfigError } from '../errors/appwrite-errors.js';

vi.mock('../client', () => ({
  getAccountClient: () => {
    throw new AppwriteCatastrophicConfigError(
      'Appwrite is not initialized. Call initializeAppwrite first.',
    );
  },
}));

import { AuthService } from './auth.js';

describe('AuthService catastrophic failures', () => {
  it('Class 8 throws catastrophic error when appwrite runtime is not initialized', () => {
    expect(() => new AuthService()).toThrow(AppwriteCatastrophicConfigError);
  });
});
