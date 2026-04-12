# Appwrite Appwrite Query Cookbook — All Query Patterns

---

## The Query API — Full Reference

```typescript
import { Query } from 'node-appwrite';

// FILTERING
Query.equal('field', value)              // field == value
Query.notEqual('field', value)           // field != value
Query.greaterThan('field', value)        // field > value
Query.greaterThanEqual('field', value)   // field >= value
Query.lessThan('field', value)           // field < value
Query.lessThanEqual('field', value)      // field <= value
Query.between('field', a, b)            // a <= field <= b

// NULL CHECKS
Query.isNull('field')                   // field IS NULL
Query.isNotNull('field')                // field IS NOT NULL

// ARRAY OPERATIONS
Query.contains('field', value)          // field array contains value
Query.contains('field', [v1, v2])       // field array contains any of [v1, v2]

// STRING OPERATIONS
Query.startsWith('field', 'prefix')     // field STARTS WITH 'prefix'
Query.endsWith('field', 'suffix')       // field ENDS WITH 'suffix'
Query.search('field', 'term')           // FULLTEXT SEARCH on 'field' (requires fulltext index)

// DOCUMENT ID OPERATIONS
Query.equal('$id', id)                  // Specific document by ID
Query.notEqual('$id', id)              // Exclude a specific document

// PAGINATION
Query.limit(n)                          // Return at most n documents
Query.offset(n)                         // Skip first n documents
Query.cursorAfter(documentId)           // Cursor-based pagination: after this doc
Query.cursorBefore(documentId)          // Cursor-based pagination: before this doc

// ORDERING
Query.orderAsc('field')                 // Ascending (A→Z, 0→9, oldest→newest)
Query.orderDesc('field')                // Descending (Z→A, 9→0, newest→oldest)

// FIELD SELECTION (reduce payload size)
Query.select(['field1', 'field2'])      // Return only these fields (+ $id, $collectionId)
Query.select(['$id', 'title', 'status']) // Common: only what the UI needs

// OR LOGIC (Appwrite 1.4+)
Query.or([
  Query.equal('status', 'draft'),
  Query.equal('status', 'published'),
])

// AND LOGIC (default — compose multiple queries in the array)
const queries = [
  Query.equal('ownerId', userId),     // AND
  Query.equal('category', 'tech'),    // AND
];
```

---

## Pattern 1: Paginated List (Offset-Based)

```typescript
export async function listItemsPaginated(
  databases: Databases,
  ownerId: string,
  page: number,
  pageSize = 20
) {
  const result = await databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.isNull('deletedAt'),
    Query.orderDesc('$createdAt'),
    Query.limit(pageSize),
    Query.offset(page * pageSize),
  ]);

  return {
    items: result.documents,
    total: result.total,
    hasNextPage: (page + 1) * pageSize < result.total,
    hasPrevPage: page > 0,
  };
}
```

---

## Pattern 2: Cursor Pagination (for Infinite Scroll)

```typescript
export async function listItemsCursor(
  databases: Databases,
  ownerId: string,
  cursor?: string,
  limit = 20
) {
  const queries = [
    Query.equal('ownerId', ownerId),
    Query.isNull('deletedAt'),
    Query.orderDesc('$createdAt'),
    Query.limit(limit + 1), // Fetch one extra to detect hasMore
  ];
  if (cursor) queries.push(Query.cursorAfter(cursor));

  const result = await databases.listDocuments(DB_ID, ITEMS_COLLECTION, queries);
  const hasMore = result.documents.length > limit;

  return {
    items: result.documents.slice(0, limit),
    nextCursor: hasMore ? result.documents[limit - 1].$id : null,
  };
}
```

---

## Pattern 3: Full-Text Search with User Scope

```typescript
export async function searchItems(databases: Databases, ownerId: string, query: string) {
  // Requires: fulltext index on 'title' in Appwrite dashboard
  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.isNull('deletedAt'),
    Query.search('title', query),          // Fulltext search — tokenized
    Query.orderDesc('$createdAt'),
    Query.limit(25),
  ]);
}
```

---

## Pattern 4: Compound Filter

