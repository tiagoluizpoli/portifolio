import { describe, expect, it } from 'vitest';
import {
  AppWriteException,
  NotFoundException,
  PermissionDeniedException,
} from '../exceptions/index.js';
import { ExceptionMapper } from './exception-mapper.js';

describe('ExceptionMapper', () => {
  it('should map 404 to NotFoundException', () => {
    const error = { code: 404, message: 'Not Found' };
    expect(() => ExceptionMapper.map(error)).toThrow(NotFoundException);
  });

  it('should map 401 to PermissionDeniedException', () => {
    const error = { code: 401, message: 'Unauthorized' };
    expect(() => ExceptionMapper.map(error)).toThrow(PermissionDeniedException);
  });

  it('should map 403 to PermissionDeniedException', () => {
    const error = { code: 403, message: 'Forbidden' };
    expect(() => ExceptionMapper.map(error)).toThrow(PermissionDeniedException);
  });

  it('should map unknown codes to AppWriteException', () => {
    const error = { code: 500, message: 'Server Error' };
    expect(() => ExceptionMapper.map(error)).toThrow(AppWriteException);
    try {
      ExceptionMapper.map(error);
    } catch (e: unknown) {
      const err = e as AppWriteException;
      expect(err.code).toBe(500);
    }
  });
});
