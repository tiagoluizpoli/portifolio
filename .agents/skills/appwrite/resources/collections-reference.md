# Appwrite Collections Design Guide

How to design, create, and maintain Appwrite database collections in any project.

---

## Database Architecture Planning

Before writing any code, map your domain into collections:

```
Database: [your-project-name]
├── users-profile     ← Extended user data (beyond Appwrite account)
├── posts             ← Main content entity
├── comments          ← Belongs to posts
├── tags              ← Many-to-many join (posts ↔ tags)
├── assets            ← File metadata (storage file IDs)
├── audit-log         ← Append-only operation history
└── trash             ← Soft-deleted document metadata
```

**Decision checklist for each collection:**
- [ ] What are the read/write access patterns?
- [ ] Who owns the documents? (user, team, or public)
- [ ] What indexes are needed for the expected queries?
- [ ] Does this need soft-delete? (almost always yes)
- [ ] Is this a singleton per user or many per user?
- [ ] What are the max cardinalities? (affects index choice)

---

## Attribute Types — Full Reference

```typescript
// STRING — for text fields with a max character limit
await databases.createStringAttribute(
  DB_ID, COLLECTION_ID,
  'name',       // attribute key
  255,          // maxLength
  true,         // required
  null,         // default (null = no default)
  false,        // array (true = array of strings)
);

// INTEGER — whole numbers
await databases.createIntegerAttribute(
  DB_ID, COLLECTION_ID,
  'level',
  true,         // required
  1,            // min
  100,          // max
  5,            // default
);

// FLOAT — decimal numbers
await databases.createFloatAttribute(DB_ID, COLLECTION_ID, 'rating', false, 0.0, 5.0, 0.0);

// BOOLEAN
await databases.createBooleanAttribute(DB_ID, COLLECTION_ID, 'isPublished', false, false);

// DATETIME — ISO 8601 string stored as datetime
await databases.createDatetimeAttribute(DB_ID, COLLECTION_ID, 'publishedAt', false);

// EMAIL — validates email format
await databases.createEmailAttribute(DB_ID, COLLECTION_ID, 'contactEmail', false);

// URL — validates URL format
await databases.createUrlAttribute(DB_ID, COLLECTION_ID, 'website', false);

// IP — validates IP address
await databases.createIpAttribute(DB_ID, COLLECTION_ID, 'lastLoginIp', false);

// ENUM — validated set of string values
await databases.createEnumAttribute(
  DB_ID, COLLECTION_ID,
  'status',
  ['draft', 'published', 'archived'], // allowed values
  true,          // required
  'draft',       // default
);
```

---

## Collection Design Patterns

### Pattern 1: Standard Content Document

```typescript
// Generic content document (blog post, article, page, etc.)

// Appwrite Attributes:
// Name          Type      Required  Notes
// ownerId       string    YES       36 chars — Appwrite user $id
// title         string    YES       255 chars
// slug          string    YES       255 chars — unique per owner
// content       string    NO        65535 chars (Appwrite max for string)
// status        enum      YES       'draft' | 'published' | 'archived'
// publishedAt   datetime  NO        null until published
// isDeleted     boolean   NO        false — soft delete sentinel
// deletedAt     string    NO        ISO date string when soft-deleted

// Indexes:
// [ownerId] — key (list all documents by owner)
// [ownerId, status] — key (list by status)
// [slug] — unique (prevent duplicate slugs globally)
// title — fulltext (search)

// Zod Schema
export const ContentSchema = z.object({
  $id: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  ownerId: z.string(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().max(65535).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.string().nullable().optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.string().nullable().optional(),
});

export type Content = z.infer<typeof ContentSchema>;
```

### Pattern 2: Singleton Per User

```typescript
// One document per user — profile, settings, preferences
// The key design decision: use userId as the document ID

// Option A: userId AS the document ID (simpler lookup)
await databases.createDocument(DB_ID, COLLECTION_ID, user.$id, data, permissions);
// Then: getDocument(DB_ID, COLLECTION_ID, user.$id) — O(1), no index needed

// Option B: ownerId as attribute + unique index (more flexible)
await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), { ...data, ownerId: user.$id }, permissions);
// Requires: unique index on [ownerId]
// Use when: you need other unique constraints or plan to transfer ownership

// Singleton upsert:
async function upsertUserProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  try {
    // Try to get by userId as document ID (Option A)
    const existing = await databases.getDocument(DB_ID, PROFILE_COLLECTION, userId);
    const updated = await databases.updateDocument(DB_ID, PROFILE_COLLECTION, userId, data);
    return ProfileSchema.parse(updated);
  } catch (e) {
    if (e instanceof AppwriteException && e.code === 404) {
      // First time — create it
      const doc = await databases.createDocument(
        DB_ID, PROFILE_COLLECTION, userId,
        { ...data, ownerId: userId },
        [Permission.read(Role.any()), Permission.update(Role.user(userId))]
      );
      return ProfileSchema.parse(doc);
    }
    throw e;
  }
}
```