```typescript
export async function listPublishedByCategory(
  databases: Databases,
  ownerId: string,
  category: string,
  dateFrom?: Date
) {
  const queries = [
    Query.equal('ownerId', ownerId),
    Query.equal('status', 'published'),
    Query.equal('category', category),
    Query.isNull('deletedAt'),
    Query.orderDesc('$updatedAt'),
    Query.limit(50),
  ];

  if (dateFrom) {
    queries.push(Query.greaterThanEqual('$createdAt', dateFrom.toISOString()));
  }

  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, queries);
}
```

---

## Pattern 5: Projection (Return Only Needed Fields)

```typescript
// Only fetch the fields needed for a list view — dramatically reduces payload
export async function listItemSummaries(databases: Databases, ownerId: string) {
  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.equal('isActive', true),
    Query.isNull('deletedAt'),
    Query.orderDesc('$createdAt'),
    Query.limit(100),
    Query.select(['$id', '$createdAt', 'title', 'status', 'category']), // 5 fields only
  ]);
}
```

---

## Pattern 6: Count Only

```typescript
// Get just the count — no document data transferred
export async function countUserItems(databases: Databases, ownerId: string): Promise<number> {
  const result = await databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.isNull('deletedAt'),
    Query.limit(1),          // We don't want documents
    Query.select(['$id']),   // Minimal data
  ]);
  return result.total; // Total count ignores limit
}
```

---

## Pattern 7: OR Queries

```typescript
// Items that are either draft OR archived (not published)
export async function listNonPublished(databases: Databases, ownerId: string) {
  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.isNull('deletedAt'),
    Query.or([
      Query.equal('status', 'draft'),
      Query.equal('status', 'archived'),
    ]),
    Query.orderDesc('$updatedAt'),
    Query.limit(50),
  ]);
}
```

---

## Pattern 8: Array Contains

```typescript
// Items tagged with specific tags (stored as string[] attribute)
export async function listByTag(databases: Databases, ownerId: string, tag: string) {
  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.contains('tags', tag),      // tags: string[] attribute
    Query.isNull('deletedAt'),
    Query.orderDesc('$createdAt'),
    Query.limit(50),
  ]);
}
```

---

## Pattern 9: Date Range Query

```typescript
export async function listItemsInDateRange(
  databases: Databases,
  ownerId: string,
  from: Date,
  to: Date
) {
  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('ownerId', ownerId),
    Query.between('$createdAt', from.toISOString(), to.toISOString()),
    Query.orderAsc('$createdAt'),
    Query.limit(100),
  ]);
}
```

---

## Pattern 10: Exclude Specific IDs

```typescript
// Get items similar to a given one, excluding it
export async function listSimilarItems(databases: Databases, itemId: string, category: string) {
  return databases.listDocuments(DB_ID, ITEMS_COLLECTION, [
    Query.equal('category', category),
    Query.equal('status', 'published'),
    Query.notEqual('$id', itemId),     // Exclude the current item
    Query.isNull('deletedAt'),
    Query.limit(5),
  ]);
}
```

---

## Query Limits — Important Gotchas

```typescript
// ❌ Appwrite maximum: Query.limit(n) max is 5000
// ❌ Never use offset for large datasets — performance degrades
//    Use cursor pagination (cursorAfter) instead

// ❌ Cannot combine Query.search() with Query.orderDesc() in all versions
//    Check your Appwrite version — this was fixed in 1.4+

// ❌ Fulltext index required for Query.search() — will fail without it

// ✅ Combine multiple Query.* in an array — they all apply as AND
// ✅ Maximum 15 queries per request (Appwrite hard limit)
// ✅ For complex OR logic: run parallel queries and merge results client-side

// ANTI-PATTERN: Fetching all and filtering in memory
const all = await databases.listDocuments(DB_ID, COLLECTION, [Query.limit(5000)]);
const filtered = all.documents.filter(d => d.category === 'tech'); // ❌ Never do this

// CORRECT: Filter in the query
const filtered = await databases.listDocuments(DB_ID, COLLECTION, [
  Query.equal('category', 'tech'), // ✅ Server-side filter
  Query.limit(50),
]);
```
