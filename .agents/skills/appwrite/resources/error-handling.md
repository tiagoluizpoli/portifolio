# Appwrite Error Handling — Typed Exception System

---

## AppwriteException Code Reference

| Code | Name | Meaning | Action |
|:---|:---|:---|:---|
| 400 | Bad Request | Invalid data, missing field, malformed query | Validate input before sending |
| 401 | Unauthorized | No session or expired session | Redirect to login |
| 403 | Forbidden | Session valid, but insufficient permissions | Show access denied |
| 404 | Not Found | Document/collection/bucket doesn't exist | Return null or 404 page |
| 409 | Conflict | Document with that ID already exists | Use `ID.unique()` |
| 429 | Rate Limited | Too many requests | Exponential backoff + retry |
| 500 | Server Error | Appwrite internal error | Log + show generic error |
| 503 | Unavailable | Appwrite is down | Retry with circuit breaker |

---

## Typed Error Classes

```typescript
// Base application error
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly userMessage: string // Safe to show to users
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401, 'Please sign in to continue');
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('Forbidden', 403, 'You do not have permission to perform this action');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(resource: string) {
    super(`${resource} already exists`, 409, `${resource} already exists`);
  }
}

export class ServerError extends AppError {
  constructor(context?: string) {
    super(
      `Server error${context ? ` [${context}]` : ''}`,
      500,
      'Something went wrong. Please try again.'
    );
  }
}
```

---

## Error Mapper — Convert AppwriteException to Typed Errors

```typescript
import { AppwriteException } from 'node-appwrite';

export function mapAppwriteError(error: unknown, context?: string): never {
  if (!(error instanceof AppwriteException)) throw error;

  switch (error.code) {
    case 401: throw new UnauthorizedError();
    case 403: throw new ForbiddenError();
    case 404: throw new NotFoundError(context ?? 'Resource');
    case 409: throw new ConflictError(context ?? 'Resource');
    case 429: throw new AppError('Rate limited', 429, 'Too many requests. Please wait a moment.');
    default:
      // Log server error details (safe — never sent to client)
      console.error('[Appwrite Error]', {
        code: error.code,
        message: error.message,
        type: error.type,
        context,
      });
      throw new ServerError(context);
  }
}

// Usage:
async function getSkill(id: SkillId): Promise<Skill | null> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, SKILLS_ID, id);
    return SkillSchema.parse(doc);
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 404) return null;
    mapAppwriteError(error, 'Skill');
  }
}
```

---

## Retry with Exponential Backoff (for 429 / 503)

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (error instanceof AppwriteException && (error.code === 429 || error.code === 503)) {
        const delay = baseDelayMs * Math.pow(2, attempt); // 500ms, 1s, 2s
        console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw error; // Don't retry non-retriable errors
    }
  }

  throw lastError;
}

// Usage:
const skills = await withRetry(() =>
  databases.listDocuments(DATABASE_ID, SKILLS_COLLECTION_ID, queries)
);
```

---

## TanStack Start — Server Function Error Surface

```typescript
// In TanStack Start server functions, errors thrown are serialized and sent to client.
// Use userMessage for client-safe errors.

export const getSkillFn = createServerFn()
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const { databases } = createSessionClient();
      const doc = await databases.getDocument(DATABASE_ID, SKILLS_COLLECTION_ID, data.id);
      return SkillSchema.parse(doc);
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 404) {
        throw new Error('Skill not found'); // Simple user-facing message
      }
      if (error instanceof AppwriteException && error.code === 401) {
        throw new Error('Please sign in to view skills');
      }
      // Unknown errors — log detail, throw generic
      console.error('[getSkillFn]', error);
      throw new Error('Failed to load skill. Please try again.');
    }
  });
```
