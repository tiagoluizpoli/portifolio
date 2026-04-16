import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import {
  AppwriteAuthException,
  AppwriteSystemException,
} from '../errors/appwrite-errors.js';

let accountMock = {
  createEmailPasswordSession: vi.fn(),
  get: vi.fn(),
  deleteSession: vi.fn(),
};

vi.mock('../client', () => ({
  getAccountClient: () => accountMock,
}));

import { AuthService } from './auth.js';

describe('AuthService', () => {
  beforeEach(() => {
    accountMock = {
      createEmailPasswordSession: vi.fn(),
      get: vi.fn(),
      deleteSession: vi.fn(),
    };
  });

  it('creates a session for valid credentials', async () => {
    accountMock.createEmailPasswordSession.mockResolvedValue({
      $id: 'session-1',
      userId: 'user-1',
      expire: '2030-01-01T00:00:00.000Z',
    });

    const service = new AuthService();

    await expect(
      service.createSession({
        email: 'user@example.com',
        password: 'strong-pass',
      }),
    ).resolves.toEqual({
      id: 'session-1',
      userId: 'user-1',
      expiresAt: '2030-01-01T00:00:00.000Z',
    });

    expect(accountMock.createEmailPasswordSession).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'strong-pass',
    });
  });

  it('rejects invalid credentials payload', async () => {
    const service = new AuthService();

    await expect(
      service.createSession({
        email: 'invalid-email',
        password: 'short',
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(accountMock.createEmailPasswordSession).not.toHaveBeenCalled();
  });

  it('maps 401 during login to auth exception', async () => {
    accountMock.createEmailPasswordSession.mockRejectedValue({ code: 401 });
    const service = new AuthService();

    await expect(
      service.createSession({
        email: 'user@example.com',
        password: 'strong-pass',
      }),
    ).rejects.toBeInstanceOf(AppwriteAuthException);
  });

  it('returns current user from account client', async () => {
    accountMock.get.mockResolvedValue({
      $id: 'user-1',
      email: 'user@example.com',
    });
    const service = new AuthService();

    await expect(service.getCurrentUser()).resolves.toEqual({
      $id: 'user-1',
      email: 'user@example.com',
    });
  });

  it('maps account.get failures to system exception', async () => {
    accountMock.get.mockRejectedValue({ code: 500 });
    const service = new AuthService();

    await expect(service.getCurrentUser()).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
  });

  it('deletes current session', async () => {
    const service = new AuthService();

    await expect(service.deleteCurrentSession()).resolves.toBeUndefined();
    expect(accountMock.deleteSession).toHaveBeenCalledWith({
      sessionId: 'current',
    });
  });

  it('maps delete failures to system exception', async () => {
    accountMock.deleteSession.mockRejectedValue({ code: 500 });
    const service = new AuthService();

    await expect(service.deleteCurrentSession()).rejects.toBeInstanceOf(
      AppwriteSystemException,
    );
  });
});
