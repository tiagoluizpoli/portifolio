# Appwrite 2026 Migration & Integration Guidelines (v1.1.0)

Follow these standards for all Appwrite-based infrastructure and data operations. **Zero-tolerance for deprecated positional arguments.**

## 1. Core Principles
- **Object Parameter Style**: ABSOLUTELY ALL service methods MUST use the object parameter pattern `{ key: value }`.
- **Exclusive TablesDB**: The `Databases` service is deprecated for all portfolio operations. Use `TablesDB`.
- **Shared Core Implementation**: No Appwrite SDK code is allowed in `apps/`. ALL interactions must go through `packages/appwrite-core` repositories.

## 2. Databases & TablesDB
### 2.1 Database Selection
```typescript
// Modern Object Style
const db = await tables.get({ databaseId: 'portfolio' });
```

### 2.2 Table & Column Lifecycle
- **Step 1: Create Table**
```typescript
await tables.createTable({
  tableId: ID.unique(),
  name: 'Experience',
  databaseId: 'portfolio',
});
```
- **Step 2: Create Columns (Async)**
```typescript
await tables.createStringColumn({
  databaseId: 'portfolio',
  tableId: 'experience',
  key: 'title',
  size: 255,
  required: true,
});
```
- **Step 3: Poll for Readiness**
You MUST wait for attributes to be `available` before inserting data.

### 2.3 Transactions (Mandatory for Ingestion)
```typescript
const tx = await tables.createTransaction({
  databaseId: 'portfolio',
});

try {
  await tables.upsertRow({
    databaseId: 'portfolio',
    tableId: 'experience',
    rowId: 'unique-slug',
    data: { ... },
  });
  await tables.updateTransaction({
    databaseId: 'portfolio',
    transactionId: tx.$id,
    commit: true,
  });
} catch (e) {
  await tables.updateTransaction({
    databaseId: 'portfolio',
    transactionId: tx.$id,
    rollback: true,
  });
}
```

## 3. Storage Management
### 3.1 Bucket Lifecycle
```typescript
await storage.createBucket({
  bucketId: 'assets',
  name: 'Portfolio Assets',
  permissions: [Permission.read(Role.any())],
  fileSecurity: true,
});
```

### 3.2 File Operations
```typescript
await storage.createFile({
  bucketId: 'assets',
  fileId: ID.unique(),
  file: InputFile.fromPath('path/to/file.png', 'file.png'),
});
```

## 4. Configuration & Security
- **Fail-Fast Validation**: Use Zod to validate all `APPWRITE_*` environment variables at startup.
- **SSR Safety**: Appwrite Client-side SDK is prohibited. All operations reside in TanStack Start `createServerFn` or server-side repositories.
- **Biome Gating**: `@repo/appwrite-core` must maintain a zero-warning state on all Appwrite-related code.

## 5. Implementation Checklist for 2026 Compliance
- [ ] Are all method calls using `{}` parameter style?
- [ ] Is `TablesDB` used instead of `Databases`?
- [ ] Is there a polling mechanism for async attributes?
- [ ] Is there transaction logic for multi-row updates?
- [ ] Is the code isolated in `packages/appwrite-core`?
