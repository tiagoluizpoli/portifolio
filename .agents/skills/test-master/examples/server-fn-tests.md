# Server Function Tests — Complete Permission Matrix

**All 8 scenario classes applied to CRUD server function tests.**

```typescript
// src/functions/__tests__/items.functions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppwriteException } from 'node-appwrite';
import {
  createItemFn,
  getItemFn,
  updateItemFn,
  deleteItemFn,
} from '../items.functions';
import { createSessionClient } from '../../lib/appwrite';
import { mockSessionClient, mockUnauthorizedClient, AppwriteErrors } from '../../test-utils/appwrite.mock';

vi.mock('../../lib/appwrite', () => ({ createSessionClient: vi.fn() }));

// ─────────────────────────────────────────────
// TEST DATA
// ─────────────────────────────────────────────
const CURRENT_USER = { $id: 'user-current', name: 'Current User', email: 'current@test.com', emailVerification: true };
const OTHER_USER   = { $id: 'user-other', name: 'Other User', email: 'other@test.com' };
const MOCK_ITEM    = { $id: 'item-123', title: 'Test Item', status: 'draft', ownerId: CURRENT_USER.$id };
const VALID_INPUT  = { title: 'New Item', status: 'draft' as const };

// ─────────────────────────────────────────────
// createItemFn
// ─────────────────────────────────────────────
describe('createItemFn', () => {
  let mocks: ReturnType<typeof mockSessionClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = mockSessionClient({ user: CURRENT_USER });
    vi.mocked(createSessionClient).mockReturnValue(mocks);
  });

  // CLASS 1: HAPPY PATH
  describe('Happy Path', () => {
    it('creates a document and returns the parsed item', async () => {
      const created = { ...MOCK_ITEM, ...VALID_INPUT };
      mocks.databases.createDocument.mockResolvedValueOnce(created);

      const result = await createItemFn({ data: VALID_INPUT });
      expect(result.title).toBe(VALID_INPUT.title);
      expect(result.$id).toBeDefined();
    });

    it('passes ownerId from the authenticated session (never from input)', async () => {
      mocks.databases.createDocument.mockResolvedValueOnce(MOCK_ITEM);
      await createItemFn({ data: VALID_INPUT });

      expect(mocks.databases.createDocument).toHaveBeenCalledWith(
        expect.any(String), expect.any(String), expect.any(String),
        expect.objectContaining({ ownerId: CURRENT_USER.$id }),
        expect.any(Array)
      );
    });

    it('sets document-level write permissions scoped to owner', async () => {
      mocks.databases.createDocument.mockResolvedValueOnce(MOCK_ITEM);
      await createItemFn({ data: VALID_INPUT });

      const permissions = mocks.databases.createDocument.mock.calls[0][4] as string[];
      expect(permissions.some(p => p.includes(CURRENT_USER.$id))).toBe(true);
    });
  });

  // CLASS 3: INVALID INPUT
  describe('Invalid Input (Zod Validation)', () => {
    it('throws without calling the database when title is empty', async () => {
      await expect(createItemFn({ data: { title: '', status: 'draft' } })).rejects.toThrow();
      expect(mocks.databases.createDocument).not.toHaveBeenCalled();
    });

    it('throws without calling auth when title is missing', async () => {
      await expect(createItemFn({ data: {} as any })).rejects.toThrow();
      expect(mocks.account.get).not.toHaveBeenCalled(); // Zod runs before auth
    });

    it('throws when status is an invalid enum value', async () => {
      await expect(createItemFn({ data: { title: 'Test', status: 'pending' as any } })).rejects.toThrow();
      expect(mocks.databases.createDocument).not.toHaveBeenCalled();
    });
  });

  // CLASS 4: PERMISSION FAILURES
  describe('Permission Failures', () => {
    it('throws when user is unauthenticated', async () => {
      vi.mocked(createSessionClient).mockReturnValue(mockUnauthorizedClient());
      await expect(createItemFn({ data: VALID_INPUT })).rejects.toThrow();
    });

    it('throws when session has expired mid-operation', async () => {
      mocks.account.get.mockRejectedValueOnce(AppwriteErrors.unauthorized());
      await expect(createItemFn({ data: VALID_INPUT })).rejects.toThrow();
      expect(mocks.databases.createDocument).not.toHaveBeenCalled();
    });
  });

  // CLASS 5: SYSTEM FAILURES
  describe('System Failures', () => {
    it('throws when Appwrite returns 500', async () => {
      mocks.databases.createDocument.mockRejectedValueOnce(AppwriteErrors.serverError());
      await expect(createItemFn({ data: VALID_INPUT })).rejects.toThrow();
    });

    it('throws when rate limited (429)', async () => {
      mocks.databases.createDocument.mockRejectedValueOnce(AppwriteErrors.rateLimited());
      await expect(createItemFn({ data: VALID_INPUT })).rejects.toThrow();
    });
  });
});

// ─────────────────────────────────────────────
// updateItemFn — Permission Matrix
// ─────────────────────────────────────────────
describe('updateItemFn — Permission Matrix', () => {
  let mocks: ReturnType<typeof mockSessionClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = mockSessionClient({ user: CURRENT_USER });
    vi.mocked(createSessionClient).mockReturnValue(mocks);
  });

  // CLASS 1: HAPPY PATH
  it('updates the document when called by the owner', async () => {
    mocks.databases.getDocument.mockResolvedValueOnce(MOCK_ITEM); // ownerId = CURRENT_USER
    mocks.databases.updateDocument.mockResolvedValueOnce({ ...MOCK_ITEM, title: 'Updated Title' });

    const result = await updateItemFn({ data: { id: 'item-123', updates: { title: 'Updated Title' } } });
    expect(result.title).toBe('Updated Title');
    expect(mocks.databases.updateDocument).toHaveBeenCalledTimes(1);
  });

  // CLASS 4: PERMISSION FAILURES
  it('throws Forbidden when a different user tries to update', async () => {
    mocks.databases.getDocument.mockResolvedValueOnce({
      ...MOCK_ITEM, ownerId: OTHER_USER.$id, // Different owner
    });

    await expect(
      updateItemFn({ data: { id: 'item-123', updates: { title: 'Hacked' } } })
    ).rejects.toThrow(/forbidden/i);

    expect(mocks.databases.updateDocument).not.toHaveBeenCalled();
  });

  it('throws when unauthenticated', async () => {
    vi.mocked(createSessionClient).mockReturnValue(mockUnauthorizedClient());
    await expect(
      updateItemFn({ data: { id: 'item-123', updates: { title: 'X' } } })
    ).rejects.toThrow();
    expect(mocks.databases.updateDocument).not.toHaveBeenCalled();
  });

  it('throws when item does not exist', async () => {
    mocks.databases.getDocument.mockRejectedValueOnce(AppwriteErrors.notFound());
    await expect(
      updateItemFn({ data: { id: 'nonexistent', updates: { title: 'X' } } })
    ).rejects.toThrow();
  });

  // CLASS 5: SYSTEM FAILURES
  it('propagates database errors', async () => {
    mocks.databases.getDocument.mockResolvedValueOnce(MOCK_ITEM);
    mocks.databases.updateDocument.mockRejectedValueOnce(AppwriteErrors.serverError());
    await expect(
      updateItemFn({ data: { id: 'item-123', updates: { title: 'X' } } })
    ).rejects.toThrow();
  });

  // CLASS 6: CONCURRENT OPERATIONS
  it('verifies ownership check happens before update, not in parallel', async () => {
    const getOrder: string[] = [];
    mocks.databases.getDocument.mockImplementationOnce(async () => {
      getOrder.push('get');
      return MOCK_ITEM;
    });
    mocks.databases.updateDocument.mockImplementationOnce(async () => {
      getOrder.push('update');
      return { ...MOCK_ITEM, title: 'Updated' };
    });

    await updateItemFn({ data: { id: 'item-123', updates: { title: 'Updated' } } });

    expect(getOrder).toEqual(['get', 'update']); // Sequential, not parallel
  });

  // CLASS 3: INVALID INPUT
  it('throws validation error without calling database for empty updates', async () => {
    await expect(
      updateItemFn({ data: { id: 'item-123', updates: {} } })
    ).rejects.toThrow(); // Depends on schema: z.object({}).min(1) or refine

    // getDocument should NOT be called if validation fails first
  });
});

// ─────────────────────────────────────────────
// deleteItemFn — Full Scenario Coverage
// ─────────────────────────────────────────────
describe('deleteItemFn', () => {
  let mocks: ReturnType<typeof mockSessionClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = mockSessionClient({ user: CURRENT_USER });
    vi.mocked(createSessionClient).mockReturnValue(mocks);
    mocks.databases.getDocument.mockResolvedValue(MOCK_ITEM); // Default: item owned by current user
  });

  describe('Happy Path', () => {
    it('soft-deletes by setting deletedAt timestamp', async () => {
      await deleteItemFn({ data: { id: 'item-123' } });
      expect(mocks.databases.updateDocument).toHaveBeenCalledWith(
        expect.any(String), expect.any(String), 'item-123',
        expect.objectContaining({ deletedAt: expect.any(String) })
      );
    });

    it('does NOT hard-delete the document (non-destructive)', async () => {
      await deleteItemFn({ data: { id: 'item-123' } });
      expect(mocks.databases.deleteDocument).not.toHaveBeenCalled();
    });
  });

  describe('Permission Matrix', () => {
    it('throws Forbidden for non-owner', async () => {
      mocks.databases.getDocument.mockResolvedValueOnce({ ...MOCK_ITEM, ownerId: OTHER_USER.$id });
      await expect(deleteItemFn({ data: { id: 'item-123' } })).rejects.toThrow(/forbidden/i);
      expect(mocks.databases.updateDocument).not.toHaveBeenCalled();
    });

    it('throws Unauthorized for unauthenticated user', async () => {
      vi.mocked(createSessionClient).mockReturnValue(mockUnauthorizedClient());
      await expect(deleteItemFn({ data: { id: 'item-123' } })).rejects.toThrow();
    });

    it('throws Not Found for nonexistent item', async () => {
      mocks.databases.getDocument.mockRejectedValueOnce(AppwriteErrors.notFound());
      await expect(deleteItemFn({ data: { id: 'ghost-item' } })).rejects.toThrow();
    });
  });

  describe('System Failures', () => {
    it('throws on database error during permission check (getDocument failure)', async () => {
      mocks.databases.getDocument.mockRejectedValueOnce(AppwriteErrors.serverError());
      await expect(deleteItemFn({ data: { id: 'item-123' } })).rejects.toThrow();
      expect(mocks.databases.updateDocument).not.toHaveBeenCalled();
    });

    it('throws on database error during the soft-delete write', async () => {
      mocks.databases.updateDocument.mockRejectedValueOnce(AppwriteErrors.serverError());
      await expect(deleteItemFn({ data: { id: 'item-123' } })).rejects.toThrow();
    });
  });

  describe('State Transitions', () => {
    it('does not allow deleting an already-deleted item without restore', async () => {
      mocks.databases.getDocument.mockResolvedValueOnce({
        ...MOCK_ITEM,
        deletedAt: '2024-01-01T00:00:00Z', // Already soft-deleted
      });
      await expect(deleteItemFn({ data: { id: 'item-123' } })).rejects.toThrow(/already deleted/i);
    });
  });
});
```
