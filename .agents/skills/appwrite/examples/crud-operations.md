# Appwrite CRUD Operations — Production-Grade Examples

---

## Example 1: Singleton Document — Upsert Pattern

One document per user (user profile, settings, preferences).

```typescript
// Option A: userId as the document ID (deterministic lookup)
export const upsertProfileFn = createServerFn({ method: 'POST' })
  .validator(UpdateProfileSchema)
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    try {
      // Try to update (most common path for returning users)
      const doc = await databases.updateDocument(
        DB_ID, PROFILE_COLLECTION_ID, user.$id, data
      );
      return ProfileSchema.parse(doc);
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 404) {
        // First time — create with userId as document ID for O(1) lookups
        const doc = await databases.createDocument(
          DB_ID, PROFILE_COLLECTION_ID,
          user.$id, // Deterministic ID
          { ...data, ownerId: user.$id },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
        return ProfileSchema.parse(doc);
      }
      throw error;
    }
  });

// Option B: listDocuments + createOrUpdate (when you need unique indexes other than ID)
export const upsertProfileAlternativeFn = createServerFn({ method: 'POST' })
  .validator(UpdateProfileSchema)
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.listDocuments(
      DB_ID, PROFILE_COLLECTION_ID,
      [Query.equal('ownerId', user.$id), Query.limit(1)]
    );

    if (existing.documents.length > 0) {
      const doc = await databases.updateDocument(
        DB_ID, PROFILE_COLLECTION_ID, existing.documents[0].$id, data
      );
      return ProfileSchema.parse(doc);
    }

    const doc = await databases.createDocument(
      DB_ID, PROFILE_COLLECTION_ID, ID.unique(),
      { ...data, ownerId: user.$id },
      [Permission.read(Role.any()), Permission.write(Role.user(user.$id))]
    );
    return ProfileSchema.parse(doc);
  });
```

---

## Example 2: Full CRUD with Soft Delete

```typescript
// CREATE
export const createItemFn = createServerFn({ method: 'POST' })
  .validator(CreateItemSchema)
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const doc = await databases.createDocument(
      DB_ID, ITEMS_COLLECTION_ID,
      ID.unique(),
      { ...data, ownerId: user.$id, isActive: true },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );
    return ItemSchema.parse(doc);
  });

// LIST — Only non-deleted, active items
export const listItemsFn = createServerFn({ method: 'GET' })
  .validator(z.object({
    category: z.string().optional(),
    ownerId: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const targetOwnerId = data.ownerId ?? (await account.get()).$id;

    const queries = [
      Query.equal('ownerId', targetOwnerId),
      Query.equal('isActive', true),
      Query.isNull('deletedAt'),
      Query.orderDesc('$createdAt'),
      Query.limit(data.limit),
      Query.offset(data.offset),
    ];
    if (data.category) queries.push(Query.equal('category', data.category));

    const result = await databases.listDocuments(DB_ID, ITEMS_COLLECTION_ID, queries);
    return {
      items: result.documents.map(doc => ItemSchema.parse(doc)),
      total: result.total,
    };
  });

// UPDATE — with ownership check
export const updateItemFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string(), updates: UpdateItemSchema }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
    if (existing['ownerId'] !== user.$id) throw new Error('Forbidden');

    const doc = await databases.updateDocument(
      DB_ID, ITEMS_COLLECTION_ID, data.id, data.updates
    );
    return ItemSchema.parse(doc);
  });

// SOFT DELETE
export const softDeleteItemFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
    if (existing['ownerId'] !== user.$id) throw new Error('Forbidden');
    if (existing['deletedAt']) throw new Error('Item is already deleted');

    await databases.updateDocument(DB_ID, ITEMS_COLLECTION_ID, data.id, {
      deletedAt: new Date().toISOString(),
      isActive: false,
    });
  });

// RESTORE — undo a soft delete
export const restoreItemFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
    if (existing['ownerId'] !== user.$id) throw new Error('Forbidden');
    if (!existing['deletedAt']) throw new Error('Item is not deleted');

    const doc = await databases.updateDocument(DB_ID, ITEMS_COLLECTION_ID, data.id, {
      deletedAt: null, isActive: true,
    });
    return ItemSchema.parse(doc);
  });

// HARD DELETE — permanent (requires prior soft-delete)
export const hardDeleteItemFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const existing = await databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
    if (existing['ownerId'] !== user.$id) throw new Error('Forbidden');
    if (!existing['deletedAt']) throw new Error('Must soft-delete before permanently deleting');

    await databases.deleteDocument(DB_ID, ITEMS_COLLECTION_ID, data.id);
  });
```

---

## Example 3: Ordered List — Reorder Pattern

```typescript
export const reorderItemsFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    orderedIds: z.array(z.string()).min(1),
  }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    // Validate all IDs belong to this user BEFORE any mutation
    const docs = await Promise.all(
      data.orderedIds.map(id => databases.getDocument(DB_ID, ITEMS_COLLECTION_ID, id))
    );
    const unauthorized = docs.find(d => d['ownerId'] !== user.$id);
    if (unauthorized) throw new Error('Forbidden: contains items you do not own');

    // Apply new order in parallel
    await Promise.all(
      data.orderedIds.map((id, index) =>
        databases.updateDocument(DB_ID, ITEMS_COLLECTION_ID, id, { order: index })
      )
    );
  });
```

---

## Example 4: Retry Wrapper for Transient Failures

```typescript
async function withAppwriteRetry<T>(
  operation: () => Promise<T>,
  options: { maxAttempts?: number; label?: string } = {}
): Promise<T> {
  const { maxAttempts = 3, label = 'operation' } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (error instanceof AppwriteException) {
        // Retry only on transient errors (rate limit, server error, unavailable)
        if ([429, 500, 503].includes(error.code)) {
          const delay = Math.pow(2, attempt - 1) * 500;
          console.warn(`[${label}] Attempt ${attempt}/${maxAttempts} failed (${error.code}). Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      throw error; // Don't retry 4xx client errors
    }
  }
  throw lastError;
}

// Usage:
const items = await withAppwriteRetry(
  () => databases.listDocuments(DB_ID, ITEMS_COLLECTION_ID, queries),
  { label: 'listItems' }
);
```

---

## Example 5: Batch Create with Concurrency Control

```typescript
async function batchCreateItems<T>(
  items: CreateItemInput[],
  ownerId: string,
  databases: Databases,
  concurrency = 5
): Promise<Item[]> {
  const results: Item[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const created = await Promise.all(
      batch.map(item =>
        databases.createDocument(
          DB_ID, ITEMS_COLLECTION_ID, ID.unique(),
          { ...item, ownerId, isActive: true },
          [Permission.read(Role.any()), Permission.write(Role.user(ownerId))]
        )
      )
    );
    results.push(...created.map(doc => ItemSchema.parse(doc)));
  }

  return results;
}
```

---

## Example 6: Full-Text Search

```typescript
export const searchItemsFn = createServerFn({ method: 'GET' })
  .validator(z.object({ query: z.string().min(2).max(100) }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    // Requires a fulltext index on 'title' attribute
    const result = await databases.listDocuments(
      DB_ID, ITEMS_COLLECTION_ID,
      [
        Query.equal('ownerId', user.$id),
        Query.search('title', data.query),
        Query.equal('isActive', true),
        Query.isNull('deletedAt'),
        Query.limit(20),
      ]
    );

    return result.documents.map(d => ItemSchema.parse(d));
  });
```
