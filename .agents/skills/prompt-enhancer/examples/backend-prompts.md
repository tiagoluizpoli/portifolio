# Backend Prompt Examples — Infrastructure Transformations

---

## Example 1: Auth Flow Fix

### User Input
> "fix the appwrite login"

### Enhanced Output

```markdown
# Refactor Appwrite Authentication Flow — Session Management

## Context
The Appwrite login flow has issues — likely using deprecated methods or missing
proper error handling. Need to align with SDK v22.1.3 patterns.

## Specialists Engaged
- **appwrite**: SDK v22.1.3 patterns, session management, error handling

## Technical Requirements
1. Replace deprecated `createSession` with `createEmailPasswordSession`.
2. Implement Zod validation for email/password inputs BEFORE calling Appwrite.
3. All Appwrite errors caught and re-thrown as typed `AppwriteException`.
4. Session stored via `account.getSession('current')` after login.
5. Add proper logout: `account.deleteSession('current')`.

## Scope
- **WILL change**: Auth function implementations in `auth.functions.ts`
- **MUST NOT change**: Auth UI components, form validation schemas, routing logic

## Success Criteria
- [ ] Login succeeds with valid credentials
- [ ] Login fails gracefully with invalid credentials (proper error message)
- [ ] Session persists across page refreshes
- [ ] Logout clears session completely
- [ ] `pnpm guard` passes

## Governance
- Zod validation before every Appwrite call
- Typed error handling (no catch-all)
- Named exports only
```

---

## Example 2: CRUD Operations

### User Input
> "add ability to create and edit skills"

### Enhanced Output

```markdown
# Implement Skills CRUD — Create/Edit Operations

## Context
Skills collection exists in Appwrite but lacks create/edit functionality in the CMS.
Need server functions that handle validation, permission, and optimistic updates.

## Specialists Engaged
- **appwrite**: Collection operations, document permissions, ID generation
- **tanstack-master**: Server functions, query invalidation, optimistic updates
- **react-architect**: Form state management, error boundary

## Technical Requirements
1. **Create**: `databases.createDocument(DB_ID, SKILLS_COLLECTION_ID, ID.unique(), data, permissions)`.
2. **Edit**: `databases.updateDocument(DB_ID, SKILLS_COLLECTION_ID, id, data)`.
3. **Permissions**: Document-level `[Permission.read(Role.any()), Permission.write(Role.user(userId))]`.
4. **Validation**: Zod schema validates BEFORE any Appwrite operation.
5. **Server functions**: TanStack Start server functions with proper error handling.
6. **Cache**: Invalidate `['skills']` query key after mutation.

## Scope
- **WILL change**: New server functions, new/updated form component
- **MUST NOT change**: Skills list display, existing read operations, routing

## Success Criteria
- [ ] Can create a new skill with all required fields
- [ ] Can edit an existing skill
- [ ] Validation errors display inline
- [ ] Query cache updates after mutation
- [ ] Permissions correctly applied
- [ ] `pnpm guard` passes

## Governance
- Zod validation before every mutation
- ID.unique() for new documents
- Document-level permissions always specified
- Named exports only
```

---

## Example 3: Schema Migration

### User Input
> "add a new field to the about collection"

### Enhanced Output

```markdown
# Extend About Collection Schema — Add New Field

## Context
The About collection needs a new field. This requires both an Appwrite schema
migration and TypeScript type updates.

## Specialists Engaged
- **appwrite**: Collection attribute creation, migration strategy

## Technical Requirements
1. Add attribute via migrator: `databases.createStringAttribute(DB_ID, ABOUT_COLLECTION_ID, 'newField', 255, false)`.
2. Update TypeScript type in `types/about.ts` to include the new field.
3. Update Zod schema in `schemas/about.ts` to validate the new field.
4. Update seed data if applicable.
5. Run migration in proper order: schema → types → validation → seed.

## Scope
- **WILL change**: Collection schema, TypeScript types, Zod schema, seed data
- **MUST NOT change**: Existing fields, existing form components, existing queries

## Success Criteria
- [ ] New attribute exists in Appwrite collection
- [ ] TypeScript types match schema exactly
- [ ] Zod schema validates the new field
- [ ] Existing data not corrupted
- [ ] `pnpm guard` passes

## Governance
- Migration is idempotent (can run multiple times safely)
- Types and schema always in sync
- No breaking changes to existing fields
```

---

## Example 4: File Storage

### User Input
> "implement resume upload"

### Enhanced Output

```markdown
# Implement Resume Upload — Appwrite Storage Integration

## Context
Users need to upload PDF resumes to the About section. Requires Appwrite Storage
bucket configuration and file upload UI.

## Specialists Engaged
- **appwrite**: Storage buckets, file upload, file preview URLs
- **react-architect**: File upload component pattern, state management
- **frontend-specialist**: Upload progress, drag-and-drop UX

## Technical Requirements
1. **Bucket**: Create/verify `resumes` bucket with appropriate limits (10MB max, PDF only).
2. **Upload**: `storage.createFile(BUCKET_ID, ID.unique(), file)`.
3. **Preview**: `storage.getFileView(BUCKET_ID, fileId)` for PDF preview.
4. **Delete**: Non-destructive — move to trash bucket before permanent deletion.
5. **Validation**: Client-side file type/size check BEFORE upload.

## Scope
- **WILL change**: New upload component, storage functions, About form integration
- **MUST NOT change**: Existing About form fields, existing save logic

## Success Criteria
- [ ] PDF files upload successfully
- [ ] Non-PDF files rejected with clear error
- [ ] Files > 10MB rejected with clear error
- [ ] Uploaded file preview works
- [ ] Delete moves to trash (non-destructive)
- [ ] `pnpm guard` passes

## Governance
- Zod file validation (type, size) before upload
- Non-destructive deletion always
- Storage URLs generated server-side
```

---

## Example 5: Permission Model

### User Input
> "make metrics only editable by admin"

### Enhanced Output

```markdown
# Restrict Metric Editing — Admin-Only Write Permissions

## Context
Metrics are currently writable by any authenticated user. Need to restrict
write access to admin role only while keeping read access public.

## Specialists Engaged
- **appwrite**: Permission model, Role helpers, team-based access

## Technical Requirements
1. **Read**: `Permission.read(Role.any())` — anyone can view metrics.
2. **Write**: `Permission.write(Role.team('admin'))` — only admin team can edit.
3. **Update existing docs**: Migration to update permissions on existing documents.
4. **UI**: Conditionally render edit buttons based on user's team membership.
5. **Server**: Verify team membership server-side before mutation (defense in depth).

## Scope
- **WILL change**: Document permissions, edit button visibility, server function guards
- **MUST NOT change**: Read access, display components, data format

## Success Criteria
- [ ] Admin users can edit metrics
- [ ] Non-admin users see metrics but cannot edit
- [ ] Edit buttons hidden for non-admin
- [ ] Server rejects non-admin write attempts
- [ ] `pnpm guard` passes

## Governance
- Never trust client-side permission checks alone
- Always verify server-side
- No breaking changes to existing data
```