### Pattern 3: Ordered List (with Reorder Support)

```typescript
// Documents that have a user-defined display order
// Attributes include: order (integer, default 0)

// Creating ordered item at the end:
async function appendOrderedItem(collectionId: string, data: object, userId: string): Promise<void> {
  // Get current max order
  const existing = await databases.listDocuments(DB_ID, collectionId, [
    Query.equal('ownerId', userId),
    Query.orderDesc('order'),
    Query.limit(1),
    Query.select(['order']),
  ]);
  const nextOrder = existing.documents.length > 0
    ? (existing.documents[0]['order'] as number) + 1
    : 0;

  await databases.createDocument(DB_ID, collectionId, ID.unique(),
    { ...data, ownerId: userId, order: nextOrder },
    [Permission.read(Role.any()), Permission.write(Role.user(userId))]
  );
}

// Reordering (after drag-and-drop):
async function reorderItems(
  collectionId: string,
  orderedIds: string[],
  ownerId: string,
  databases: Databases
): Promise<void> {
  // Validate ownership of all items first
  const docs = await Promise.all(orderedIds.map(id => databases.getDocument(DB_ID, collectionId, id)));
  if (docs.some(d => d['ownerId'] !== ownerId)) throw new Error('Forbidden');

  // Update order in parallel
  await Promise.all(
    orderedIds.map((id, idx) => databases.updateDocument(DB_ID, collectionId, id, { order: idx }))
  );
}
```

### Pattern 4: Many-to-Many (Tags / Labels)

```typescript
// Appwrite doesn't have JOIN queries — implement M2M with a junction collection
// or store an array of IDs on one side (works for small sets)

// Option A: Array attribute (for small, fixed sets)
// Post has: tagIds: string[] (array of tag document IDs)
await databases.createStringAttribute(DB_ID, POSTS_COLLECTION, 'tagIds', 50, false, null, true /* array */);
// Query: Query.contains('tagIds', 'tag-id-abc')

// Option B: Junction collection (for large, queryable relationships)
// post_tags: { postId, tagId, addedAt }
// Indexes: [postId], [tagId]
// To get all tags for a post: listDocuments where postId = '...'
// To get all posts with a tag: listDocuments where tagId = '...'
```

---

## Index Design Guide

```typescript
// KEY index — for equality and range queries
await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_owner', 'key', ['ownerId']);

// Compound KEY — for filtered lists
await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_owner_status', 'key', ['ownerId', 'status']);

// UNIQUE — enforce uniqueness
await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_slug_unique', 'unique', ['slug']);

// Compound UNIQUE — unique within a scope
await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_owner_slug', 'unique', ['ownerId', 'slug']);

// FULLTEXT — for text search (only on string attributes)
await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_title_ft', 'fulltext', ['title']);

// ORDERING index — for consistent sort performance
await databases.createIndex(DB_ID, COLLECTION_ID, 'idx_created_desc', 'key', ['$createdAt'], ['DESC']);
```

**Index rules:**
- Every `Query.equal('field', ...)` needs a key index on that field
- Every `Query.search('field', ...)` needs a fulltext index
- Compound indexes must match the exact field order in your queries
- Too many indexes slow down writes — only index what you query

---

## Environment Variables Pattern (Generic)

```bash
# .env (server-only)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-server-api-key

# Generated from your schema design — one var per collection/bucket
DATABASE_ID=your-database-id
POSTS_COLLECTION_ID=posts
COMMENTS_COLLECTION_ID=comments
PROFILE_COLLECTION_ID=user-profiles
ASSETS_BUCKET_ID=assets

# Local development override (.env.local)
APPWRITE_ENDPOINT=http://localhost/v1
```

```typescript
// constants.ts — validate at startup, fail fast
export const DB_ID = process.env['DATABASE_ID'];
if (!DB_ID) throw new Error('DATABASE_ID environment variable is required');

// Pattern: env var → constant → use the constant everywhere
// Never inline process.env strings in business logic
```
