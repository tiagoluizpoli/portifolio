export class AppwriteAuthException extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AppwriteAuthException';
  }
}

export class AppwritePermissionException extends Error {
  constructor(message = 'Permission denied') {
    super(message);
    this.name = 'AppwritePermissionException';
  }
}

export class AppwriteSystemException extends Error {
  constructor(message = 'Appwrite system failure') {
    super(message);
    this.name = 'AppwriteSystemException';
  }
}

export class AppwriteCatastrophicConfigError extends Error {
  constructor(message = 'Missing required Appwrite configuration') {
    super(message);
    this.name = 'AppwriteCatastrophicConfigError';
  }
}

export class InvalidRepositoryQueryError extends Error {
  constructor(message = 'Invalid repository query parameters provided') {
    super(message);
    this.name = 'InvalidRepositoryQueryError';
  }
}

export function mapAppwriteError(error: unknown): Error {
  const candidate = error as { code?: unknown; message?: unknown };
  const code =
    typeof candidate.code === 'number'
      ? candidate.code
      : typeof candidate.code === 'string'
        ? Number.parseInt(candidate.code, 10)
        : Number.NaN;
  const message =
    typeof candidate.message === 'string' ? candidate.message : undefined;

  if (code === 401) {
    return new AppwriteAuthException(message);
  }

  if (code === 403) {
    return new AppwritePermissionException(message);
  }

  if (code === 408 || code === 429 || code >= 500) {
    return new AppwriteSystemException(message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown Appwrite error');
}
