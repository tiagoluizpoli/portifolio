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

export function extractErrorMetadata(error: unknown): {
  code: number;
  message?: string;
} {
  if (error instanceof Error) {
    return {
      code: Number.NaN,
      message: error.message,
    };
  }

  if (typeof error !== 'object' || error === null) {
    return {
      code: Number.NaN,
      message: undefined,
    };
  }

  let code = Number.NaN;

  if (Object.hasOwn(error, 'code')) {
    const codeValue = Reflect.get(error, 'code');

    if (typeof codeValue === 'number') {
      code = codeValue;
    } else if (typeof codeValue === 'string') {
      code = Number.parseInt(codeValue, 10);
    }
  }

  let message: string | undefined;

  if (Object.hasOwn(error, 'message')) {
    const messageValue = Reflect.get(error, 'message');
    message = typeof messageValue === 'string' ? messageValue : undefined;
  }

  return {
    code,
    message,
  };
}

export function mapAppwriteError(error: unknown): Error {
  const { code, message } = extractErrorMetadata(error);

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
