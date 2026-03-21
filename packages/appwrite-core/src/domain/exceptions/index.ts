export class AppWriteException extends Error {
  constructor(
    message: string,
    public readonly code?: number,
  ) {
    super(message);
    this.name = 'AppWriteException';
  }
}

export class PermissionDeniedException extends AppWriteException {
  constructor(message = 'Permission Denied') {
    super(message, 401);
    this.name = 'PermissionDeniedException';
  }
}

export class NotFoundException extends AppWriteException {
  constructor(message = 'Resource Not Found') {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}

export class ValidationException extends AppWriteException {
  constructor(message = 'Validation Failed') {
    super(message, 400);
    this.name = 'ValidationException';
  }
}
