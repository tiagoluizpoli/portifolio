# TanStack Server Functions — Deep Reference

---

## Anatomy of a Server Function

```typescript
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';

export const myFn = createServerFn({
  method: 'GET',  // 'GET' for reads, 'POST' for mutations
})
  // 1. VALIDATOR — Zod schema validates and types all input
  .validator(z.object({
    id: z.string().uuid(),
    include: z.enum(['full', 'summary']).default('summary'),
  }))
  // 2. MIDDLEWARE — optional, runs before handler
  .middleware([requireAuthMiddleware])
  // 3. HANDLER — runs on the server, never shipped to browser
  .handler(async ({ data, context }) => {
    // data: validated, typed input
    // context: populated by middleware (e.g., context.user)
    return { result: 'value' };
  });

// CALLING from client or loader:
await myFn({ data: { id: 'abc', include: 'full' } });

// CALLING from another server function (skip HTTP round-trip):
await myFn({ data: { id: 'abc' } }); // Same API
```

---

## GET vs POST — When to Use Which

| Scenario | Method | Why |
|:---|:---|:---|
| Fetch data for a route loader | `GET` | Cacheable, preloaded by TanStack Router |
| Search / filter | `GET` | URL-share-able with search params |
| Create a document | `POST` | Mutating operation |
| Update a document | `POST` | Mutating operation |
| Delete documents | `POST` | Destructive — never allow with GET |
| Auth (login, logout) | `POST` | Sensitive — no caching |
| File upload | `POST` | Must be POST for multipart form |

---

## Pattern 1: Paginated GET with Query String

```typescript
const ListItemsInputSchema = z.object({
  category: z.string().optional(),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
  orderBy: z.enum(['$createdAt', '$updatedAt', 'title']).default('$createdAt'),
});
type ListItemsInput = z.infer<typeof ListItemsInputSchema>;

export const listItemsFn = createServerFn({ method: 'GET' })
  .validator(ListItemsInputSchema)
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const queries: string[] = [
      Query.equal('ownerId', user.$id),
      Query.equal('isActive', true),
      Query.isNull('deletedAt'),
      Query.limit(data.limit),
      Query.offset(data.page * data.limit),
      Query.orderDesc(data.orderBy),
    ];
    if (data.category) queries.push(Query.equal('category', data.category));

    const result = await databases.listDocuments(DB_ID, ITEMS_COLLECTION_ID, queries);
    return {
      items: result.documents.map(d => ItemSchema.parse(d)),
      total: result.total,
      page: data.page,
      hasNextPage: (data.page + 1) * data.limit < result.total,
    };
  });

// queryOptions factory — shared between loader and useSuspenseQuery
export const listItemsQueryOptions = (input: Partial<ListItemsInput> = {}) =>
  queryOptions({
    queryKey: ['items', 'list', input],
    queryFn: () => listItemsFn({ data: { ...input } }),
    placeholderData: keepPreviousData, // Don't show loading state on page change
  });
```

---

## Pattern 2: Mutation POST with Strict Ownership

```typescript
export const updateItemFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    id: z.string().min(1),
    updates: UpdateItemSchema.refine(
      data => Object.keys(data).length > 0,
      { message: 'At least one field must be updated' }
    ),
  }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    // Defense in depth: ownership check BEFORE the Appwrite permission enforcement
    let existing: Models.Document;
    try {
      existing = await databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
    } catch (e) {
      if (e instanceof AppwriteException && e.code === 404) throw new Error('Item not found');
      throw e;
    }

    if (existing['ownerId'] !== user.$id) {
      throw new Error('Forbidden: you do not own this item');
    }

    // Appwrite ALSO enforces permissions at the document level — double-layered
    const updated = await databases.updateDocument(
      DB_ID, ITEMS_COLLECTION_ID, data.id, data.updates
    );

    return ItemSchema.parse(updated);
  });
```

---

## Pattern 3: Multi-Step Transaction (Pseudo-Atomic)

Appwrite doesn't have native transactions. This is the pattern for multi-step mutations:

