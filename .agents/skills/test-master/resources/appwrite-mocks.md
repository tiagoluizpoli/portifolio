# Appwrite Mock Library — Complete Test Fixtures

All mocks for the Appwrite SDK, pre-built and ready for Vitest.

---

## Core Mock Factory

```typescript
// tests/mocks/appwrite.mock.ts
import { vi } from 'vitest';
import { AppwriteException } from 'node-appwrite';

// --- RESPONSE BUILDERS ---

export function buildDocument<T extends Record<string, unknown>>(
  data: T,
  overrides: Partial<AppwriteDocument> = {}
): T & AppwriteDocument {
  return {
    $id: `doc-${Math.random().toString(36).slice(2)}`,
    $collectionId: 'collection-test',
    $databaseId: 'database-test',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: ['read("any")'],
    ...data,
    ...overrides,
  };
}

export function buildDocumentList<T extends Record<string, unknown>>(
  items: T[],
  total?: number
) {
  return {
    documents: items.map(item => buildDocument(item)),
    total: total ?? items.length,
  };
}

export function buildUser(overrides: Partial<AppwriteUser> = {}): AppwriteUser {
  return {
    $id: 'user-test-123',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    emailVerification: true,
    status: true,
    ...overrides,
  };
}

// --- EXCEPTION BUILDERS ---

export const AppwriteErrors = {
  unauthorized: () => new AppwriteException('Unauthorized', 401, 'user_unauthorized', ''),
  forbidden:    () => new AppwriteException('Forbidden', 403, 'user_unauthorized', ''),
  notFound:     (type = 'document') => new AppwriteException('Not Found', 404, `${type}_not_found`, ''),
  conflict:     () => new AppwriteException('Conflict', 409, 'document_already_exists', ''),
  rateLimited:  () => new AppwriteException('Rate Limited', 429, 'rate_limit_exceeded', ''),
  serverError:  () => new AppwriteException('Server Error', 500, 'general_unknown', ''),
};

// --- SESSION CLIENT MOCKS ---

export function mockSessionClient(overrides: Partial<MockSessionClient> = {}) {
  const mock = {
    account: {
      get: vi.fn().mockResolvedValue(buildUser()),
      createEmailPasswordSession: vi.fn().mockResolvedValue({ secret: 'session-token' }),
      deleteSession: vi.fn().mockResolvedValue({}),
      ...overrides.account,
    },
    databases: {
      createDocument: vi.fn().mockImplementation((_, __, id, data) =>
        Promise.resolve(buildDocument({ ...data, $id: id }))
      ),
      listDocuments: vi.fn().mockResolvedValue(buildDocumentList([])),
      getDocument: vi.fn().mockResolvedValue(buildDocument({})),
      updateDocument: vi.fn().mockImplementation((_, __, id, data) =>
        Promise.resolve(buildDocument({ ...data, $id: id }))
      ),
      deleteDocument: vi.fn().mockResolvedValue({}),
      ...overrides.databases,
    },
    storage: {
      createFile: vi.fn().mockResolvedValue(buildDocument({ name: 'test.pdf', sizeOriginal: 1024 })),
      getFileDownload: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
      deleteFile: vi.fn().mockResolvedValue({}),
      ...overrides.storage,
    },
  };

  return mock;
}

// Convenience: unauthorized user
export function mockUnauthorizedClient() {
  return mockSessionClient({
    account: {
      get: vi.fn().mockRejectedValue(AppwriteErrors.unauthorized()),
    },
  });
}

// Convenience: database error
export function mockDatabaseErrorClient(code: 500 | 429 | 403 = 500) {
  const error = {
    500: AppwriteErrors.serverError,
    429: AppwriteErrors.rateLimited,
    403: AppwriteErrors.forbidden,
  }[code]();

  return mockSessionClient({
    databases: {
      createDocument: vi.fn().mockRejectedValue(error),
      listDocuments: vi.fn().mockRejectedValue(error),
      getDocument: vi.fn().mockRejectedValue(error),
      updateDocument: vi.fn().mockRejectedValue(error),
      deleteDocument: vi.fn().mockRejectedValue(error),
    },
  });
}
```

---

## Vitest Module Mock Setup

```typescript
// In your test file:
import { vi, beforeEach } from 'vitest';
import { mockSessionClient, AppwriteErrors } from '../mocks/appwrite.mock';

// Mock at the module level — runs once per file
vi.mock('../lib/appwrite', () => ({
  createSessionClient: vi.fn(),
}));

// Import the mocked function
import { createSessionClient } from '../lib/appwrite';

describe('My Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset call counts between tests

    // Default: authenticated user, all operations succeed
    vi.mocked(createSessionClient).mockReturnValue(mockSessionClient());
  });

  it('handles unauthorized user', async () => {
    vi.mocked(createSessionClient).mockReturnValue(mockUnauthorizedClient());
    // ... test unauthorized scenario
  });

  it('handles database unavailable', async () => {
    vi.mocked(createSessionClient).mockReturnValue(mockDatabaseErrorClient(500));
    // ... test error scenario
  });
});
```

---

## Skill-Specific Mocks

```typescript
// tests/mocks/skills.mock.ts
import { buildDocument } from './appwrite.mock';

export const MOCK_SKILL = buildDocument({
  name: 'TypeScript',
  level: 8,
  category: 'frontend',
  userId: 'user-test-123',
  icon: 'logos:typescript',
});

export const MOCK_SKILLS = [
  MOCK_SKILL,
  buildDocument({ name: 'React', level: 9, category: 'frontend', userId: 'user-test-123' }),
  buildDocument({ name: 'Node.js', level: 7, category: 'backend', userId: 'user-test-123' }),
  buildDocument({ name: 'Other User Skill', level: 5, category: 'backend', userId: 'other-user' }),
];

export function mockSkillsList(overrides: Partial<typeof MOCK_SKILLS[0]>[] = []) {
  return buildDocumentList([
    ...MOCK_SKILLS,
    ...overrides.map(o => buildDocument(o)),
  ]);
}
```
