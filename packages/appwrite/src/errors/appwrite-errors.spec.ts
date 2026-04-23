import { describe, expect, it } from 'vitest';
import {
  AppwriteAuthException,
  AppwritePermissionException,
  AppwriteSystemException,
  mapAppwriteError,
} from './appwrite-errors';

describe('mapAppwriteError', () => {
  it('maps 401 to auth exception', () => {
    const error = mapAppwriteError({ code: 401, message: 'unauthorized' });
    expect(error).toBeInstanceOf(AppwriteAuthException);
    expect(error.message).toBe('unauthorized');
  });

  it('maps 403 to permission exception', () => {
    const error = mapAppwriteError({ code: 403, message: 'forbidden' });
    expect(error).toBeInstanceOf(AppwritePermissionException);
  });

  it('maps 500 to system exception', () => {
    const error = mapAppwriteError({ code: 500, message: 'oops' });
    expect(error).toBeInstanceOf(AppwriteSystemException);
  });

  it('maps string status code to system exception', () => {
    const error = mapAppwriteError({ code: '500', message: 'oops' });
    expect(error).toBeInstanceOf(AppwriteSystemException);
  });

  it('maps 429 and 408 to system exception', () => {
    expect(mapAppwriteError({ code: 429 })).toBeInstanceOf(
      AppwriteSystemException,
    );
    expect(mapAppwriteError({ code: 408 })).toBeInstanceOf(
      AppwriteSystemException,
    );
  });

  it('returns original error when no code mapping applies', () => {
    const source = new Error('plain');
    expect(mapAppwriteError(source)).toBe(source);
  });

  it('maps unknown payload to generic Error', () => {
    const error = mapAppwriteError('unknown');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unknown Appwrite error');
  });

  it('maps null payload to generic Error', () => {
    const error = mapAppwriteError(null);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unknown Appwrite error');
  });

  it('ignores non-string message payloads', () => {
    const error = mapAppwriteError({ code: 500, message: { text: 'oops' } });
    expect(error).toBeInstanceOf(AppwriteSystemException);
    expect(error.message).toBe('Appwrite system failure');
  });

  it('falls back to unknown error when code has unsupported type', () => {
    const error = mapAppwriteError({ code: { value: 500 }, message: 'oops' });
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Unknown Appwrite error');
  });
});