```typescript
export const reorderItemsFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    // Ordered list of [id, newOrder] tuples
    items: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })),
  }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    // Step 1: Validate ALL items belong to current user BEFORE any mutation
    const docs = await Promise.all(
      data.items.map(item =>
        databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, item.id)
      )
    );
    const unauthorized = docs.find(d => d['ownerId'] !== user.$id);
    if (unauthorized) throw new Error('Forbidden: operation contains items you do not own');

    // Step 2: Track what succeeded for potential rollback
    const completed: { id: string; prevOrder: number }[] = [];

    try {
      for (const item of data.items) {
        const prevOrder = docs.find(d => d.$id === item.id)!['order'] as number;
        await databases.updateDocument(DB_ID, ITEMS_COLLECTION_ID, item.id, {
          order: item.order,
        });
        completed.push({ id: item.id, prevOrder });
      }
    } catch (error) {
      // ROLLBACK: restore all previously updated items
      await Promise.allSettled(
        completed.map(({ id, prevOrder }) =>
          databases.updateDocument(DB_ID, ITEMS_COLLECTION_ID, id, { order: prevOrder })
        )
      );
      throw new Error('Reorder failed and was rolled back. Please try again.');
    }
  });
```

---

## Pattern 4: File Upload Handler

```typescript
export const uploadFileFn = createServerFn({ method: 'POST' })
  .handler(async ({ request }) => {
    const { account, storage } = createSessionClient();
    const user = await account.get();

    const formData = await request.formData();
    const file = formData.get('file');
    const targetBucket = formData.get('bucket') as string;

    if (!(file instanceof File)) throw new Error('No file provided');

    // Validate bucket is one we accept uploads for
    const UPLOADABLE_BUCKETS = Object.values(BUCKETS_CONFIG).map(b => b.id);
    if (!UPLOADABLE_BUCKETS.includes(targetBucket)) {
      throw new Error('Invalid upload target');
    }

    const bucketConfig = BUCKETS_CONFIG[targetBucket];

    if (file.size > bucketConfig.maxSize) {
      throw new Error(`File too large. Max ${bucketConfig.maxSize / 1024 / 1024}MB`);
    }

    if (!bucketConfig.allowed.includes(file.type)) {
      throw new Error(`File type not allowed: ${file.type}`);
    }

    const uploaded = await storage.createFile(
      targetBucket,
      ID.unique(),
      InputFile.fromBuffer(await file.arrayBuffer(), file.name),
      [Permission.read(Role.any()), Permission.delete(Role.user(user.$id))]
    );

    return {
      fileId: uploaded.$id,
      viewUrl: getFileViewUrl(targetBucket, uploaded.$id),
    };
  });
```

---

## Pattern 5: Chained Server Functions (Composition)

```typescript
// Lower-level function: raw database access
export const getRawItemFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { databases } = createSessionClient();
    return databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
  });

// Higher-level function: orchestrates multiple lower-level calls
export const getItemWithRelatedFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Calls another server function directly (no HTTP round-trip — direct invocation)
    const rawItem = await getRawItemFn({ data });

    // Fetch related data in parallel
    const [ownerProfile, relatedItems] = await Promise.all([
      getProfileFn({ data: { ownerId: rawItem['ownerId'] as string } }),
      listItemsFn({ data: { category: rawItem['category'] as string, limit: 3 } }),
    ]);

    return {
      item: ItemSchema.parse(rawItem),
      owner: ownerProfile,
      related: relatedItems.items.filter(i => i.$id !== data.id),
    };
  });
```

---

## Error Surface — What Clients See

```typescript
// Errors thrown in handlers become Error objects on the client
// The message string is what the client receives

// ❌ DON'T: Expose internal details
throw new Error(`Database error: ${appwriteException.message}`);

// ❌ DON'T: Expose stack traces or internal IDs
throw new Error(JSON.stringify(error));

// ✅ DO: User-friendly messages only
throw new Error('This item could not be updated. Please try again.');

// ✅ DO: Domain-specific error types that the client can pattern-match
class ItemNotFoundError extends Error {
  readonly code = 'ITEM_NOT_FOUND';
  constructor(id: string) { super(`Item not found: ${id}`); }
}

// Client-side:
try {
  await updateItemFn({ data });
} catch (error) {
  if (error instanceof Error && error.message.includes('not found')) {
    // Handle specifically
  }
}
```
