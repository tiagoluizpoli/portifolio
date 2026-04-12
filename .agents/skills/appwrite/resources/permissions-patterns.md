# Appwrite Permissions — Extended Pattern Reference

---

## The Permission Model Fundamentals

Appwrite has **two levels** of permissions:

1. **Collection-level**: Default permissions applied when a document is created without explicit permissions
2. **Document-level**: Per-document overrides — always take precedence

**Rule**: Always specify document-level permissions on every `createDocument` call. Never rely solely on collection defaults.

---

## Permission Builder Reference

```typescript
import { Permission, Role } from 'node-appwrite';

// --- ROLES ---
Role.any()                         // All users (guests + authenticated)
Role.guests()                      // Only unauthenticated users
Role.users()                       // All authenticated users (any provider)
Role.users('email')                // Only email-verified users
Role.users('phone')                // Only phone-verified users
Role.user('userId')                // Specific user by ID
Role.user('userId', 'verified')    // Specific user, only if verified
Role.team('teamId')                // All members of a team
Role.team('teamId', 'role')        // Members of a team with specific role
Role.member('membershipId')        // Specific team membership
Role.label('labelName')            // Users with a specific label

// --- PERMISSIONS ---
Permission.read(role)              // Can list and get documents
Permission.create(role)            // Can create documents (collection-level only)
Permission.update(role)            // Can update existing documents
Permission.delete(role)            // Can delete documents
Permission.write(role)             // Shorthand: create + update + delete
```

---

## 12 Common Permission Scenarios

### 1. Public Portfolio Item (Default Pattern)
```typescript
// Visible to everyone, editable by owner only
[
  Permission.read(Role.any()),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```

### 2. Private Draft (Only Owner Can See)
```typescript
[
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```

### 3. Shared Team Document
```typescript
// Entire team can read + update; only admins can delete
[
  Permission.read(Role.team(teamId)),
  Permission.update(Role.team(teamId)),
  Permission.delete(Role.team(teamId, 'admin')),
]
```

### 4. Admin-Managed Public Content
```typescript
// Public reads; only admin team can write
[
  Permission.read(Role.any()),
  Permission.write(Role.team('admin')),
]
```

### 5. Authenticated Users Only (Login Required to Read)
```typescript
[
  Permission.read(Role.users()),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```

### 6. Owner + Moderator Can Edit
```typescript
[
  Permission.read(Role.any()),
  Permission.update(Role.user(userId)),
  Permission.update(Role.team('moderators')),
  Permission.delete(Role.team('admin')),
]
```

### 7. Publicly Shareable Link (Specific Guest Token)
```typescript
// Note: Appwrite doesn't natively support shared tokens.
// Pattern: Create a "share" document with its own permissions,
// and serve the content through that document's auth.
// The share document itself:
[
  Permission.read(Role.any()),          // Anyone with the link can read
  Permission.delete(Role.user(userId)), // Only owner can revoke
]
```

### 8. Verified Users Only
```typescript
// Only users who have verified their email
[
  Permission.read(Role.users('email')),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]
```

### 9. Read-Only Archive (No One Can Delete)
```typescript
[
  Permission.read(Role.any()),
  // No delete or update permissions — immutable archive
]
```

### 10. Soft Delete Trash Document
```typescript
// In trash collection — only owner can see and restore
[
  Permission.read(Role.user(userId)),
  Permission.delete(Role.user(userId)), // Deleting = permanent purge
]
```

### 11. File Upload (Bucket Permissions)
```typescript
// Resume: public to view (for portfolio), only owner can delete
await storage.createFile(BUCKET_ID, ID.unique(), file, [
  Permission.read(Role.any()),
  Permission.delete(Role.user(userId)),
]);

// Private file: only owner
await storage.createFile(BUCKET_ID, ID.unique(), file, [
  Permission.read(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]);
```

### 12. Audit Log (Append-Only)
```typescript
// Anyone can create (for tracking), no one can update or delete
await databases.createDocument(DB_ID, AUDIT_COLLECTION, ID.unique(), event, [
  Permission.create(Role.users()), // Authenticated users can append
  // No update, no delete — permanent record
]);
```

---

## Collection-Level Defaults (Recommended Setup)

Set these in the Appwrite console or via migration for each collection:

```typescript
// In migration — set collection permissions
await databases.updateCollection(
  DATABASE_ID,
  SKILLS_COLLECTION_ID,
  'Skills',
  [
    Permission.create(Role.users()),  // Any authenticated user can create new docs
    // (Documents will have their own read/update/delete permissions)
  ],
  false, // documentSecurity: true (enable document-level override)
  true   // enabled
);
```

**documentSecurity: true** is required to allow document-level permissions to take effect.

---

## Permission Anti-Patterns (Never Do These)

```typescript
// ❌ NEVER: No permissions (inherits collection — may be too permissive)
await databases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), data);

// ❌ NEVER: Allow any user to write user data
[Permission.write(Role.users())]
// This means ANY authenticated user can modify ANY document

// ❌ NEVER: Skip document-level permissions on sensitive data
// Always specify. Always.

// ❌ NEVER: Rely only on client-side permission checks
if (skill.userId === currentUser.id) showEditButton();
// The edit button can be bypassed. Enforce on the server function too.
```
