import {
  AppWriteException,
  NotFoundException,
  PermissionDeniedException,
} from '../exceptions/index.js';

export interface AppWriteError {
  code?: number;
  message: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class for centralized exception mapping
export class ExceptionMapper {
  public static map(error: unknown): never {
    const err = error as AppWriteError;
    const message = err.message || 'An unknown error occurred';
    const code = err.code;

    if (code === 401 || code === 403) {
      throw new PermissionDeniedException(message);
    }

    if (code === 404) {
      throw new NotFoundException(message);
    }

    // Default to generic AppWriteException
    throw new AppWriteException(message, code);
  }
}
